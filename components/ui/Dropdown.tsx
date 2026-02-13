'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
    trigger: React.ReactNode
    children: React.ReactNode
    align?: 'left' | 'right'
}

export default function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        'absolute top-full mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-50 overflow-hidden animate-scale-in',
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

interface DropdownItemProps {
    onClick?: () => void
    icon?: React.ReactNode
    children: React.ReactNode
    danger?: boolean
}

export function DropdownItem({ onClick, icon, children, danger }: DropdownItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                danger
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'text-zinc-100 hover:bg-zinc-800'
            )}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            <span>{children}</span>
        </button>
    )
}

export function DropdownSeparator() {
    return <div className="h-px bg-zinc-800 my-1" />
}
