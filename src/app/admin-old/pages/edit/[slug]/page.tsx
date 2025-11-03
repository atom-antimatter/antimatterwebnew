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
        
        // Decode the slug parameter and ensure it starts with /
        // Next.js dynamic routes decode the parameter, but we need to handle leading slashes
        let decodedSlug = decodeURIComponent(slug);
        
        // Ensure slug starts with / if it's not "new"
        if (decodedSlug !== "new" && !decodedSlug.startsWith("/")) {
          decodedSlug = "/" + decodedSlug;
        }
        
        // Only select fields that PostgREST definitely knows about
        // Category, parent_slug, internal_links may not be in schema cache yet
        const { data, error: fetchError } = await supabase
          .from("pages")
          .select("id, slug, title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image, no_index, is_homepage, updated_at")
          .eq("slug", decodedSlug === "new" ? "" : decodedSlug)
          .maybeSingle();
        
        // If page found, try to get extended fields separately (category, parent_slug, internal_links)
        // This is a workaround for PostgREST schema cache issues
        if (data && decodedSlug !== "new") {
          try {
            const { data: extendedData } = await supabase
              .from("pages")
              .select("category, parent_slug, internal_links")
              .eq("slug", decodedSlug)
              .maybeSingle();
            
            if (extendedData) {
              // Merge extended fields if they exist
              Object.assign(data, {
                category: extendedData.category || null,
                parent_slug: extendedData.parent_slug || null,
                internal_links: extendedData.internal_links || null,
              });
            }
          } catch (extendedErr) {
            // If extended fields fail, set them to null (non-critical)
            console.warn("Could not fetch extended fields, setting to null:", extendedErr);
            Object.assign(data, {
              category: null,
              parent_slug: null,
              internal_links: null,
            });
          }
        }

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        // Check if page was found (only if not "new")
        if (!data && decodedSlug !== "new") {
          setError(`Page not found: ${decodedSlug}`);
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
        // Split data into known fields and extended fields (for PostgREST schema cache workaround)
        const knownFields: Record<string, any> = {
          slug: cleanedData.slug,
          title: cleanedData.title,
          meta_description: cleanedData.meta_description,
          meta_keywords: cleanedData.meta_keywords,
          canonical_url: cleanedData.canonical_url,
          og_title: cleanedData.og_title,
          og_description: cleanedData.og_description,
          og_image: cleanedData.og_image,
          twitter_title: cleanedData.twitter_title,
          twitter_description: cleanedData.twitter_description,
          twitter_image: cleanedData.twitter_image,
          no_index: cleanedData.no_index,
          is_homepage: cleanedData.is_homepage,
          updated_at: cleanedData.updated_at,
        };
        
        const extendedFields: Record<string, any> = {
          category: cleanedData.category,
          parent_slug: cleanedData.parent_slug,
          internal_links: cleanedData.internal_links,
        };
        
        // First update known fields
        const { error: updateError } = await supabase
          .from("pages")
          .update(knownFields)
          .eq("id", page.id);

        if (updateError) {
          console.error("Error updating known fields:", updateError);
          throw updateError;
        }
        
        // Update extended fields using RPC function (bypasses PostgREST schema cache)
        try {
          const { error: rpcError } = await supabase.rpc('update_page_extended_fields', {
            p_id: page.id,
            p_category: extendedFields.category,
            p_parent_slug: extendedFields.parent_slug,
            p_internal_links: extendedFields.internal_links,
          });
          
          if (rpcError) {
            console.warn("Could not update extended fields via RPC:", rpcError);
            // Non-critical - the main fields were updated successfully
          }
        } catch (extendedErr) {
          console.warn("Extended fields RPC update failed (non-critical):", extendedErr);
        }
        
        // Navigate back to pages list if slug changed
        if (cleanedData.slug !== page.slug) {
          const newSlugForRoute = cleanedData.slug?.startsWith("/") 
            ? cleanedData.slug.slice(1) 
            : cleanedData.slug || "";
          router.push(`/admin/pages/edit/${encodeURIComponent(newSlugForRoute)}`);
        } else {
          router.push("/admin?tab=pages");
        }
      } else {
        // Create new page - only include known fields first
        // Extended fields will be NULL initially (can be updated later)
        const knownFieldsForInsert: Record<string, any> = {
          slug: cleanedData.slug,
          title: cleanedData.title,
          meta_description: cleanedData.meta_description,
          meta_keywords: cleanedData.meta_keywords,
          canonical_url: cleanedData.canonical_url,
          og_title: cleanedData.og_title,
          og_description: cleanedData.og_description,
          og_image: cleanedData.og_image,
          twitter_title: cleanedData.twitter_title,
          twitter_description: cleanedData.twitter_description,
          twitter_image: cleanedData.twitter_image,
          no_index: cleanedData.no_index,
          is_homepage: cleanedData.is_homepage,
        };
        
        const extendedFieldsForInsert: Record<string, any> = {
          category: cleanedData.category,
          parent_slug: cleanedData.parent_slug,
          internal_links: cleanedData.internal_links,
        };
        
        const { error: insertError, data: insertedData } = await supabase
          .from("pages")
          .insert([knownFieldsForInsert])
          .select('id')
          .single();

        if (insertError) throw insertError;
        
        // Try to update extended fields after insert (if they exist)
        if (insertedData && (cleanedData.category || cleanedData.parent_slug || cleanedData.internal_links)) {
          try {
            await supabase
              .from("pages")
              .update(extendedFieldsForInsert)
              .eq("id", insertedData.id);
          } catch (extendedErr) {
            console.warn("Could not set extended fields on new page (non-critical):", extendedErr);
          }
        }
        
        const newSlugForRoute = cleanedData.slug?.startsWith("/") 
          ? cleanedData.slug.slice(1) 
          : cleanedData.slug || "";
        router.push(`/admin/pages/edit/${encodeURIComponent(newSlugForRoute)}`);
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

