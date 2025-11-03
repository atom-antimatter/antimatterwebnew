import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateRSSItem } from "@/lib/blogHelpers";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const { docs: posts } = await payload.find({
      collection: "payload-blog-posts",
      where: {
        _status: {
          equals: "published",
        },
      },
      sort: "-publishedAt",
      limit: 20,
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.antimatterai.com";
    const rssItems = posts.map((post: any) =>
      generateRSSItem(
        {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: JSON.stringify(post.content),
          published_at: post.publishedAt,
          author: post.author,
          category: post.category,
        },
        baseUrl
      )
    );

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Antimatter AI Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on AI, product development, and digital innovation from Antimatter AI</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/blog-rss" rel="self" type="application/rss+xml"/>
    ${rssItems
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.guid}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <author>${item.author}</author>
      ${item.category ? `<category>${item.category}</category>` : ""}
    </item>`
      )
      .join("\n")}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Exception generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}




