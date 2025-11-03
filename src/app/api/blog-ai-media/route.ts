import { NextResponse } from "next/server";
import { searchRelevantImages, searchRelevantVideos, generateBlogHeaderImage } from "@/lib/blogAIAgent";

export async function POST(request: Request) {
  try {
    const { action, keywords, topic } = await request.json();

    switch (action) {
      case "search_images":
        if (!keywords || !Array.isArray(keywords)) {
          return NextResponse.json({ error: "Keywords array is required" }, { status: 400 });
        }
        const images = await searchRelevantImages(keywords);
        return NextResponse.json({ images });

      case "search_videos":
        if (!topic) {
          return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }
        const videos = await searchRelevantVideos(topic);
        return NextResponse.json({ videos });

      case "generate_image":
        if (!topic) {
          return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }
        const generatedImage = await generateBlogHeaderImage(topic);
        if ("error" in generatedImage) {
          return NextResponse.json({ error: generatedImage.error }, { status: 500 });
        }
        return NextResponse.json({ image: generatedImage });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in blog AI media:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process media request" },
      { status: 500 }
    );
  }
}

