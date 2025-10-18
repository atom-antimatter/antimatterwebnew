"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import { HiOutlineGlobeAlt, HiOutlineEye, HiEyeSlash } from "react-icons/hi2";
import SitemapMindMap from "./SitemapMindMap";

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

interface SitemapItem {
  id: string;
  slug: string;
  title: string;
  type: 'page' | 'blog';
  no_index: boolean;
  updated_at: string;
  category?: string;
}

export default function SitemapViewer() {
  const [sitemapItems, setSitemapItems] = useState<SitemapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSitemapData();
  }, []);

  const fetchSitemapData = async () => {
    try {
      const supabase = getSupabase();
      
      // Fetch pages
      const { data: pages, error: pagesError } = await supabase
        .from("pages")
        .select("id, slug, title, no_index, updated_at");

      if (pagesError) throw pagesError;

      // Fetch blog posts
      const { data: blogPosts, error: blogError } = await supabase
        .from("blog_posts")
        .select("id, slug, title, category, published, updated_at")
        .eq("published", true);

      if (blogError) throw blogError;

      // Combine all items
      const allItems: SitemapItem[] = [
        ...(pages || []).map(page => ({
          ...page,
          type: 'page' as const
        })),
        ...(blogPosts || []).map(post => ({
          id: post.id,
          slug: `/blog/${post.slug}`,
          title: post.title,
          type: 'blog' as const,
          category: post.category,
          no_index: false,
          updated_at: post.updated_at
        }))
      ];

      setSitemapItems(allItems);
    } catch (error) {
      console.error("Error fetching sitemap data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIndexedCount = () => {
    return sitemapItems.filter(item => !item.no_index).length;
  };

  const getTotalCount = () => {
    return sitemapItems.length;
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sitemap</h2>
        <p className="text-foreground/60">Visualize your site structure and SEO indexing status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <HiOutlineGlobeAlt className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Total Pages</p>
              <p className="text-xl font-semibold text-foreground">{getTotalCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <HiOutlineEye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Indexed</p>
              <p className="text-xl font-semibold text-foreground">{getIndexedCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <HiEyeSlash className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">No Index</p>
              <p className="text-xl font-semibold text-foreground">{getTotalCount() - getIndexedCount()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemap Mind Map */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-foreground">Site Structure Mind Map</h3>
        </div>
        
        <div className="min-h-[600px]">
          <SitemapMindMap items={sitemapItems} />
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Export Options</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const sitemapXml = generateSitemapXML(sitemapItems);
              downloadFile(sitemapXml, 'sitemap.xml', 'application/xml');
            }}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors"
          >
            Export XML Sitemap
          </button>
          <button
            onClick={() => {
              const sitemapJson = JSON.stringify(sitemapItems, null, 2);
              downloadFile(sitemapJson, 'sitemap.json', 'application/json');
            }}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}

function generateSitemapXML(items: SitemapItem[]): string {
  const indexedItems = items.filter(item => !item.no_index);
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  indexedItems.forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>https://www.antimatterai.com${item.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(item.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
