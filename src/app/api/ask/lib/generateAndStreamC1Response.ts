import { makeC1Response } from "@thesysai/genui-sdk/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import {
  addUserMessage,
  addAssistantMessage,
  ThreadMessage,
} from "../../cache/threadCache";
import { exaSearch } from "../../services/exaSearch";
import { googleGenAISearch } from "../../services/googleGenAiSearch";
import type { SearchProvider } from "../../types/searchProvider";
import { SYSTEM_PROMPT } from "../systemPrompt";

let _client: OpenAI | null = null;

const getThesysClient = () => {
  const apiKey = process.env.THESYS_API_KEY;
  if (!apiKey) {
    throw new Error("THESYS_API_KEY is required for /api/ask");
  }
  if (!_client) {
    _client = new OpenAI({
      baseURL: "https://api.thesys.dev/v1/embed",
      apiKey,
    });
  }
  return _client;
};


export const EXA_NUM_RESULTS = 5;

// Create executable tool for web search
const createWebSearchTool = (
  searchProvider: SearchProvider,
  c1Response: ReturnType<typeof makeC1Response>,
  signal: AbortSignal
) => [
  {
    type: "function" as const,
    function: {
      name: "webSearch",
      description: `Search the web using ${searchProvider === "exa" ? "Exa" : "Gemini"} to get high-quality search results with full content`,
      parse: JSON.parse,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to perform",
          },
        },
        required: ["query"],
      },
      function: async (args: { query: string }) => {
        c1Response.writeThinkItem({
          title: `Searching with ${searchProvider === "exa" ? "Exa" : "Gemini"}`,
          description: `Retrieving high-quality web results with ${searchProvider === "exa" ? "full content analysis" : "AI-powered search"}`,
        });

        if (searchProvider === "exa") {
          const searchResult = await exaSearch(
            args.query,
            (progress) => {
              c1Response.writeThinkItem({
                title: progress.title,
                description: progress.content,
              });
            },
            signal,
            EXA_NUM_RESULTS
          );
          return JSON.stringify(searchResult);
        } else if (searchProvider === "gemini") {
          const searchResult = await googleGenAISearch(
            args.query,
            [], // threadHistory - not needed for tool execution
            (progress) => {
              c1Response.writeThinkItem({
                title: progress.title,
                description: progress.content,
              });
            },
            signal
          );
          return searchResult;
        } else {
          throw new Error("Unknown search provider");
        }
      },
      strict: true,
    },
  },
];

/**
 * Generates the C1 response and streams it back to the client using tool calls.
 * @param threadId The ID of the thread.
 * @param prompt The user's prompt.
 * @param threadHistory The history of the thread.
 * @param searchProvider The search provider to use.
 * @param c1Response The C1 response object.
 * @param signal The abort signal.
 */
export const generateAndStreamC1Response = async ({
  threadId,
  prompt,
  threadHistory,
  searchProvider,
  c1Response,
  signal,
}: {
  threadId: string;
  prompt: string;
  threadHistory: ThreadMessage[];
  searchProvider: SearchProvider;
  c1Response: ReturnType<typeof makeC1Response>;
  signal: AbortSignal;
}) => {
  c1Response.writeThinkItem({
    title: "Analyzing Request",
    description:
      "Understanding your query and preparing to search for relevant information",
  });

  // Safety net: never leave the UI stuck in a "streaming" state forever.
  // If upstream streaming/tooling hangs, we terminate with a user-visible error.
  const STREAM_TIMEOUT_MS = 90_000;

  // Cache the user message and create assistant message placeholder
  await addUserMessage(threadId, prompt);

  // Build conversation history
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  // Add thread history (excluding any assistant messages that might be in progress)
  for (const msg of threadHistory) {
    if (msg.role === "user") {
      messages.push({
        role: "user",
        content: msg.prompt,
      });
    } else if (msg.c1Response) {
      messages.push({
        role: "assistant",
        content: msg.c1Response,
      });
    }
  }

  // Add current user prompt
  messages.push({
    role: "user",
    content: prompt,
  });

  // Create executable tool based on search provider
  const tools = createWebSearchTool(searchProvider, c1Response, signal);

  let finalC1Response = "";

  const streamAndWrite = async () => {
    // Use runTools for automatic tool execution
    const runner: any = await getThesysClient().beta.chat.completions.runTools({
      model: "c1/anthropic/claude-sonnet-4/v-20250915",
      messages,
      tools,
      stream: true,
    });

    // Preferred: stream chunks (works when runner is async-iterable).
    if (runner && typeof runner[Symbol.asyncIterator] === "function") {
      for await (const chunk of runner as AsyncIterable<any>) {
        if (signal.aborted) break;
        const contentDelta = chunk?.choices?.[0]?.delta?.content || "";
        if (!contentDelta) continue;

        finalC1Response += contentDelta;
        try {
          c1Response.writeContent(contentDelta);
        } catch (error) {
          if (!signal.aborted) console.error("Error writing content:", error);
        }
      }
      return;
    }

    // Fallback: runner APIs (depends on SDK version).
    if (runner && typeof runner.finalChatCompletion === "function") {
      const final = await runner.finalChatCompletion();
      const content = final?.choices?.[0]?.message?.content || "";
      if (content) {
        finalC1Response += content;
        c1Response.writeContent(content);
      }
      return;
    }

    if (runner && typeof runner.finalContent === "function") {
      const content = await runner.finalContent();
      if (content) {
        finalC1Response += content;
        c1Response.writeContent(content);
      }
      return;
    }

    throw new Error(
      "Thesys streaming runner is not iterable and does not support finalization methods",
    );
  };

  try {
    await Promise.race([
      streamAndWrite(),
      new Promise<void>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Response timed out while generating. Please try again in a moment.",
              ),
            ),
          STREAM_TIMEOUT_MS,
        ),
      ),
    ]);

    if (!signal.aborted) {
      await addAssistantMessage(threadId, {
        c1Response: finalC1Response,
      });
    }
  } catch (error) {
    if (!signal.aborted) {
      const message =
        error instanceof Error ? error.message : "Unknown error generating answer";
      console.error("Error streaming C1 response:", error);

      c1Response.writeThinkItem({
        title: "Error",
        description: "An error occurred while generating the answer",
      });
      c1Response.writeContent(
        `I ran into an issue while generating a response: ${message}`,
      );
    }
  } finally {
    try {
      if (!signal.aborted) c1Response.end();
    } catch {
      // ignore end errors if already closed
    }
  }
};
