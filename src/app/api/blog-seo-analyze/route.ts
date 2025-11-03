import { NextResponse } from "next/server";

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
}

export async function POST(request: Request) {
  try {
    const { title, content, metaDescription, keywords } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const analysis: SEOAnalysis = {
      score: 0,
      issues: [],
      suggestions: [],
      strengths: [],
    };

    let score = 0;

    // Analyze title (10 points)
    if (title.length >= 50 && title.length <= 60) {
      score += 10;
      analysis.strengths.push("Title length is optimal (50-60 characters)");
    } else if (title.length < 50) {
      analysis.issues.push("Title is too short (< 50 characters)");
      analysis.suggestions.push("Expand title to 50-60 characters for better SEO");
    } else {
      analysis.issues.push("Title is too long (> 60 characters)");
      analysis.suggestions.push("Shorten title to 50-60 characters");
    }

    // Analyze meta description (10 points)
    if (metaDescription && metaDescription.length >= 150 && metaDescription.length <= 160) {
      score += 10;
      analysis.strengths.push("Meta description length is optimal");
    } else if (!metaDescription) {
      analysis.issues.push("Missing meta description");
      analysis.suggestions.push("Add a compelling meta description (150-160 characters)");
    } else if (metaDescription.length < 150) {
      analysis.issues.push("Meta description is too short");
      analysis.suggestions.push("Expand meta description to 150-160 characters");
    }

    // Analyze content length (15 points)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 800 && wordCount <= 2000) {
      score += 15;
      analysis.strengths.push(`Content length is good (${wordCount} words)`);
    } else if (wordCount < 800) {
      analysis.issues.push(`Content is too short (${wordCount} words)`);
      analysis.suggestions.push("Aim for 800-2000 words for better SEO");
    } else {
      score += 10;
      analysis.suggestions.push("Consider breaking long content into multiple posts");
    }

    // Analyze headings (15 points)
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
    
    if (h2Count >= 3 && h2Count <= 6) {
      score += 10;
      analysis.strengths.push(`Good chapter structure (${h2Count} H2 headings)`);
    } else if (h2Count < 3) {
      analysis.issues.push("Not enough chapter headings (H2)");
      analysis.suggestions.push("Add 3-6 H2 headings to structure your content");
    }

    if (h3Count >= 2) {
      score += 5;
      analysis.strengths.push(`Good section structure (${h3Count} H3 headings)`);
    }

    // Analyze keywords (20 points)
    if (keywords && Array.isArray(keywords) && keywords.length >= 5) {
      score += 10;
      analysis.strengths.push(`Good keyword coverage (${keywords.length} keywords)`);
      
      // Check if keywords appear in content
      const contentLower = content.toLowerCase();
      const keywordsInContent = keywords.filter((kw: string) =>
        contentLower.includes(kw.toLowerCase())
      );
      
      if (keywordsInContent.length >= Math.floor(keywords.length * 0.7)) {
        score += 10;
        analysis.strengths.push("Most keywords appear in content");
      } else {
        analysis.suggestions.push("Incorporate more target keywords naturally into content");
      }
    } else {
      analysis.issues.push("Not enough target keywords");
      analysis.suggestions.push("Define 5-8 target keywords for SEO");
    }

    // Analyze images (10 points)
    const imgCount = (content.match(/<img[^>]*>/gi) || []).length;
    if (imgCount >= 2) {
      score += 10;
      analysis.strengths.push(`Good visual content (${imgCount} images)`);
    } else if (imgCount === 1) {
      score += 5;
      analysis.suggestions.push("Add more images to break up text and improve engagement");
    } else {
      analysis.issues.push("No images in content");
      analysis.suggestions.push("Add at least 2-3 relevant images");
    }

    // Analyze links (10 points)
    const linkCount = (content.match(/<a[^>]*>/gi) || []).length;
    if (linkCount >= 3) {
      score += 10;
      analysis.strengths.push(`Good link structure (${linkCount} links)`);
    } else {
      analysis.suggestions.push("Add more internal and external links for better SEO");
    }

    // Analyze readability (10 points)
    const avgWordsPerSentence = wordCount / (content.split(/[.!?]+/).length || 1);
    if (avgWordsPerSentence <= 20) {
      score += 10;
      analysis.strengths.push("Good readability (short sentences)");
    } else {
      analysis.suggestions.push("Break up long sentences for better readability");
    }

    analysis.score = Math.min(score, 100);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing SEO:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}




