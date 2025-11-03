import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Metadata } from "next";
import BlogListingClient from "./BlogListingClient";

export const metadata: Metadata = {
  title: "Blog | Antimatter AI",
  description:
    "Insights on AI, product development, and digital innovation. Learn from our team's experience building cutting-edge solutions.",
  openGraph: {
    title: "Blog | Antimatter AI",
    description:
      "Insights on AI, product development, and digital innovation. Learn from our team's experience building cutting-edge solutions.",
    type: "website",
  },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  author: string;
  category: string | null;
  reading_time: number | null;
  published_at: string | null;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, featured_image, featured_image_alt, author, category, reading_time, published_at"
      )
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception fetching blog posts:", error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("published", true)
      .not("category", "is", null);

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const uniqueCategories = [...new Set(data.map((item: any) => item.category))].filter(Boolean);
    return uniqueCategories as string[];
  } catch (error) {
    console.error("Exception fetching categories:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = await getCategories();

  return <BlogListingClient posts={posts} categories={categories} />;
}

