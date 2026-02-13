import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon: Icon, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-11 px-4 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 text-sm',
                            'placeholder:text-zinc-500',
                            'hover:border-zinc-700',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            'transition-all duration-200',
                            error && 'border-red-500 focus:ring-red-500',
                            Icon && 'pl-11',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
