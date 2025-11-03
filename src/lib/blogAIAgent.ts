import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BlogResearchResult {
  topic: string;
  outline: {
    title: string;
    sections: Array<{
      heading: string;
      keyPoints: string[];
      level: number;
    }>;
  };
  keywords: string[];
  relatedTopics: string[];
  suggestedImages: string[];
  suggestedVideos: string[];
}

export interface BlogContentResult {
  content: string;
  chapters: Array<{
    id: string;
    title: string;
    level: number;
  }>;
  internalLinks: string[];
  externalSources: string[];
}

export interface BlogSEOResult {
  title: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  readingTime: number;
}

/**
 * Research a topic and generate a comprehensive outline
 */
export async function researchBlogTopic(
  topic: string,
  existingPages: string[] = []
): Promise<BlogResearchResult> {
  const systemPrompt = `You are an expert blog researcher and content strategist. Your task is to research a topic and create a comprehensive blog post outline with SEO optimization in mind.

Guidelines:
- Create engaging, informative content that provides real value
- Structure content with clear H2 chapters and H3 subsections
- Suggest 5-8 relevant keywords for SEO
- Recommend related topics for internal linking
- Suggest image and video concepts (no specific URLs yet)
- Keep content focused and well-organized

Available internal pages for linking: ${existingPages.join(", ")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Research and create a comprehensive blog post outline for: "${topic}"
        
Please provide:
1. A compelling blog post title
2. A structured outline with H2 chapters (4-6 chapters) and H3 subsections
3. Key points to cover in each section
4. 5-8 SEO keywords
5. Related topics from available pages that could be linked
6. Suggested types of images or illustrations needed
7. Suggested YouTube video topics that would complement the content

Format as JSON with this structure:
{
  "title": "Blog Post Title",
  "outline": {
    "sections": [
      {
        "heading": "Chapter Heading",
        "level": 2,
        "keyPoints": ["point1", "point2"]
      }
    ]
  },
  "keywords": ["keyword1", "keyword2"],
  "relatedTopics": ["topic1", "topic2"],
  "suggestedImages": ["image concept 1", "image concept 2"],
  "suggestedVideos": ["video topic 1"]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    topic,
    outline: {
      title: result.title || topic,
      sections: result.outline?.sections || [],
    },
    keywords: result.keywords || [],
    relatedTopics: result.relatedTopics || [],
    suggestedImages: result.suggestedImages || [],
    suggestedVideos: result.suggestedVideos || [],
  };
}

/**
 * Generate full blog content from research outline
 */
export async function generateBlogContent(
  research: BlogResearchResult,
  tone: "professional" | "casual" | "technical" = "professional"
): Promise<BlogContentResult> {
  const systemPrompt = `You are an expert blog writer specializing in ${tone} content about AI, technology, and digital solutions. Write engaging, informative, and SEO-optimized blog posts.

Guidelines:
- Write in a clear, ${tone} tone
- Use proper HTML heading tags (h2 for chapters, h3 for subsections)
- Include relevant examples and explanations
- Write 800-1500 words total
- Use markdown for formatting (bold, italic, lists, links)
- Add placeholders for images: <img src="IMAGE_PLACEHOLDER" alt="description" />
- Suggest internal links where relevant using markdown: [text](/page-url)
- Keep paragraphs concise (2-4 sentences)
- Use bullet points and numbered lists for clarity`;

  const outlineText = research.outline.sections
    .map(
      (section) =>
        `${section.level === 2 ? "## " : "### "}${section.heading}\n${section.keyPoints.map((p) => `- ${p}`).join("\n")}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Write a complete blog post based on this outline:

Title: ${research.outline.title}

Outline:
${outlineText}

Keywords to naturally incorporate: ${research.keywords.join(", ")}

Write the full article in HTML format with proper heading tags, paragraphs, and formatting. Include image placeholders where relevant.`,
      },
    ],
  });

  const content = response.choices[0].message.content || "";
  
  // Extract chapters from generated content
  const chapters = extractChaptersFromHTML(content);
  
  // Extract any internal links mentioned
  const internalLinks = extractInternalLinks(content);
  
  // Extract external sources if any
  const externalSources: string[] = [];

  return {
    content,
    chapters,
    internalLinks,
    externalSources,
  };
}

/**
 * Generate SEO metadata for blog post
 */
export async function generateBlogSEO(
  title: string,
  content: string,
  keywords: string[]
): Promise<BlogSEOResult> {
  const systemPrompt = `You are an SEO expert. Generate optimized metadata for blog posts.

Guidelines:
- Create compelling, click-worthy titles (50-60 characters)
- Write meta descriptions that encourage clicks (150-160 characters)
- Select 5-8 most relevant keywords
- Generate URL-friendly slugs
- Calculate accurate reading time`;

  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate SEO metadata for this blog post:

Title: ${title}
Keywords: ${keywords.join(", ")}
Content preview: ${content.substring(0, 500)}...

Provide as JSON:
{
  "title": "Optimized title",
  "metaDescription": "Compelling meta description",
  "keywords": ["keyword1", "keyword2"],
  "slug": "url-friendly-slug"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  return {
    title: result.title || title,
    metaDescription: result.metaDescription || "",
    keywords: result.keywords || keywords,
    slug: result.slug || generateSlug(title),
    readingTime,
  };
}

/**
 * Generate a blog header image using DALL-E
 */
export async function generateBlogHeaderImage(
  topic: string,
  style: string = "modern, professional, tech-focused"
): Promise<{ url: string; prompt: string } | { error: string }> {
  try {
    const prompt = `Create a professional blog header image for an article about "${topic}". Style: ${style}. High quality, modern design, suitable for a tech blog. No text in image.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
    });

    return {
      url: response.data[0].url || "",
      prompt,
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    return { error: error.message || "Failed to generate image" };
  }
}

/**
 * Search web for relevant images (simulated - would integrate with actual image search API)
 */
export async function searchRelevantImages(
  keywords: string[]
): Promise<Array<{ url: string; alt: string; source: string }>> {
  // In production, integrate with Unsplash API, Pexels API, or similar
  // For now, return suggestions for manual search
  return keywords.map((keyword) => ({
    url: `https://source.unsplash.com/1600x900/?${encodeURIComponent(keyword)}`,
    alt: `Image related to ${keyword}`,
    source: "Unsplash",
  }));
}

/**
 * Search for relevant YouTube videos
 */
export async function searchRelevantVideos(
  topic: string
): Promise<Array<{ url: string; title: string }>> {
  // In production, integrate with YouTube Data API
  // For now, return search URL
  const searchQuery = encodeURIComponent(topic);
  return [
    {
      url: `https://www.youtube.com/results?search_query=${searchQuery}`,
      title: `Search YouTube for: ${topic}`,
    },
  ];
}

/**
 * Complete autonomous blog generation workflow
 */
export async function generateCompleteBlog(
  topic: string,
  existingPages: string[] = [],
  options: {
    tone?: "professional" | "casual" | "technical";
    generateHeaderImage?: boolean;
  } = {}
): Promise<{
  research: BlogResearchResult;
  content: BlogContentResult;
  seo: BlogSEOResult;
  headerImage?: { url: string; prompt: string };
  suggestedImages: Array<{ url: string; alt: string; source: string }>;
}> {
  // Step 1: Research topic
  const research = await researchBlogTopic(topic, existingPages);

  // Step 2: Generate content
  const content = await generateBlogContent(research, options.tone);

  // Step 3: Generate SEO metadata
  const seo = await generateBlogSEO(research.outline.title, content.content, research.keywords);

  // Step 4: Generate header image if requested
  let headerImage;
  if (options.generateHeaderImage) {
    const imageResult = await generateBlogHeaderImage(topic);
    if ("url" in imageResult) {
      headerImage = imageResult;
    }
  }

  // Step 5: Find relevant stock images
  const suggestedImages = await searchRelevantImages(research.keywords.slice(0, 3));

  return {
    research,
    content,
    seo,
    headerImage,
    suggestedImages,
  };
}

// Helper functions

function extractChaptersFromHTML(html: string): Array<{ id: string; title: string; level: number }> {
  const chapters: Array<{ id: string; title: string; level: number }> = [];
  const headingRegex = /<h([23])(?:\s+id="([^"]*)")?>(.*?)<\/h\1>/gi;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const title = match[3].replace(/<[^>]*>/g, ""); // Strip HTML tags
    const id = match[2] || generateSlug(title);
    chapters.push({ id, title, level });
  }

  return chapters;
}

function extractInternalLinks(content: string): string[] {
  const links: string[] = [];
  const linkRegex = /\[([^\]]+)\]\(\/([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push("/" + match[2]);
  }

  return [...new Set(links)]; // Remove duplicates
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

