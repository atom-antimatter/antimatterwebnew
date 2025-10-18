"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineCalendar } from "react-icons/hi2";

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author: string;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const supabase = getSupabase();
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
      const supabase = getSupabase();
      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq("id", editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([{ ...postData, created_at: new Date().toISOString() }]);

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
      const supabase = getSupabase();
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
      const supabase = getSupabase();
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          published,
          published_at: published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
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
    author: post?.author || "Antimatter AI",
    category: post?.category || "",
    published: post?.published || false,
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
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Blog post title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="blog-post-slug"
              required
            />
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
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={10}
            placeholder="Write your blog post content here..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="/images/blog/featured-image.jpg"
            />
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
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          >
            <option value="">Select a category...</option>
            {BLOG_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
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
