'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type BlogPost = {
  id: string | number
  title: string
  slug: string
  excerpt?: string
  _status?: string
  createdAt: string
  updatedAt: string
}

export default function AdminPayloadPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payload-blog-posts?depth=0&limit=100')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPosts(data.docs || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this blog post?')) return
    try {
      const res = await fetch(`/api/payload-blog-posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchPosts()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading blog posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Payload Blog Admin
          </h1>
          <Link
            href="/admin-payload/blog/new"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            + New Post
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Updated</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400">
                    No blog posts yet. Create your first one!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{post.title || '(Untitled)'}</td>
                    <td className="p-4 text-gray-400">{post.slug}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          post._status === 'published'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {post._status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link
                        href={`/admin-payload/blog/${post.id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            Using Payload REST API • {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs mt-2">
            <Link href="/api/payload-health?init=true" className="text-blue-400 hover:underline">
              Check API Health
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

