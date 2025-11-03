"use client";

import { useState, useEffect } from "react";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye, HiOutlineHome } from "react-icons/hi2";
import { getSupabaseClient } from "@/lib/supabaseClient";
import PageEditor from "./PageEditor";

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

export default function PageManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    const initializePages = async () => {
      await fetchPages();
      // Auto-sync pages if database is empty (check after fetch)
      const supabase = getSupabaseClient() as any;
      const { data: existingPages } = await supabase
        .from("pages")
        .select("slug")
        .limit(1);
      
      if (!existingPages || existingPages.length === 0) {
        autoSyncPages();
      }
    };
    
    initializePages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoSyncPages = async () => {
    try {
      console.log("Auto-syncing pages to database...");
      const response = await fetch("/api/populate-pages", {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (result.success && result.count > 0) {
        console.log(`Auto-synced ${result.count} pages to database`);
        await fetchPages();
      } else if (result.warnings && result.errors && result.errors.length > 0) {
        console.warn(`Auto-sync partial: ${result.count} pages added, ${result.errors.length} failed`);
        await fetchPages(); // Refresh anyway to show what was added
      } else if (result.count === 0) {
        console.log("All pages already exist in database");
      }
    } catch (error: any) {
      console.error("Error auto-syncing pages:", error);
      // Don't show alert on auto-sync, just log to console
    }
  };

  const fetchPages = async () => {
    try {
      const supabase = getSupabaseClient() as any;
      // Fetch pages - don't order by category to avoid schema cache issues
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("is_homepage", { ascending: false })
        .order("slug");

      if (error) {
        console.error("Error fetching pages:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // If category column error, try fetching without it
        if (error.message?.includes('category')) {
          console.log("Retrying fetch without category column...");
          const { data: retryData, error: retryError } = await supabase
            .from("pages")
            .select("*")
            .order("is_homepage", { ascending: false })
            .order("slug");
          
          if (retryError) {
            console.error("Retry also failed:", retryError);
            setPages([]);
            throw retryError;
          }
          
          setPages((retryData || []) as Page[]);
          return;
        }
        
        // Set empty array on error but don't break the UI
        setPages([]);
        throw error;
      }
      
      // Sort by category in JavaScript if category column exists
      const sortedData = data ? [...(data as any[])].sort((a: any, b: any) => {
        // Homepage first
        if (a.is_homepage && !b.is_homepage) return -1;
        if (!a.is_homepage && b.is_homepage) return 1;
        
        // Then by category if available
        if (a.category && b.category) {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
        }
        
        // Finally by slug
        return a.slug.localeCompare(b.slug);
      }) : [];
      
      setPages(sortedData as Page[]);
    } catch (error: any) {
      console.error("Error fetching pages:", error);
      // Log full error for debugging
      if (error.message) {
        console.error("Error message:", error.message);
      }
      if (error.details) {
        console.error("Error details:", error.details);
      }
      if (error.hint) {
        console.error("Error hint:", error.hint);
      }
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const populateAllPages = async () => {
    if (!confirm("This will add all missing pages to the database. Continue?")) return;
    
    setIsPopulating(true);
    try {
      const response = await fetch("/api/populate-pages", {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      if (result.success) {
        let message = result.count === 0 
          ? `All pages already exist (${result.existingCount || pages.length} total).`
          : `Success! ${result.count} pages added to the database.`;
        
        // Show warnings if there were partial errors
        if (result.warnings && result.errors && result.errors.length > 0) {
          const errorSummary = result.errors.slice(0, 5).map((e: any) => `• ${e.slug}: ${e.error}`).join('\n');
          const moreErrors = result.errors.length > 5 ? `\n\n...and ${result.errors.length - 5} more errors` : '';
          message += `\n\n⚠️ ${result.errors.length} pages failed:\n${errorSummary}${moreErrors}`;
          console.error("Populate errors:", result.errors);
        }
        
        alert(message);
        await fetchPages();
      } else {
        // Show detailed error information
        let errorMessage = result.error || "Unknown error occurred";
        if (result.details && Array.isArray(result.details)) {
          const errorSummary = result.details.slice(0, 10).map((e: any) => {
            const slug = e.slug || 'unknown';
            const errMsg = e.error || e.message || 'Unknown error';
            return `• ${slug}: ${errMsg}`;
          }).join('\n');
          const moreErrors = result.details.length > 10 ? `\n\n...and ${result.details.length - 10} more errors` : '';
          errorMessage += `\n\nErrors:\n${errorSummary}${moreErrors}`;
          console.error("Detailed populate errors:", result.details);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error populating pages:", error);
      const errorMessage = error.message || "Failed to populate pages. Please check the browser console and server logs for details.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleSave = async (pageData: Partial<Page>) => {
    try {
      const supabase = getSupabaseClient() as any;
      
      // Convert empty strings to null for optional fields
      const cleanedData: any = {
        ...pageData,
        meta_description: pageData.meta_description && pageData.meta_description.trim() ? pageData.meta_description.trim() : null,
        meta_keywords: pageData.meta_keywords && pageData.meta_keywords.trim() ? pageData.meta_keywords.trim() : null,
        canonical_url: pageData.canonical_url && pageData.canonical_url.trim() ? pageData.canonical_url.trim() : null,
        og_title: pageData.og_title && pageData.og_title.trim() ? pageData.og_title.trim() : null,
        og_description: pageData.og_description && pageData.og_description.trim() ? pageData.og_description.trim() : null,
        og_image: pageData.og_image && pageData.og_image.trim() ? pageData.og_image.trim() : null,
        twitter_title: pageData.twitter_title && pageData.twitter_title.trim() ? pageData.twitter_title.trim() : null,
        twitter_description: pageData.twitter_description && pageData.twitter_description.trim() ? pageData.twitter_description.trim() : null,
        twitter_image: pageData.twitter_image && pageData.twitter_image.trim() ? pageData.twitter_image.trim() : null,
        category: pageData.category && pageData.category.trim() ? pageData.category.trim() : null,
        parent_slug: pageData.parent_slug && pageData.parent_slug.trim() ? pageData.parent_slug.trim() : null,
        internal_links: pageData.internal_links && Array.isArray(pageData.internal_links) && pageData.internal_links.length > 0 ? pageData.internal_links : null,
        updated_at: new Date().toISOString(),
      };
      
      if (editingPage) {
        const { error } = await supabase
          .from("pages")
          .update(cleanedData)
          .eq("id", editingPage.id);

        if (error) {
          console.error("Error updating page:", error);
          alert(`Error updating page: ${error.message}`);
          throw error;
        }
      } else {
        cleanedData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from("pages")
          .insert([cleanedData]);

        if (error) {
          console.error("Error creating page:", error);
          alert(`Error creating page: ${error.message}`);
          throw error;
        }
      }

      await fetchPages();
      setEditingPage(null);
      setShowForm(false);
    } catch (error: any) {
      console.error("Error saving page:", error);
      if (!error.message || !error.message.includes("Error")) {
        alert(`Failed to save page: ${error.message || "Unknown error"}`);
      }
    }
  };

  const handleDelete = async (id: string, isHomepage: boolean) => {
    if (isHomepage) {
      alert("Cannot delete the homepage!");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const supabase = getSupabaseClient() as any;
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pages</h2>
          <p className="text-foreground/60">Manage page SEO settings and metadata</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={populateAllPages}
            disabled={isPopulating}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPopulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Populating...</span>
              </>
            ) : (
              <>
                <HiOutlinePlus className="w-5 h-5" />
                <span>Populate All Pages</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setEditingPage(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Add Page</span>
          </button>
        </div>
      </div>

      {/* Page Editor Modal */}
      <PageEditor
        page={editingPage}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPage(null);
        }}
        onSave={handleSave}
      />

      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Page</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Title</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Meta Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">No Index</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Updated</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-foreground/60 mb-4">No pages found in the database.</p>
                      <p className="text-sm text-foreground/40 mb-4">Click &quot;Populate All Pages&quot; to add all site pages automatically.</p>
                    </div>
                  </td>
                </tr>
              )}
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {page.is_homepage && (
                        <HiOutlineHome className="w-4 h-4 text-yellow-400" title="Homepage" />
                      )}
                      <code className="text-sm bg-zinc-800 px-2 py-1 rounded text-foreground">
                        {page.slug}
                      </code>
                      <a
                        href={page.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-secondary/80"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                    {page.title}
                    {page.is_homepage && (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded-full text-xs">
                        Homepage
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60 max-w-xs truncate">
                    {page.meta_description || "No description"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      page.no_index 
                        ? "bg-red-900/30 text-red-400" 
                        : "bg-green-900/30 text-green-400"
                    }`}>
                      {page.no_index ? "No Index" : "Indexed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPage(page);
                          setShowForm(true);
                        }}
                        className="text-secondary hover:text-secondary/80 p-1"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.is_homepage)}
                        className={`p-1 transition-colors ${
                          page.is_homepage
                            ? "text-foreground/30 cursor-not-allowed"
                            : "text-red-400 hover:text-red-300"
                        }`}
                        disabled={page.is_homepage}
                        title={page.is_homepage ? "Cannot delete homepage" : "Delete page"}
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
