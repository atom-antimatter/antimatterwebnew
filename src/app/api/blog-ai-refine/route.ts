import { NextResponse } from "next/server";
import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export async function POST(request: Request) {
  try {
    const { message, currentContent, context } = await request.json();

    if (!message || !currentContent) {
      return NextResponse.json(
        { error: "Message and current content are required" },
        { status: 400 }
      );
    }

    // Build context from previous messages
    const contextMessages = context
      ? context.map((msg: any) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        }))
      : [];

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful blog writing assistant. The user has generated a blog post and wants to refine it. Help them make improvements, answer questions, or regenerate specific sections. If they ask for changes to the content, provide the updated HTML.",
        },
        ...contextMessages,
        {
          role: "user",
          content: `Current blog content:\n\n${currentContent}\n\nUser request: ${message}`,
        },
      ],
    });

    const assistantMessage = response.choices[0].message.content || "";

    // Check if the response contains HTML (indicating content update)
    const hasHTMLUpdate = assistantMessage.includes("<h") || assistantMessage.includes("<p>");

    return NextResponse.json({
      response: hasHTMLUpdate
        ? "I've updated the content based on your request."
        : assistantMessage,
      updatedContent: hasHTMLUpdate ? assistantMessage : null,
    });
  } catch (error: any) {
    console.error("Error in blog AI refine:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine content" },
      { status: 500 }
    );
  }
}

