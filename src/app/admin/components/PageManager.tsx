"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye, HiOutlineHome, HiOutlineArrowPath, HiOutlineArrowsUpDown, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { getSupabaseClient } from "@/lib/supabaseClient";

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

type SortField = 'slug' | 'title' | 'meta_description' | 'no_index' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export default function PageManager() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
    if (!confirm("This will sync all missing pages to the database. Continue?")) return;
    
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

  // Filter and sort pages
  const filteredAndSortedPages = useMemo(() => {
    let filtered = pages;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = pages.filter(page => 
        page.slug.toLowerCase().includes(query) ||
        page.title.toLowerCase().includes(query) ||
        (page.meta_description && page.meta_description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'updated_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortField === 'no_index') {
          aVal = aVal ? 1 : 0;
          bVal = bVal ? 1 : 0;
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [pages, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
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
                <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <HiOutlineArrowPath className="w-5 h-5" />
                <span>Sync Pages</span>
              </>
            )}
          </button>
          <button
            onClick={() => router.push("/admin/pages/edit/new")}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Add Page</span>
          </button>
        </div>
      </div>


      {/* Search and Filter */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search pages by slug, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  <button
                    onClick={() => handleSort('slug')}
                    className="flex items-center gap-2 hover:text-secondary transition-colors"
                  >
                    Page
                    <HiOutlineArrowsUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 hover:text-secondary transition-colors"
                  >
                    Title
                    <HiOutlineArrowsUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  <button
                    onClick={() => handleSort('meta_description')}
                    className="flex items-center gap-2 hover:text-secondary transition-colors"
                  >
                    Meta Description
                    <HiOutlineArrowsUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  <button
                    onClick={() => handleSort('no_index')}
                    className="flex items-center gap-2 hover:text-secondary transition-colors"
                  >
                    No Index
                    <HiOutlineArrowsUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  <button
                    onClick={() => handleSort('updated_at')}
                    className="flex items-center gap-2 hover:text-secondary transition-colors"
                  >
                    Updated
                    <HiOutlineArrowsUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredAndSortedPages.length === 0 && pages.length > 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-foreground/60 mb-2">No pages match your search.</p>
                      <p className="text-sm text-foreground/40">Try adjusting your search query.</p>
                    </div>
                  </td>
                </tr>
              )}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-foreground/60 mb-4">No pages found in the database.</p>
                      <p className="text-sm text-foreground/40 mb-4">Click &quot;Sync Pages&quot; to sync all site pages to the database.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredAndSortedPages.map((page) => (
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
                          // Remove leading / from slug for the route, encode it
                          const slugForRoute = page.slug.startsWith("/") 
                            ? page.slug.slice(1) 
                            : page.slug;
                          router.push(`/admin/pages/edit/${encodeURIComponent(slugForRoute)}`);
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
