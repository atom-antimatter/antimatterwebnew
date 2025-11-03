import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  author: string;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_keywords: string[] | null;
  reading_time: number | null;
  chapters: Array<{ id: string; title: string; level: number }> | null;
  internal_links: string[] | null;
  external_sources: any[] | null;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) {
      console.error("Error fetching blog post:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception fetching blog post:", error);
    return null;
  }
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category: string | null;
  reading_time: number | null;
  published_at: string | null;
}

async function getRelatedPosts(category: string | null, currentId: string): Promise<RelatedPost[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image, featured_image_alt, category, reading_time, published_at")
      .eq("published", true)
      .neq("id", currentId)
      .order("published_at", { ascending: false })
      .limit(3);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching related posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception fetching related posts:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    keywords: post.seo_keywords || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts: RelatedPost[] = await getRelatedPosts(post.category, post.id);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

