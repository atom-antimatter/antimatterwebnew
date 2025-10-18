"use client";

import { motion } from "motion/react";
import { HiOutlineDocumentText, HiOutlineNewspaper } from "react-icons/hi2";

interface SitemapItem {
  id: string;
  slug: string;
  title: string;
  type: 'page' | 'blog';
  category?: string;
  no_index: boolean;
}

interface SitemapMindMapProps {
  items: SitemapItem[];
}

export default function SitemapMindMap({ items }: SitemapMindMapProps) {
  // Group items by type and category
  const pages = items.filter(item => item.type === 'page');
  const blogPosts = items.filter(item => item.type === 'blog');
  
  const blogsByCategory = blogPosts.reduce((acc, post) => {
    const cat = post.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(post);
    return acc;
  }, {} as Record<string, SitemapItem[]>);

  return (
    <div className="relative p-8">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8587e3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a2a3e9" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-start justify-center gap-16 relative">
        {/* Root Node */}
        <div className="flex flex-col items-center" style={{ zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-gradient-to-br from-secondary to-primary px-8 py-6 rounded-2xl shadow-lg shadow-secondary/20 border-2 border-secondary/50"
          >
            <h3 className="text-xl font-bold text-white text-center">Antimatter AI</h3>
            <p className="text-white/80 text-sm text-center mt-1">antimatterai.com</p>
          </motion.div>

          {/* Connection Lines */}
          <div className="w-0.5 h-12 bg-gradient-to-b from-secondary/60 to-transparent"></div>
          
          <div className="flex gap-12">
            {/* Pages Branch */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/80 backdrop-blur-xl border-2 border-blue-500/50 px-6 py-4 rounded-xl"
              >
                <div className="flex items-center space-x-2 text-blue-400">
                  <HiOutlineDocumentText className="w-5 h-5" />
                  <span className="font-semibold">Pages ({pages.length})</span>
                </div>
              </motion.div>
              
              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500/40 to-transparent"></div>
              
              <div className="grid grid-cols-1 gap-3">
                {pages.map((page, index) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-zinc-800/50 border border-zinc-700 px-4 py-2 rounded-lg hover:border-blue-500/50 transition-colors group"
                  >
                    <code className="text-xs text-blue-400">{page.slug}</code>
                    <p className="text-sm text-foreground mt-1 group-hover:text-blue-300 transition-colors">{page.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Blog Branch */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/80 backdrop-blur-xl border-2 border-green-500/50 px-6 py-4 rounded-xl"
              >
                <div className="flex items-center space-x-2 text-green-400">
                  <HiOutlineNewspaper className="w-5 h-5" />
                  <span className="font-semibold">Blog ({blogPosts.length})</span>
                </div>
              </motion.div>
              
              <div className="w-0.5 h-8 bg-gradient-to-b from-green-500/40 to-transparent"></div>
              
              <div className="grid grid-cols-2 gap-8">
                {Object.entries(blogsByCategory).map(([category, posts], catIndex) => (
                  <div key={category} className="flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + catIndex * 0.1 }}
                      className="bg-secondary/10 border border-secondary/30 px-4 py-2 rounded-lg mb-3"
                    >
                      <p className="text-xs font-medium text-secondary">{category}</p>
                      <p className="text-xs text-foreground/60">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
                    </motion.div>
                    
                    <div className="space-y-2">
                      {posts.slice(0, 3).map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + catIndex * 0.1 + index * 0.05 }}
                          className="bg-zinc-800/50 border border-zinc-700 px-3 py-2 rounded-lg hover:border-green-500/50 transition-colors text-sm max-w-xs"
                        >
                          <p className="text-foreground truncate">{post.title}</p>
                        </motion.div>
                      ))}
                      {posts.length > 3 && (
                        <p className="text-xs text-foreground/60 text-center">+{posts.length - 3} more</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
