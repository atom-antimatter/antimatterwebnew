import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
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
  published_at: string | null;
  reading_time: number | null;
  chapters: Array<{ id: string; title: string; level: number }> | null;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "payload-blog-posts",
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: "published",
        },
      },
      limit: 1,
    });

    if (!docs || docs.length === 0) {
      return null;
    }

    const doc = docs[0] as any;
    
    return {
      id: doc.id.toString(),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      content: JSON.stringify(doc.content), // Lexical content as JSON string
      featured_image: typeof doc.featuredImage === 'object' ? doc.featuredImage?.url : null,
      featured_image_alt: doc.featuredImageAlt,
      author: doc.author,
      category: doc.category,
      published_at: doc.publishedAt,
      reading_time: doc.readingTime,
      chapters: doc.chapters,
    };
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
    const payload = await getPayload({ config });
    
    const where: any = {
      _status: {
        equals: "published",
      },
      id: {
        not_equals: currentId,
      },
    };

    if (category) {
      where.category = {
        equals: category,
      };
    }

    const { docs } = await payload.find({
      collection: "payload-blog-posts",
      where,
      sort: "-publishedAt",
      limit: 3,
    });

    return docs.map((doc: any) => ({
      id: doc.id.toString(),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      featured_image: typeof doc.featuredImage === 'object' ? doc.featuredImage?.url : null,
      featured_image_alt: doc.featuredImageAlt,
      category: doc.category,
      reading_time: doc.readingTime,
      published_at: doc.publishedAt,
    }));
  } catch (error) {
    console.error("Exception fetching related posts:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts: RelatedPost[] = await getRelatedPosts(post.category, post.id);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

