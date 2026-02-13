"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { extractDomain, getFaviconUrl, copyToClipboard } from "@/lib/utils"
import EmptyState from "./ui/EmptyState"
import LoadingSkeleton from "./ui/LoadingSkeleton"
import Modal from "./ui/Modal"
import Input from "./ui/Input"
import { Trash2, Copy, ExternalLink, Clock, Edit2, Link2, Type } from "lucide-react"
import { toast } from "sonner"

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
}

interface BookmarkListProps {
  searchQuery: string
}

export default function BookmarkList({ searchQuery }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [updating, setUpdating] = useState(false)

  async function fetchBookmarks() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.warn('No user found when fetching bookmarks')
        return
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error('Fetch bookmarks error:', error)

        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          toast.error('Network error. Please check your connection.')
        } else if (error.code === '42501') {
          toast.error('Permission denied. Please log in again.')
        } else {
          toast.error('Failed to load bookmarks. Please refresh the page.')
        }
      } else {
        setBookmarks(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching bookmarks:', err)
      toast.error('An unexpected error occurred. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function deleteBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id)

    if (error) {
      console.error('Delete error:', error)

      if (error.code === '42501') {
        toast.error('Permission denied. You can only delete your own bookmarks.')
      } else if (error.code === '23503') {
        toast.error('Cannot delete: This bookmark is referenced elsewhere.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error(error.message || 'Failed to delete bookmark')
      }
    } else {
      toast.success("Bookmark deleted")
    }
  }

  async function handleCopyLink(url: string) {
    try {
      await copyToClipboard(url)
      toast.success("Link copied!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  function handleEdit(bookmark: Bookmark) {
    setEditingBookmark(bookmark)
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url)
  }

  async function handleUpdate() {
    if (!editTitle || !editUrl) {
      toast.error('Please fill all fields')
      return
    }

    if (!editingBookmark) return

    setUpdating(true)

    console.log('Updating bookmark:', {
      id: editingBookmark.id,
      oldTitle: editingBookmark.title,
      newTitle: editTitle,
      oldUrl: editingBookmark.url,
      newUrl: editUrl
    })

    const { data, error } = await supabase
      .from('bookmarks')
      .update({
        title: editTitle,
        url: editUrl.startsWith('http') ? editUrl : `https://${editUrl}`
      })
      .eq('id', editingBookmark.id)
      .select()

    console.log('Update response:', { data, error })

    if (error) {
      console.error('Update error:', error)

      // Specific error messages based on error type
      if (error.code === '42501') {
        toast.error('Permission denied. You can only edit your own bookmarks.')
      } else if (error.code === '23505') {
        toast.error('A bookmark with this URL already exists.')
      } else if (error.code === '23502') {
        toast.error('Both title and URL are required.')
      } else if (error.message?.includes('JWT') || error.message?.includes('session')) {
        toast.error('Session expired. Please log in again.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.')
      } else {
        toast.error(error.message || 'Failed to update bookmark')
      }
    } else if (!data || data.length === 0) {
      console.error('Update returned no data - likely RLS policy blocking update')
      toast.error('Update failed: Permission denied. Please ensure you\'re logged in.')
    } else {
      console.log('Update successful:', data)
      toast.success('Bookmark updated!')
      setEditingBookmark(null)
      setEditTitle('')
      setEditUrl('')
      // Manually refetch to ensure UI updates
      await fetchBookmarks()
    }

    setUpdating(false)
  }

  function handleCloseModal() {
    setEditingBookmark(null)
    setEditTitle('')
    setEditUrl('')
  }

  function getTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Filter bookmarks based on search query
  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const titleMatch = bookmark.title.toLowerCase().includes(query)
    const urlMatch = bookmark.url.toLowerCase().includes(query)

    return titleMatch || urlMatch
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton />
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return <EmptyState />
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-lg mb-2">No bookmarks found</p>
        <p className="text-zinc-500 text-sm">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredBookmarks.map((bookmark, index) => {
        const domain = extractDomain(bookmark.url)
        const faviconUrl = getFaviconUrl(bookmark.url)

        return (
          <div
            key={bookmark.id}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Favicon */}
              <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-zinc-700 transition-colors">
                <img
                  src={faviconUrl}
                  alt={domain}
                  className="w-7 h-7"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5 truncate group-hover:text-blue-400 transition-colors">
                  {bookmark.title}
                </h3>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-400 truncate">{domain}</span>
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {getTimeAgo(bookmark.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleCopyLink(bookmark.url)}
                  className="p-2.5 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4 text-zinc-400 hover:text-zinc-100 transition-colors" />
                </button>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-100 transition-colors" />
                </a>

                <button
                  onClick={() => handleEdit(bookmark)}
                  className="p-2.5 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400 hover:text-blue-500 transition-colors" />
                </button>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="p-2.5 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingBookmark}
        onClose={handleCloseModal}
        title="Edit Bookmark"
      >
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
              <Type className="w-4 h-4" />
              Title
            </label>
            <Input
              type="text"
              placeholder="Enter bookmark title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={updating}
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
              <Link2 className="w-4 h-4" />
              URL
            </label>
            <Input
              type="url"
              placeholder="Enter URL"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              disabled={updating}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCloseModal}
              disabled={updating}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating || !editTitle || !editUrl}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
