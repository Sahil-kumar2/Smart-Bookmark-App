import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        return urlObj.hostname.replace('www.', '')
    } catch {
        return url
    }
}

export function getFaviconUrl(url: string): string {
    const domain = extractDomain(url)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

export function getInitials(email: string): string {
    if (!email) return 'U'
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
}
