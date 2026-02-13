'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Input from './ui/Input'
import { Link2, Type, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function BookmarkForm() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const addBookmark = async () => {
    if (!title || !url) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url: url.startsWith('http') ? url : `https://${url}`,
        user_id: user.id
      }
    ])

    if (error) {
      console.error('Insert error:', error)

      // Specific error messages
      if (error.code === '23505') {
        toast.error('This bookmark already exists in your collection')
      } else if (error.code === '23502') {
        toast.error('Please provide both title and URL')
      } else if (error.code === '42501') {
        toast.error('Permission denied. Please log in again.')
      } else if (error.message?.includes('JWT') || error.message?.includes('session')) {
        toast.error('Session expired. Please log in again.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error(error.message || 'Failed to add bookmark')
      }
    } else {
      toast.success('Bookmark added!')
      setTitle('')
      setUrl('')
    }

    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      addBookmark()
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Add New Bookmark
        </h2>
      </div>

      <div className="space-y-4">
        <Input
          icon={Type}
          placeholder="Enter bookmark title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <Input
          icon={Link2}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <button
          onClick={addBookmark}
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </div>
    </div>
  )
}
