"use client";

import { motion } from "motion/react";
import { HiOutlineNewspaper } from "react-icons/hi2";
import React from "react";

interface SitemapItem {
  id: string;
  slug: string;
  title: string;
  type: 'page' | 'blog';
  category?: string;
  no_index: boolean;
  is_homepage?: boolean;
  internal_links?: string[];
  parent_slug?: string | null;
}

interface TreeNode extends SitemapItem {
  children: TreeNode[];
}

interface SitemapMindMapProps {
  items: SitemapItem[];
}

export default function SitemapMindMap({ items }: SitemapMindMapProps) {
  // Separate pages and blog posts
  const pages = items.filter(item => item.type === 'page');
  const blogPosts = items.filter(item => item.type === 'blog');
  const homepage = pages.find(p => p.is_homepage);
  
  // Build hierarchical tree structure from pages
  const buildPageTree = (items: SitemapItem[]): TreeNode[] => {
    const itemMap = new Map<string, TreeNode>();
    
    // First pass: create all nodes
    items.forEach(item => {
      itemMap.set(item.slug, {
        ...item,
        children: []
      });
    });
    
    // Second pass: build parent-child relationships
    const rootNodes: TreeNode[] = [];
    items.forEach(item => {
      const node = itemMap.get(item.slug)!;
      
      if (item.parent_slug && itemMap.has(item.parent_slug)) {
        const parent = itemMap.get(item.parent_slug)!;
        parent.children.push(node);
      } else if (!item.is_homepage) {
        // Only add to root if not homepage and no parent
        rootNodes.push(node);
      }
    });
    
    // Homepage is always the root
    if (homepage) {
      const homepageNode = itemMap.get(homepage.slug);
      if (homepageNode) {
        // Add root nodes as children of homepage
        homepageNode.children = [...homepageNode.children, ...rootNodes];
        return [homepageNode];
      }
    }
    
    return rootNodes;
  };
  
  const pageTree = buildPageTree(pages);
  
  const blogsByCategory = blogPosts.reduce((acc, post) => {
    const cat = post.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(post);
    return acc;
  }, {} as Record<string, SitemapItem[]>);

  // Calculate interlink stats
  const allSlugs = items.map(item => item.slug);
  const getInterlinkCount = (page: SitemapItem) => {
    return (page.internal_links || []).filter(link => allSlugs.includes(link)).length;
  };
  
  const getMissingLinks = (page: SitemapItem) => {
    const hasLinks = page.internal_links || [];
    const suggestedLinks = pages.filter(p => 
      p.slug !== page.slug && !hasLinks.includes(p.slug)
    );
    return suggestedLinks.length;
  };
  
  // Render tree node recursively
  const renderTreeNode = (node: TreeNode, level: number = 0, index: number = 0): React.ReactElement => {
    const linkCount = getInterlinkCount(node);
    const missedCount = getMissingLinks(node);
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + (index * 0.05) + (level * 0.1), type: "spring", stiffness: 200 }}
          className={`bg-zinc-800/50 border ${hasChildren ? 'border-secondary/50' : 'border-zinc-700'} px-4 py-2 rounded-lg hover:border-secondary/70 transition-colors group relative`}
          style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : 0 }}
        >
          {hasChildren && level === 0 && (
            <div className="absolute -top-1 -right-1 bg-secondary/20 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
              Parent
            </div>
          )}
          <code className="text-xs text-blue-400">{node.slug}</code>
          <p className="text-sm text-foreground mt-1 group-hover:text-secondary transition-colors">{node.title}</p>
          <div className="flex items-center space-x-2 mt-1 text-xs">
            <span className="text-green-400">🔗 {linkCount}</span>
            {missedCount > 0 && (
              <span className="text-orange-400">⚠️ {missedCount} missed</span>
            )}
            {hasChildren && (
              <span className="text-secondary">📁 {node.children.length}</span>
            )}
          </div>
        </motion.div>
        
        {hasChildren && (
          <>
            {/* Connection line */}
            <div className="w-0.5 h-4 bg-gradient-to-b from-secondary/40 to-transparent my-1"></div>
            {/* Children container */}
            <div className="flex flex-wrap gap-6 justify-center items-start">
              {node.children.map((child, childIndex) => (
                <div key={child.id} className="flex flex-col items-center">
                  {renderTreeNode(child, level + 1, childIndex)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative p-8 min-h-[600px] overflow-auto">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8587e3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a2a3e9" stopOpacity="0.6" />
          </linearGradient>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#8587e3" opacity="0.5" />
          </marker>
        </defs>
      </svg>

      <div className="flex flex-col items-center gap-16 relative">
        {/* Root Node (Homepage) */}
        {homepage && (
          <div className="flex flex-col items-center" style={{ zIndex: 1 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 px-8 py-6 rounded-2xl shadow-lg shadow-yellow-500/30 border-2 border-yellow-400/50 relative"
            >
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                HOME
              </div>
              <h3 className="text-xl font-bold text-white text-center">
                {homepage.title}
              </h3>
              <p className="text-white/80 text-sm text-center mt-1">{homepage.slug}</p>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-white/70">
                <span>🔗 {getInterlinkCount(homepage)} links</span>
                {getMissingLinks(homepage) > 0 && (
                  <span className="text-yellow-200">⚠️ {getMissingLinks(homepage)} missed</span>
                )}
              </div>
            </motion.div>

            {/* Connection Lines to Children */}
            {pageTree.length > 0 && pageTree[0].children.length > 0 && (
              <div className="w-0.5 h-12 bg-gradient-to-b from-secondary/60 to-transparent my-2"></div>
            )}
          </div>
        )}

        {/* Page Tree Structure */}
        {pageTree.length > 0 && (
          <div className="flex flex-col items-center gap-8 w-full">
            {pageTree.map((rootNode, index) => {
              // If homepage exists, render its children; otherwise render root nodes
              if (homepage && rootNode.slug === homepage.slug) {
                return (
                  <div key={rootNode.id} className="flex flex-wrap gap-8 justify-center items-start w-full">
                    {rootNode.children.map((child, childIndex) => (
                      <div key={child.id} className="flex flex-col items-center relative">
                        {/* Vertical connecting line */}
                        <div className="w-0.5 h-8 bg-gradient-to-b from-secondary/40 to-transparent mb-2"></div>
                        {renderTreeNode(child, 0, childIndex)}
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div key={rootNode.id} className="flex flex-col items-center">
                    {renderTreeNode(rootNode, 0, index)}
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Blog Branch (if blog posts exist) */}
        {blogPosts.length > 0 && (
          <div className="flex flex-col items-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900/80 backdrop-blur-xl border-2 border-green-500/50 px-6 py-4 rounded-xl"
            >
              <div className="flex items-center space-x-2 text-green-400">
                <HiOutlineNewspaper className="w-5 h-5" />
                <span className="font-semibold">Blog ({blogPosts.length})</span>
              </div>
            </motion.div>
            
            <div className="w-0.5 h-8 bg-gradient-to-b from-green-500/40 to-transparent my-2"></div>
            
            <div className="grid grid-cols-2 gap-8 mt-4">
              {Object.entries(blogsByCategory).map(([category, posts], catIndex) => (
                <div key={category} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + catIndex * 0.1 }}
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
                        transition={{ delay: 0.7 + catIndex * 0.1 + index * 0.05 }}
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
        )}
      </div>
    </div>
  );
}
