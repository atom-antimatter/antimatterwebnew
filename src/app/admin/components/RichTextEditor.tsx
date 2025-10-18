"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { HiOutlinePhoto, HiOutlineVideoCamera, HiOutlineEye } from "react-icons/hi2";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      onChange(value + `\n![Image description](${url})\n`);
    }
  };

  const insertYouTube = () => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      // Extract video ID from various YouTube URL formats
      let videoId = "";
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtube.com")) {
          videoId = urlObj.searchParams.get("v") || "";
        } else if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        }
      } catch (e) {
        // If URL parsing fails, assume it's just the video ID
        videoId = url;
      }

      if (videoId) {
        onChange(value + `\n<div class="video-wrapper">\n  <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n`);
      }
    }
  };

  // Process markdown to add anchors to headers
  const processContent = (content: string) => {
    return content.replace(/^(#{1,2})\s+(.+)$/gm, (_match, hashes, text) => {
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const level = hashes.length;
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            {/* Text Formatting */}
            <button type="button" onClick={insertBold} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Bold">
              <FaBold className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertItalic} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Italic">
              <FaItalic className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertCode} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Code">
              <FaCode className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            
            {/* Headings */}
            <button type="button" onClick={insertH1} className="px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold" title="Heading 1">
              H1
            </button>
            <button type="button" onClick={insertH2} className="px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold" title="Heading 2">
              H2
            </button>
            <button type="button" onClick={insertH3} className="px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold" title="Heading 3">
              H3
            </button>
            
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            
            {/* Lists */}
            <button type="button" onClick={insertBulletList} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Bullet List">
              <FaListUl className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertNumberedList} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Numbered List">
              <FaListOl className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            
            {/* Media */}
            <button type="button" onClick={insertLink} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Insert Link">
              <FaLink className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertImage} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Insert Image">
              <HiOutlinePhoto className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertYouTube} className="p-2 hover:bg-zinc-700 rounded transition-colors" title="Embed YouTube">
              <HiOutlineVideoCamera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors ${
                showPreview ? "bg-secondary/20 text-secondary" : "hover:bg-zinc-700"
              }`}
            >
              <HiOutlineEye className="w-4 h-4" />
              <span className="text-sm">Markdown Preview</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowBlogPreview(!showBlogPreview)}
              className="px-4 py-1.5 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors text-sm"
            >
              Preview Blog Page
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      {!showPreview ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
          placeholder={placeholder || "Write your content in Markdown...\n\n# Heading 1\n## Heading 2\n\n**Bold** *Italic*\n\n[Link](url)\n\n- List item"}
        />
      ) : (
        <div className="w-full min-h-96 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {processContent(value)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Blog Page Preview Modal */}
      {showBlogPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBlogPreview(false)}>
          <div className="bg-background border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Blog Post Preview</h3>
              <button
                onClick={() => setShowBlogPreview(false)}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">{blogTitle || "Blog Post Title"}</h1>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {processContent(value)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          max-width: 100%;
          margin: 1.5rem 0;
        }
        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }
        .prose h1, .prose h2 {
          scroll-margin-top: 100px;
        }
        .prose h1:hover::before,
        .prose h2:hover::before {
          content: "#";
          position: absolute;
          left: -1.5rem;
          color: #8587e3;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
