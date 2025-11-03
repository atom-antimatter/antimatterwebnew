"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import { useCallback, useState, useRef } from "react";
import { uploadBlogImage } from "@/lib/supabaseClient";
import {
  HiOutlinePhoto,
  HiOutlineVideoCamera,
  HiOutlineLink,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onChaptersChange?: (chapters: { id: string; title: string; level: number }[]) => void;
  placeholder?: string;
  blogTitle?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  onChaptersChange,
  placeholder = "Start writing your blog post...",
  blogTitle,
}: TipTapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use custom heading extension
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }).extend({
        // Auto-generate IDs for headings
        addAttributes() {
          return {
            id: {
              default: null,
              parseHTML: (element) => element.getAttribute("id"),
              renderHTML: (attributes) => {
                if (!attributes.id) {
                  return {};
                }
                return { id: attributes.id };
              },
            },
          };
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "blog-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "blog-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "blog-video",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                handleImageUpload(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Extract chapters for navigation
      if (onChaptersChange) {
        const chapters = extractChapters(editor);
        onChaptersChange(chapters);
      }
    },
  });

  const extractChapters = (editor: Editor) => {
    const chapters: { id: string; title: string; level: number }[] = [];
    const json = editor.getJSON();
    
    const traverse = (node: any) => {
      if (node.type === "heading" && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
        const text = node.content?.map((n: any) => n.text || "").join("") || "";
        const id = generateAnchorId(text);
        chapters.push({
          id,
          title: text,
          level: node.attrs.level,
        });
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    if (json.content) {
      json.content.forEach(traverse);
    }
    
    return chapters;
  };

  const generateAnchorId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleImageUpload = async (file: File) => {
    if (!editor) return;
    
    setIsUploading(true);
    try {
      const result = await uploadBlogImage(file);
      
      if ("url" in result) {
        editor.chain().focus().setImage({ src: result.url }).run();
      } else {
        alert("Failed to upload image: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addYouTube = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 sticky top-0 z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("bold") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Bold"
            >
              <FaBold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("italic") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Italic"
            >
              <FaItalic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("underline") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Underline"
            >
              <FaUnderline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("strike") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Strikethrough"
            >
              <FaStrikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("code") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Code"
            >
              <FaCode className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1"></div>

            {/* Headings */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold ${
                editor.isActive("heading", { level: 1 }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold ${
                editor.isActive("heading", { level: 2 }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Heading 2 (Chapter)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 hover:bg-zinc-700 rounded transition-colors text-sm font-bold ${
                editor.isActive("heading", { level: 3 }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Heading 3 (Section)"
            >
              H3
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1"></div>

            {/* Alignment */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive({ textAlign: "left" }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Align Left"
            >
              <FaAlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive({ textAlign: "center" }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Align Center"
            >
              <FaAlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive({ textAlign: "right" }) ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Align Right"
            >
              <FaAlignRight className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1"></div>

            {/* Lists */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("bulletList") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Bullet List"
            >
              <FaListUl className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("orderedList") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Numbered List"
            >
              <FaListOl className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("blockquote") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Quote"
            >
              <FaQuoteRight className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1"></div>

            {/* Media */}
            <button
              type="button"
              onClick={addLink}
              className={`p-2 hover:bg-zinc-700 rounded transition-colors ${
                editor.isActive("link") ? "bg-zinc-700 text-secondary" : ""
              }`}
              title="Insert Link"
            >
              <HiOutlineLink className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addImage}
              disabled={isUploading}
              className="p-2 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
              title="Insert Image"
            >
              <HiOutlinePhoto className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addYouTube}
              className="p-2 hover:bg-zinc-700 rounded transition-colors"
              title="Embed YouTube"
            >
              <HiOutlineVideoCamera className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors ${
              showPreview ? "bg-secondary/20 text-secondary" : "hover:bg-zinc-700"
            }`}
          >
            {showPreview ? (
              <>
                <HiOutlineEyeSlash className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </>
            ) : (
              <>
                <HiOutlineEye className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {!showPreview ? (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <EditorContent editor={editor} />
          {isUploading && (
            <div className="px-6 pb-4 text-sm text-secondary">Uploading image...</div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-6 py-4">
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
        className="hidden"
      />

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(246, 246, 253, 0.3);
          pointer-events: none;
          height: 0;
        }
        .blog-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .blog-link {
          color: #a2a3e9;
          text-decoration: underline;
        }
        .blog-link:hover {
          color: #c7c8f2;
        }
        .blog-video {
          width: 100%;
          max-width: 640px;
          height: 360px;
          margin: 1.5rem auto;
          display: block;
          border-radius: 8px;
        }
        .ProseMirror h2 {
          scroll-margin-top: 100px;
          position: relative;
        }
        .ProseMirror h3 {
          scroll-margin-top: 100px;
        }
      `}</style>
    </div>
  );
}

