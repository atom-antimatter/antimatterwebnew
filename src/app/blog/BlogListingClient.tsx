"use client";

import { useState, useMemo } from "react";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import Reveal from "@/components/ui/Reveal";
import TransitionLink from "@/components/ui/TransitionLink";
import LightRays from "@/components/ui/LightRays";
import MainLayout from "@/components/ui/MainLayout";
import { HiOutlineClock, HiOutlineMagnifyingGlass, HiOutlineTag } from "react-icons/hi2";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  author: string;
  category: string | null;
  reading_time: number | null;
  published_at: string | null;
}

interface BlogListingClientProps {
  posts: BlogPost[];
  categories: string[];
}

export default function BlogListingClient({ posts, categories }: BlogListingClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Featured post (most recent)
  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <LightRays />
      <MainLayout className="pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <TitleH1Anim className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Blog & Insights
            </TitleH1Anim>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Explore our thoughts on AI, product development, and digital innovation.
            </p>
          </Reveal>
        </div>

        {/* Search and Filter */}
        <Reveal delay={0.3}>
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === null
                    ? "bg-secondary text-white"
                    : "bg-zinc-900/50 border border-zinc-800 text-foreground/70 hover:text-foreground"
                }`}
              >
                <HiOutlineTag className="w-5 h-5" />
                <span>All</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-secondary text-white"
                      : "bg-zinc-900/50 border border-zinc-800 text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Featured Post */}
        {featuredPost && (
          <Reveal delay={0.4}>
            <TransitionLink
              href={`/blog/${featuredPost.slug}`}
              className="group block bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden hover:border-secondary/50 transition-all mb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {featuredPost.featured_image && (
                  <div className="aspect-video lg:aspect-square overflow-hidden">
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.featured_image_alt || featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="text-xs text-secondary font-medium mb-3 block">FEATURED</span>
                  {featuredPost.category && (
                    <span className="text-sm text-foreground/60 font-medium mb-3 block">
                      {featuredPost.category}
                    </span>
                  )}
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground group-hover:text-secondary transition-colors mb-4">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-foreground/70 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-foreground/50">
                    <span>{formatDate(featuredPost.published_at)}</span>
                    {featuredPost.reading_time && (
                      <div className="flex items-center space-x-1">
                        <HiOutlineClock className="w-4 h-4" />
                        <span>{featuredPost.reading_time} min read</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TransitionLink>
          </Reveal>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post, index) => (
              <Reveal key={post.id} delay={0.1 * (index % 9)}>
                <TransitionLink
                  href={`/blog/${post.slug}`}
                  className="group block bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden hover:border-secondary/50 transition-all h-full flex flex-col"
                >
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    {post.category && (
                      <span className="text-xs text-secondary font-medium mb-2 block">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-secondary transition-colors mb-3 flex-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-foreground/60 line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-foreground/50 pt-4 border-t border-zinc-800">
                      <span>{formatDate(post.published_at)}</span>
                      {post.reading_time && (
                        <div className="flex items-center space-x-1">
                          <HiOutlineClock className="w-4 h-4" />
                          <span>{post.reading_time} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TransitionLink>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={0.5}>
            <div className="text-center py-20">
              <p className="text-xl text-foreground/60">
                {searchQuery || selectedCategory
                  ? "No posts found matching your criteria."
                  : "No blog posts available yet."}
              </p>
            </div>
          </Reveal>
        )}
      </MainLayout>
    </>
  );
}

