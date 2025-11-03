/**
 * Blog helper functions for SEO, chapters, and content processing
 */

/**
 * Generate anchor ID from heading text
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract chapters from HTML content
 */
export function extractChapters(
  html: string
): Array<{ id: string; title: string; level: number }> {
  const chapters: Array<{ id: string; title: string; level: number }> = [];
  const headingRegex = /<h([23])(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const title = match[3].replace(/<[^>]*>/g, "").trim(); // Strip HTML tags
    const id = match[2] || generateAnchorId(title);
    
    if (title) {
      chapters.push({ id, title, level });
    }
  }

  return chapters;
}

/**
 * Add anchor IDs to headings in HTML content
 */
export function addChapterAnchors(html: string): string {
  return html.replace(/<h([23])(?:\s+id="([^"]*)")?([^>]*)>(.*?)<\/h\1>/gi, (match, level, existingId, attrs, content) => {
    const title = content.replace(/<[^>]*>/g, "").trim();
    const id = existingId || generateAnchorId(title);
    return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
  });
}

/**
 * Calculate reading time from HTML content
 */
export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ""); // Strip HTML tags
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200; // Average reading speed
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Extract internal links from content
 */
export function extractInternalLinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /href="(\/[^"]+)"/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const link = match[1];
    // Only include page/blog links, not assets
    if (!link.includes(".") && !link.startsWith("/api/")) {
      links.push(link);
    }
  }

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Suggest internal links based on content and available pages
 */
export function suggestInternalLinks(
  content: string,
  availablePages: Array<{ slug: string; title: string; keywords?: string[] }>
): Array<{ slug: string; title: string; relevance: number }> {
  const contentLower = content.toLowerCase().replace(/<[^>]*>/g, "");
  const suggestions: Array<{ slug: string; title: string; relevance: number }> = [];

  for (const page of availablePages) {
    let relevance = 0;

    // Check if page title appears in content
    if (contentLower.includes(page.title.toLowerCase())) {
      relevance += 10;
    }

    // Check if keywords appear in content
    if (page.keywords) {
      for (const keyword of page.keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          relevance += 5;
        }
      }
    }

    if (relevance > 0) {
      suggestions.push({ slug: page.slug, title: page.title, relevance });
    }
  }

  // Sort by relevance and return top 5
  return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

/**
 * Extract keywords from content using simple frequency analysis
 */
export function extractKeywords(html: string, limit: number = 10): string[] {
  const text = html.replace(/<[^>]*>/g, "").toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "can", "this", "that",
    "these", "those", "i", "you", "he", "she", "it", "we", "they",
  ]);

  // Extract words
  const words = text.match(/\b\w{4,}\b/g) || [];
  
  // Count word frequency
  const frequency: Record<string, number> = {};
  for (const word of words) {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Generate meta description from content if not provided
 */
export function generateMetaDescription(html: string, maxLength: number = 160): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  
  // Try to find first paragraph
  const firstParagraph = text.split("\n\n")[0] || text;
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  // Truncate at word boundary
  const truncated = firstParagraph.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  return truncated.substring(0, lastSpace) + "...";
}

/**
 * Validate and clean slug
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate sitemap entry for blog post
 */
export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export function generateBlogSitemapEntry(
  slug: string,
  publishedAt: string,
  baseUrl: string = "https://www.antimatterai.com"
): SitemapEntry {
  return {
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  };
}

/**
 * Generate RSS feed item for blog post
 */
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  author: string;
  category: string | null;
}

export function generateRSSItem(
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    published_at: string | null;
    author: string;
    category: string | null;
  },
  baseUrl: string = "https://www.antimatterai.com"
): RSSItem {
  return {
    title: post.title,
    description: post.excerpt || generateMetaDescription(post.content),
    link: `${baseUrl}/blog/${post.slug}`,
    pubDate: post.published_at || new Date().toISOString(),
    guid: `${baseUrl}/blog/${post.slug}`,
    author: post.author,
    category: post.category,
  };
}

