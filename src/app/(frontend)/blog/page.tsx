import { getPayloadClient } from "@/lib/payloadSingleton";
import type { Metadata } from "next";
import BlogListingClient from "./BlogListingClient";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

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
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "payload-blog-posts",
      where: {
        _status: {
          equals: "published",
        },
      },
      sort: "-publishedAt",
      limit: 100,
    });

    return docs.map((doc: any) => ({
      id: doc.id.toString(),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      featured_image: typeof doc.featuredImage === 'object' ? doc.featuredImage?.url : null,
      featured_image_alt: doc.featuredImageAlt,
      author: doc.author,
      category: doc.category,
      reading_time: doc.readingTime,
      published_at: doc.publishedAt,
    }));
  } catch (error) {
    console.error("Exception fetching blog posts:", error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "payload-blog-posts",
      where: {
        _status: {
          equals: "published",
        },
        category: {
          exists: true,
        },
      },
    });

    const uniqueCategories = [...new Set(docs.map((doc: any) => doc.category))].filter(Boolean);
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




