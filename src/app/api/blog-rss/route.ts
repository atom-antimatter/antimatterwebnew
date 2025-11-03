import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateRSSItem } from "@/lib/blogHelpers";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, published_at, author, category")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching blog posts for RSS:", error);
      return new NextResponse("Error generating RSS feed", { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.antimatterai.com";
    const rssItems = (posts || []).map((post) => generateRSSItem(post, baseUrl));

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

