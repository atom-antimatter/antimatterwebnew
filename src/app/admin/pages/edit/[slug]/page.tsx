"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import PageEditor from "../../../components/PageEditor";

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  no_index: boolean;
  is_homepage: boolean;
  category: string | null;
  parent_slug: string | null;
  internal_links: string[] | null;
  updated_at: string;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchPage = async () => {
      try {
        const supabase = getSupabaseClient() as any;
        const { data, error: fetchError } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", slug === "new" ? "" : slug)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        if (!data && slug !== "new") {
          setError("Page not found");
          return;
        }

        setPage(data || null);
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleSave = async (pageData: Partial<Page>) => {
    try {
      const supabase = getSupabaseClient() as any;
      
      const cleanedData: Record<string, any> = {
        slug: pageData.slug && pageData.slug.trim() ? pageData.slug.trim() : null,
        title: pageData.title && pageData.title.trim() ? pageData.title.trim() : null,
        meta_description: pageData.meta_description && pageData.meta_description.trim() ? pageData.meta_description.trim() : null,
        meta_keywords: pageData.meta_keywords && pageData.meta_keywords.trim() ? pageData.meta_keywords.trim() : null,
        canonical_url: pageData.canonical_url && pageData.canonical_url.trim() ? pageData.canonical_url.trim() : null,
        og_title: pageData.og_title && pageData.og_title.trim() ? pageData.og_title.trim() : null,
        og_description: pageData.og_description && pageData.og_description.trim() ? pageData.og_description.trim() : null,
        og_image: pageData.og_image && pageData.og_image.trim() ? pageData.og_image.trim() : null,
        twitter_title: pageData.twitter_title && pageData.twitter_title.trim() ? pageData.twitter_title.trim() : null,
        twitter_description: pageData.twitter_description && pageData.twitter_description.trim() ? pageData.twitter_description.trim() : null,
        twitter_image: pageData.twitter_image && pageData.twitter_image.trim() ? pageData.twitter_image.trim() : null,
        no_index: pageData.no_index ?? false,
        is_homepage: pageData.is_homepage ?? false,
        category: pageData.category && pageData.category.trim() ? pageData.category.trim() : null,
        parent_slug: pageData.parent_slug && pageData.parent_slug.trim() ? pageData.parent_slug.trim() : null,
        internal_links: pageData.internal_links && Array.isArray(pageData.internal_links) && pageData.internal_links.length > 0 ? pageData.internal_links : null,
        updated_at: new Date().toISOString(),
      };
      
      if (page?.id) {
        // Update existing page
        const { error: updateError } = await supabase
          .from("pages")
          .update(cleanedData)
          .eq("id", page.id);

        if (updateError) throw updateError;
        
        // Navigate back to pages list if slug changed
        if (cleanedData.slug !== page.slug) {
          router.push(`/admin/pages/edit/${encodeURIComponent(cleanedData.slug || "")}`);
        } else {
          router.push("/admin?tab=pages");
        }
      } else {
        // Create new page
        const { error: insertError } = await supabase
          .from("pages")
          .insert([cleanedData]);

        if (insertError) throw insertError;
        
        router.push(`/admin/pages/edit/${encodeURIComponent(cleanedData.slug || "")}`);
      }
    } catch (err: any) {
      console.error("Error saving page:", err);
      setError(err.message || "Failed to save page");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error && slug !== "new") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-foreground mb-4">Error</h2>
          <p className="text-foreground/60 mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin?tab=pages")}
            className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg"
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin?tab=pages")}
            className="text-foreground/60 hover:text-foreground mb-4 inline-flex items-center gap-2"
          >
            ← Back to Pages
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {page ? `Edit Page: ${page.slug}` : "Add New Page"}
          </h1>
        </div>

        <PageEditor
          page={page}
          isOpen={true}
          onClose={() => router.push("/admin?tab=pages")}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

