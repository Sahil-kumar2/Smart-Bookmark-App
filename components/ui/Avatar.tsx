import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string
    alt?: string
    fallback: string
    size?: 'sm' | 'md' | 'lg'
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-10 h-10 text-sm',
            lg: 'w-12 h-12 text-base'
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold overflow-hidden ring-2 ring-zinc-800',
                    sizes[size],
                    className
                )}
                {...props}
            >
                {src ? (
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                ) : (
                    <span>{fallback}</span>
                )}
            </div>
        )
    }
)

Avatar.displayName = 'Avatar'

export default Avatar
