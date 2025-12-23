import { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.antimatterai.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/enterprise-ai`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/resources/vendor-matrix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];

  // Fetch dynamic pages from database
  const supabase = getSupabaseAdmin();
  const { data: pages } = await (supabase
    .from("pages") as any)
    .select("slug, updated_at")
    .eq("no_index", false);

  const dynamicPages: MetadataRoute.Sitemap =
    pages?.map((page: any) => ({
      url: `${baseUrl}${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Fetch blog posts
  const { data: posts } = await (supabase
    .from("blog_posts") as any)
    .select("slug, published_at, updated_at")
    .eq("published", true);

  const blogPosts: MetadataRoute.Sitemap =
    posts?.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) || [];

  return [...staticPages, ...dynamicPages, ...blogPosts];
}

