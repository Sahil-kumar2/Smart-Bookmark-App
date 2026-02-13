'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import Avatar from './ui/Avatar'
import Dropdown, { DropdownItem, DropdownSeparator } from './ui/Dropdown'
import { Bookmark, LogOut, Search, User } from 'lucide-react'

interface NavbarProps {
    user: any
    searchQuery: string
    onSearchChange: (query: string) => void
}

export default function Navbar({ user, searchQuery, onSearchChange }: NavbarProps) {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav className="sticky top-0 z-50 bg-zinc-900/70 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Bookmark className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold text-zinc-100">
                        SmartMark
                    </span>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-9 pl-10 pr-4 bg-zinc-950 text-zinc-100 text-sm rounded-lg border border-zinc-800 placeholder:text-zinc-500 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* User Menu */}
                <Dropdown
                    trigger={
                        <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                            <Avatar
                                src={user?.user_metadata?.avatar_url}
                                fallback={getInitials(user?.email || '')}
                                size="sm"
                            />
                        </div>
                    }
                >
                    <div className="py-2">
                        <div className="px-4 py-3 border-b border-zinc-800">
                            <p className="text-sm font-medium text-zinc-100 truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Free Plan
                            </p>
                        </div>

                        <div className="py-2">
                            <DropdownItem icon={<LogOut />} onClick={handleLogout} danger>
                                Sign Out
                            </DropdownItem>
                        </div>
                    </div>
                </Dropdown>
            </div>
        </nav>
    )
}
