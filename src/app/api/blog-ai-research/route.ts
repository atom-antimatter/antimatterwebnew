import { NextResponse } from "next/server";
import { researchBlogTopic } from "@/lib/blogAIAgent";

export async function POST(request: Request) {
  try {
    const { topic, existingPages } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const research = await researchBlogTopic(topic, existingPages || []);

    return NextResponse.json(research);
  } catch (error: any) {
    console.error("Error in blog AI research:", error);
    return NextResponse.json(
      { error: error.message || "Failed to research topic" },
      { status: 500 }
    );
  }
}

