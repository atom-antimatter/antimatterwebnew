import { NextResponse } from "next/server";
import {
  generateBlogContent,
  generateBlogSEO,
  generateBlogHeaderImage,
  searchRelevantImages,
  type BlogResearchResult,
} from "@/lib/blogAIAgent";

export async function POST(request: Request) {
  try {
    const { research, tone, generateHeaderImage: shouldGenerateImage } = await request.json();

    if (!research) {
      return NextResponse.json({ error: "Research data is required" }, { status: 400 });
    }

    const typedResearch: BlogResearchResult = research;

    // Generate content
    const content = await generateBlogContent(typedResearch, tone || "professional");

    // Generate SEO metadata
    const seo = await generateBlogSEO(
      typedResearch.outline.title,
      content.content,
      typedResearch.keywords
    );

    // Generate header image if requested
    let headerImage;
    if (shouldGenerateImage) {
      const imageResult = await generateBlogHeaderImage(typedResearch.topic);
      if ("url" in imageResult) {
        headerImage = imageResult;
      }
    }

    // Get suggested stock images
    const suggestedImages = await searchRelevantImages(typedResearch.keywords.slice(0, 3));

    return NextResponse.json({
      content,
      seo,
      headerImage,
      suggestedImages,
    });
  } catch (error: any) {
    console.error("Error in blog AI generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}




