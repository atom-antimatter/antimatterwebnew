'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type BlogPost = {
  id?: string | number
  title?: string
  slug?: string
  excerpt?: string
  content?: any
  _status?: string
  author?: string
  category?: string
  publishedAt?: string
}

export default function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [post, setPost] = useState<BlogPost>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postId, setPostId] = useState<string>('')

  const isNew = postId === 'new'

  useEffect(() => {
    params.then((p) => setPostId(p.id))
  }, [params])

  useEffect(() => {
    if (!postId) return
    if (!isNew) {
      fetchPost()
    } else {
      setPost({ _status: 'draft', author: 'Antimatter AI' })
      setLoading(false)
    }
  }, [postId, isNew])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/payload-blog-posts/${postId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPost(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const method = isNew ? 'POST' : 'PATCH'
      const url = isNew ? '/api/payload-blog-posts' : `/api/payload-blog-posts/${postId}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.errors?.[0]?.message || `HTTP ${res.status}`)
      }

      const saved = await res.json()
      if (isNew && saved.doc?.id) {
        router.push(`/admin-payload/blog/${saved.doc.id}`)
      } else {
        alert('Saved successfully!')
        await fetchPost()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>
          <Link href="/admin-payload" className="text-blue-400 hover:underline">
            ← Back to List
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={post.title || ''}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={post.slug || ''}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="url-friendly-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={post.excerpt || ''}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Brief description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={post._status || 'draft'}
                onChange={(e) => setPost({ ...post, _status: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={post.category || ''}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select category</option>
                <option value="ai-ml">AI/ML</option>
                <option value="product-dev">Product Dev</option>
                <option value="case-studies">Case Studies</option>
                <option value="company-news">Company News</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <input
              type="text"
              value={post.author || ''}
              onChange={(e) => setPost({ ...post, author: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Antimatter AI"
            />
          </div>

          <div className="pt-6 border-t border-white/10 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <Link
              href="/admin-payload"
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Using Payload REST API at /api/payload-blog-posts</p>
          <p className="mt-2">
            For full rich-text editing, use the{' '}
            <Link href="/admin-old" className="text-blue-400 hover:underline">
              legacy admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

