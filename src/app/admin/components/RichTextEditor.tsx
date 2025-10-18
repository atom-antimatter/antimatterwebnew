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
      <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={insertImage}
            className="flex items-center space-x-1 px-3 py-1.5 hover:bg-zinc-700 rounded transition-colors text-foreground/80 hover:text-foreground"
            title="Insert Image"
          >
            <HiOutlinePhoto className="w-4 h-4" />
            <span className="text-sm">Image</span>
          </button>
          <button
            type="button"
            onClick={insertYouTube}
            className="flex items-center space-x-1 px-3 py-1.5 hover:bg-zinc-700 rounded transition-colors text-foreground/80 hover:text-foreground"
            title="Embed YouTube"
          >
            <HiOutlineVideoCamera className="w-4 h-4" />
            <span className="text-sm">YouTube</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-zinc-700 rounded transition-colors text-secondary"
        >
          <HiOutlineEye className="w-4 h-4" />
          <span className="text-sm">{showPreview ? "Edit" : "Preview"}</span>
        </button>
      </div>

      {/* Editor/Preview */}
      <div className="grid grid-cols-1 gap-4">
        {!showPreview ? (
          <div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-96 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              placeholder={placeholder || "Write your content in Markdown...\n\n# Heading 1\n## Heading 2\n\n**Bold** *Italic*\n\n[Link](url)\n\n- List item"}
            />
            <div className="mt-2 text-xs text-foreground/60 space-y-1">
              <p>📝 <strong>Markdown Tips:</strong></p>
              <p>• Use # for H1, ## for H2, ### for H3 (anchors auto-generated)</p>
              <p>• **bold** *italic* [link](url) for formatting</p>
              <p>• Click &quot;Image&quot; or &quot;YouTube&quot; buttons to insert media</p>
            </div>
          </div>
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
      </div>

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
