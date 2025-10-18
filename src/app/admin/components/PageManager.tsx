"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye, HiOutlineHome } from "react-icons/hi2";
import PageEditor from "./PageEditor";

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

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
  updated_at: string;
}

export default function PageManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("is_homepage", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (pageData: Partial<Page>) => {
    try {
      const supabase = getSupabase();
      if (editingPage) {
        const { error } = await supabase
          .from("pages")
          .update({ ...pageData, updated_at: new Date().toISOString() })
          .eq("id", editingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pages")
          .insert([{ ...pageData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      await fetchPages();
      setEditingPage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving page:", error);
    }
  };

  const handleDelete = async (id: string, isHomepage: boolean) => {
    if (isHomepage) {
      alert("Cannot delete the homepage!");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const supabase = getSupabase();
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
