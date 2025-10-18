"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye } from "react-icons/hi2";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      const { data, error } = await supabase
        .from("pages")
        .select("*")
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
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

      {showForm && (
        <PageForm
          page={editingPage}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPage(null);
          }}
        />
      )}

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
                        onClick={() => handleDelete(page.id)}
                        className="text-red-400 hover:text-red-300 p-1"
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

interface PageFormProps {
  page: Page | null;
  onSave: (data: Partial<Page>) => void;
  onCancel: () => void;
}

function PageForm({ page, onSave, onCancel }: PageFormProps) {
  const [formData, setFormData] = useState({
    slug: page?.slug || "",
    title: page?.title || "",
    meta_description: page?.meta_description || "",
    meta_keywords: page?.meta_keywords || "",
    canonical_url: page?.canonical_url || "",
    og_title: page?.og_title || "",
    og_description: page?.og_description || "",
    og_image: page?.og_image || "",
    twitter_title: page?.twitter_title || "",
    twitter_description: page?.twitter_description || "",
    twitter_image: page?.twitter_image || "",
    no_index: page?.no_index || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {page ? "Edit Page" : "Add New Page"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="/about"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Page Title"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Meta Description
          </label>
          <textarea
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={3}
            placeholder="Meta description for search engines"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonical_url}
              onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="https://www.antimatterai.com/page"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="no_index"
              checked={formData.no_index}
              onChange={(e) => setFormData({ ...formData, no_index: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-800 text-secondary focus:ring-secondary"
            />
            <label htmlFor="no_index" className="text-sm text-foreground">
              No Index (exclude from search engines)
            </label>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <h4 className="text-md font-medium text-foreground mb-3">Open Graph</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={formData.og_title}
                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Open Graph title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                OG Image
              </label>
              <input
                type="url"
                value={formData.og_image}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="/images/og-image.jpg"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              OG Description
            </label>
            <textarea
              value={formData.og_description}
              onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              rows={2}
              placeholder="Open Graph description"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors"
          >
            {page ? "Update Page" : "Create Page"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
