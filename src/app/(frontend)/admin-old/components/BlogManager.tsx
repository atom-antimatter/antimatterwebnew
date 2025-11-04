"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineCalendar, HiOutlineSparkles } from "react-icons/hi2";
import { getSupabaseClient, uploadBlogImage } from "@/lib/supabaseClient";
import TipTapEditor from "./TipTapEditor";
import BlogAIChat from "./BlogAIChat";
import CustomSelect from "@/components/ui/CustomSelect";

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
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_keywords: string[] | null;
  reading_time: number | null;
  chapters: Array<{ id: string; title: string; level: number }> | null;
  internal_links: string[] | null;
  external_sources: any[] | null;
}

const BLOG_CATEGORIES = [
  'AI & Machine Learning',
  'Product Development',
  'Case Studies',
  'Company News'
];

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [existingPages, setExistingPages] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchExistingPages();
  }, []);

  const fetchExistingPages = async () => {
    try {
      const supabase = getSupabaseClient() as any;
      const { data, error } = await supabase
        .from("pages")
        .select("slug")
        .order("slug");

      if (error) throw error;
      setExistingPages((data || []).map((p: any) => p.slug));
    } catch (error) {
      console.error("Error fetching existing pages:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const supabase = getSupabaseClient() as any;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (postData: Partial<BlogPost>) => {
    try {
      const supabase = getSupabaseClient() as any;
      if (editingPost) {
        const updatePayload: Record<string, any> = { ...postData, updated_at: new Date().toISOString() };
        const { error } = await supabase
          .from("blog_posts")
          .update(updatePayload)
          .eq("id", editingPost.id);

        if (error) throw error;
      } else {
        const insertPayload: Record<string, any> = { ...postData, created_at: new Date().toISOString() };
        const { error } = await supabase
          .from("blog_posts")
          .insert([insertPayload]);

        if (error) throw error;
      }

      await fetchPosts();
      setEditingPost(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const supabase = getSupabaseClient() as any;
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    try {
      const supabase = getSupabaseClient() as any;
      const updatePayload: Record<string, any> = { 
        published,
        published_at: published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
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
          <h2 className="text-2xl font-bold text-foreground">Blog Posts</h2>
          <p className="text-foreground/60">Manage blog content and publishing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingPost(null);
              setShowAIChat(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-secondary hover:from-purple-700 hover:to-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <HiOutlineSparkles className="w-5 h-5" />
            <span>AI Generate</span>
          </button>
          <button
            onClick={() => {
              setEditingPost(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {showAIChat && (
        <BlogAIChat
          onClose={() => setShowAIChat(false)}
          onContentGenerated={(data) => {
            setEditingPost({
              id: "",
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt,
              content: data.content,
              featured_image: data.featuredImage || null,
              featured_image_alt: null,
              author: "Antimatter AI",
              category: null,
              published: false,
              published_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              seo_keywords: data.keywords,
              reading_time: null,
              chapters: null,
              internal_links: null,
              external_sources: null,
            });
            setShowAIChat(false);
            setShowForm(true);
          }}
          existingPages={existingPages}
        />
      )}

      {showForm && (
        <BlogForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    post.published 
                      ? "bg-green-900/30 text-green-400" 
                      : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                
                <p className="text-foreground/60 text-sm mb-3">
                  {post.excerpt || "No excerpt available"}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-foreground/60 flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <HiOutlineCalendar className="w-4 h-4" />
                    <span>
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()
                      }
                    </span>
                  </div>
                  <span>by {post.author}</span>
                  {post.category && (
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {post.category}
                    </span>
                  )}
                  <code className="bg-zinc-800 px-2 py-1 rounded text-xs">
                    /blog/{post.slug}
                  </code>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handlePublish(post.id, !post.published)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    post.published
                      ? "bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50"
                      : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                  }`}
                >
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setShowForm(true);
                  }}
                  className="text-secondary hover:text-secondary/80 p-1"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface BlogFormProps {
  post: BlogPost | null;
  onSave: (data: Partial<BlogPost>) => void;
  onCancel: () => void;
}

function BlogForm({ post, onSave, onCancel }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image: post?.featured_image || "",
    featured_image_alt: post?.featured_image_alt || "",
    author: post?.author || "Antimatter AI",
    category: post?.category || "",
    published: post?.published || false,
    seo_keywords: post?.seo_keywords || [],
    reading_time: post?.reading_time || null,
    chapters: post?.chapters || [],
    internal_links: post?.internal_links || [],
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [seoScore, setSeoScore] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate reading time
    const wordCount = formData.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    onSave({
      ...formData,
      reading_time: readingTime,
    });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await uploadBlogImage(file);
      if ("url" in result) {
        setFormData({
          ...formData,
          featured_image: result.url,
          featured_image_alt: formData.title || "Blog post image",
        });
      } else {
        alert("Failed to upload image: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading featured image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const autoGenerateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData({ ...formData, slug });
  };

  const analyzeSEO = async () => {
    try {
      const response = await fetch("/api/blog-seo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          metaDescription: formData.excerpt,
          keywords: formData.seo_keywords,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeoScore(data.score);
      }
    } catch (error) {
      console.error("Error analyzing SEO:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {post ? "Edit Blog Post" : "Create New Blog Post"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={autoGenerateSlug}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Blog post title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="blog-post-slug"
                required
              />
              <button
                type="button"
                onClick={autoGenerateSlug}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
              >
                Auto
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={3}
            placeholder="Brief description of the blog post"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Content *
          </label>
          <TipTapEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            onChaptersChange={(chapters) => setFormData({ ...formData, chapters })}
            placeholder="Write your blog post content..."
            blogTitle={formData.title}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Featured Image
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Image URL"
                />
                <label className="cursor-pointer px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors flex items-center">
                  {isUploadingImage ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Author name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category *
          </label>
          <CustomSelect
            name="category"
            id="category"
            placeholder="Select a category..."
            options={BLOG_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            value={formData.category}
            onChange={(cat) => setFormData({ ...formData, category: cat })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            SEO Keywords
          </label>
          <input
            type="text"
            value={Array.isArray(formData.seo_keywords) ? formData.seo_keywords.join(", ") : ""}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) })}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-foreground/60 mt-1">Comma-separated keywords for SEO</p>
        </div>

        {formData.chapters && formData.chapters.length > 0 && (
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Chapters ({formData.chapters.length})
            </h4>
            <ul className="space-y-1">
              {formData.chapters.map((chapter) => (
                <li key={chapter.id} className="text-sm text-foreground/80 flex items-center">
                  <span className={chapter.level === 2 ? "font-medium" : "ml-4"}>
                    {chapter.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-800 text-secondary focus:ring-secondary"
            />
            <label htmlFor="published" className="text-sm text-foreground">
              Publish immediately
            </label>
          </div>
          <button
            type="button"
            onClick={analyzeSEO}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
          >
            Analyze SEO
          </button>
        </div>

        {seoScore !== null && (
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">SEO Score</h4>
              <span
                className={`text-2xl font-bold ${
                  seoScore >= 80
                    ? "text-green-400"
                    : seoScore >= 60
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {seoScore}/100
              </span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  seoScore >= 80
                    ? "bg-green-400"
                    : seoScore >= 60
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${seoScore}%` }}
              ></div>
            </div>
          </div>
        )}

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
            {post ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
