'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import BookmarkForm from '../components/BookmarkForm'
import BookmarkList from '../components/BookmarkList'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-zinc-900/70 backdrop-blur-md border-b border-zinc-800 animate-pulse" />
        <div className="w-full max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="h-10 bg-zinc-800 rounded w-64 mb-3 animate-pulse" />
            <div className="h-5 bg-zinc-800 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="radial-gradient fixed inset-0 -z-10" />
      <Navbar user={user} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="w-full max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-zinc-100 mb-3 tracking-tight">
            Your Bookmarks
          </h1>
          <p className="text-lg text-zinc-400">
            Save and organize your favorite links in one place
          </p>
        </div>

        {/* Two-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Form */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <BookmarkForm />
          </div>

          {/* Right: List */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <BookmarkList searchQuery={searchQuery} />
          </div>
        </div>
      </main>
    </div>
  )
}
