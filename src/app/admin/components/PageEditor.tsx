"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiOutlineXMark, HiOutlineCloudArrowUp } from "react-icons/hi2";
import { getSupabaseClient } from "@/lib/supabaseClient";

// Parent Page Selector Component
interface ParentPageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  currentSlug: string;
}

function ParentPageSelector({ value, onChange, currentSlug }: ParentPageSelectorProps) {
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchPages = async () => {
      try {
        const supabase = getSupabaseClient() as any;
        const { data, error } = await supabase
          .from("pages")
          .select("slug, title")
          .order("slug");
        
        if (error) throw error;
        
        // Filter out current page to prevent circular references
        const availablePages = (data || []).filter((p: any) => p.slug !== currentSlug);
        setPages(availablePages);
      } catch (error) {
        console.error("Error fetching pages for parent selector:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [currentSlug]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
    >
      <option value="">None (Root level)</option>
      {pages.map((page) => (
        <option key={page.slug} value={page.slug}>
          {page.slug} - {page.title}
        </option>
      ))}
    </select>
  );
}

// Internal Links Selector Component
interface InternalLinksSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  currentSlug: string;
}

function InternalLinksSelector({ value, onChange, currentSlug }: InternalLinksSelectorProps) {
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const supabase = getSupabaseClient() as any;
        const { data, error } = await supabase
          .from("pages")
          .select("slug, title")
          .order("slug");
        
        if (error) throw error;
        
        // Filter out current page
        const availablePages = (data || []).filter((p: any) => p.slug !== currentSlug);
        setPages(availablePages);
      } catch (error) {
        console.error("Error fetching pages for internal links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [currentSlug]);

  const toggleLink = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter(s => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
        {value.length === 0 ? (
          <span className="text-sm text-foreground/40">No internal links selected</span>
        ) : (
          value.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-sm"
            >
              <code className="text-xs">{slug}</code>
              <button
                type="button"
                onClick={() => toggleLink(slug)}
                className="ml-1 text-secondary hover:text-secondary/80 transition-colors"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </span>
          ))
        )}
      </div>
      
      <select
        onChange={(e) => {
          if (e.target.value && !value.includes(e.target.value)) {
            toggleLink(e.target.value);
          }
          e.target.value = ""; // Reset select
        }}
        disabled={loading}
        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
      >
        <option value="">Add internal link...</option>
        {pages
          .filter(p => !value.includes(p.slug))
          .map((page) => (
            <option key={page.slug} value={page.slug}>
              {page.slug} - {page.title}
            </option>
          ))}
      </select>
    </div>
  );
}

interface Page {
  id?: string;
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
}

interface PageEditorProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Page>) => void;
}

export default function PageEditor({ page, isOpen, onClose, onSave }: PageEditorProps) {
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    no_index: false,
    is_homepage: false,
    category: "",
    parent_slug: "",
    internal_links: [] as string[],
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        slug: page.slug || "",
        title: page.title || "",
        meta_description: page.meta_description || "",
        meta_keywords: page.meta_keywords || "",
        canonical_url: page.canonical_url || "",
        og_title: page.og_title || "",
        og_description: page.og_description || "",
        og_image: page.og_image || "",
        twitter_title: page.twitter_title || "",
        twitter_description: page.twitter_description || "",
        twitter_image: page.twitter_image || "",
        no_index: page.no_index || false,
        is_homepage: page.is_homepage || false,
        category: page.category || "",
        parent_slug: page.parent_slug || "",
        internal_links: page.internal_links && Array.isArray(page.internal_links) ? page.internal_links : [],
      });
    } else {
      setFormData({
        slug: "",
        title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        og_title: "",
        og_description: "",
        og_image: "/images/HeroOpenGraph.png",
        twitter_title: "",
        twitter_description: "",
        twitter_image: "/images/HeroOpenGraph.png",
        no_index: false,
        is_homepage: false,
        category: "",
        parent_slug: "",
        internal_links: [],
      });
    }
  }, [page]);

  const autoFillOG = () => {
    setFormData({
      ...formData,
      og_title: formData.og_title || formData.title,
      og_description: formData.og_description || formData.meta_description,
      og_image: formData.og_image || "/images/HeroOpenGraph.png",
      twitter_title: formData.twitter_title || formData.title,
      twitter_description: formData.twitter_description || formData.meta_description,
      twitter_image: formData.twitter_image || "/images/HeroOpenGraph.png",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'og_image' | 'twitter_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create a simple file upload simulation (you can connect to Supabase Storage later)
    const reader = new FileReader();
    reader.onloadend = () => {
      const imagePath = `/images/uploads/${Date.now()}-${file.name}`;
      setFormData({ ...formData, [field]: imagePath });
      setIsUploading(false);
      alert(`Image ready to upload: ${imagePath}\nNote: Connect to Supabase Storage for actual uploads.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-xl font-semibold text-foreground">
              {page ? "Edit Page" : "Add New Page"}
            </h3>
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors p-1"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Slug * <span className="text-foreground/60 font-normal">(URL path)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="/about"
                    required
                    disabled={formData.is_homepage}
                  />
                  {formData.is_homepage && (
                    <p className="text-xs text-yellow-400 mt-1">Homepage slug cannot be changed</p>
                  )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">None</option>
                    <option value="main">Main</option>
                    <option value="services">Services</option>
                    <option value="solutions">Solutions</option>
                    <option value="demo">Demo</option>
                    <option value="case-study">Case Study</option>
                  </select>
                  <p className="text-xs text-foreground/60 mt-1">Organize pages by category</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Parent Page
                  </label>
                  <ParentPageSelector
                    value={formData.parent_slug}
                    onChange={(value) => setFormData({ ...formData, parent_slug: value })}
                    currentSlug={formData.slug}
                  />
                  <p className="text-xs text-foreground/60 mt-1">Create hierarchical page structure</p>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">SEO Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    rows={3}
                    placeholder="Brief description for search engines (150-160 characters)"
                    maxLength={160}
                  />
                  <p className="text-xs text-foreground/60 mt-1">{formData.meta_description.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="comma, separated, keywords"
                  />
                  <p className="text-xs text-foreground/60 mt-1">Comma-separated keywords for SEO</p>
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

                  <div className="flex items-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="no_index"
                        checked={formData.no_index}
                        onChange={(e) => setFormData({ ...formData, no_index: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-secondary focus:ring-secondary"
                      />
                      <label htmlFor="no_index" className="text-sm text-foreground">
                        No Index
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_homepage"
                        checked={formData.is_homepage}
                        onChange={(e) => setFormData({ ...formData, is_homepage: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-secondary focus:ring-secondary"
                      />
                      <label htmlFor="is_homepage" className="text-sm text-foreground">
                        Set as Homepage
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-foreground">Open Graph & Social Media</h4>
                <button
                  type="button"
                  onClick={autoFillOG}
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  Auto-fill from page data
                </button>
              </div>
              
              <div className="space-y-4">
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
                      placeholder="Open Graph title (defaults to page title)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      OG Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.og_image}
                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="/images/HeroOpenGraph.png"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center">
                        <HiOutlineCloudArrowUp className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'og_image')}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    rows={2}
                    placeholder="Open Graph description (defaults to meta description)"
                  />
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-foreground">Twitter Card</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      twitter_title: formData.twitter_title || formData.title,
                      twitter_description: formData.twitter_description || formData.meta_description,
                      twitter_image: formData.twitter_image || "/images/HeroOpenGraph.png",
                    });
                  }}
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  Auto-fill from page data
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Twitter Title
                    </label>
                    <input
                      type="text"
                      value={formData.twitter_title}
                      onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Twitter card title (defaults to page title)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Twitter Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.twitter_image}
                        onChange={(e) => setFormData({ ...formData, twitter_image: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="/images/HeroOpenGraph.png"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center">
                        <HiOutlineCloudArrowUp className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'twitter_image')}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Twitter Description
                  </label>
                  <textarea
                    value={formData.twitter_description}
                    onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    rows={2}
                    placeholder="Twitter card description (defaults to meta description)"
                  />
                </div>
              </div>
            </div>

            {/* Internal Linking */}
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">Internal Linking</h4>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Internal Links
                </label>
                <InternalLinksSelector
                  value={formData.internal_links}
                  onChange={(links) => setFormData({ ...formData, internal_links: links })}
                  currentSlug={formData.slug}
                />
                <p className="text-xs text-foreground/60 mt-1">Select pages that this page links to internally for sitemap and SEO analysis</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-foreground/60 hover:text-foreground transition-colors"
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
      </motion.div>
    </AnimatePresence>
  );
}
