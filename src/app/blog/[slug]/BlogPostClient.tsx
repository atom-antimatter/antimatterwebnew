"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import TitleH1Anim from "@/components/ui/TitleH1Anim";
import Reveal from "@/components/ui/Reveal";
import LightRays from "@/components/ui/LightRays";
import CTASection from "@/components/CTASection";
import TransitionLink from "@/components/ui/TransitionLink";
import { HiOutlineClock, HiOutlineCalendar, HiOutlineShare, HiOutlineArrowUp } from "react-icons/hi2";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

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
  published_at: string | null;
  reading_time: number | null;
  chapters: Array<{ id: string; title: string; level: number }> | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category: string | null;
  reading_time: number | null;
  published_at: string | null;
}

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: RelatedPost[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Parallax effect for hero image
  const imageY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));

      // Show scroll to top button
      setShowScrollTop(scrollTop > 500);

      // Highlight active chapter
      if (post.chapters) {
        for (const chapter of post.chapters) {
          const element = document.getElementById(chapter.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= 200) {
              setActiveChapter(chapter.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [post.chapters]);

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sharePost = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

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
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-secondary to-purple-600"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Featured Image with Parallax */}
        {post.featured_image && (
          <motion.div
            className="absolute inset-0"
            style={{ y: imageY, opacity: imageOpacity }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Hero Content */}
        <div className="relative z-20 w-main mx-auto px-6 py-20">
          <Reveal>
            {post.category && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className="px-4 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </motion.div>
            )}
          </Reveal>

          <TitleH1Anim className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl">
            {post.title}
          </TitleH1Anim>

          <Reveal delay={0.4}>
            <div className="flex items-center space-x-6 text-foreground/60 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <HiOutlineCalendar className="w-5 h-5" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              {post.reading_time && (
                <div className="flex items-center space-x-2">
                  <HiOutlineClock className="w-5 h-5" />
                  <span>{post.reading_time} min read</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span>By {post.author}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-background via-zinc-900/50 to-background">
        <div className="w-main mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Chapter Navigation */}
          {post.chapters && post.chapters.length > 0 && (
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {post.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => scrollToChapter(chapter.id)}
                        className={`block w-full text-left text-sm transition-colors ${
                          chapter.level === 3 ? "pl-4" : ""
                        } ${
                          activeChapter === chapter.id
                            ? "text-secondary font-medium"
                            : "text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        {chapter.title}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Share Buttons */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                    <HiOutlineShare className="w-5 h-5" />
                    <span>Share</span>
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => sharePost("twitter")}
                      className="flex items-center space-x-2 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <FaTwitter className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button
                      onClick={() => sharePost("linkedin")}
                      className="flex items-center space-x-2 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <FaLinkedin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => sharePost("facebook")}
                      className="flex items-center space-x-2 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <FaFacebook className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Facebook</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Article Content */}
          <article
            ref={contentRef}
            className={post.chapters && post.chapters.length > 0 ? "lg:col-span-9" : "lg:col-span-12 max-w-4xl mx-auto"}
          >
            <Reveal>
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:scroll-mt-24
                  prose-h2:text-3xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mb-4 prose-h2:mt-12
                  prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-foreground prose-h3:mb-3 prose-h3:mt-8
                  prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:text-foreground/80 prose-ol:text-foreground/80
                  prose-li:my-2
                  prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/70
                  prose-code:text-secondary prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
                  prose-img:rounded-xl prose-img:my-8 prose-img:shadow-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </Reveal>
          </article>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="w-main mx-auto px-6 py-20">
            <Reveal>
              <h2 className="text-3xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <Reveal key={relatedPost.id} delay={index * 0.1}>
                    <TransitionLink
                      href={`/blog/${relatedPost.slug}`}
                      className="group block bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden hover:border-secondary/50 transition-all"
                    >
                      {relatedPost.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.featured_image_alt || relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        {relatedPost.category && (
                          <span className="text-xs text-secondary font-medium mb-2 block">
                            {relatedPost.category}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors mb-2">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        {relatedPost.reading_time && (
                          <div className="flex items-center space-x-2 text-xs text-foreground/50">
                            <HiOutlineClock className="w-4 h-4" />
                            <span>{relatedPost.reading_time} min read</span>
                          </div>
                        )}
                      </div>
                    </TransitionLink>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        )}

        {/* CTA Section */}
        <CTASection />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-secondary hover:bg-secondary/80 text-white rounded-full shadow-lg transition-colors z-40"
          title="Scroll to top"
        >
          <HiOutlineArrowUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image,
            author: {
              "@type": "Person",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "Antimatter AI",
              logo: {
                "@type": "ImageObject",
                url: "https://www.antimatterai.com/images/antimatter-ai-logo.svg",
              },
            },
            datePublished: post.published_at,
            dateModified: post.published_at,
          }),
        }}
      />
    </>
  );
}




