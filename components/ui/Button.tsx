import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed'

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg active:scale-[0.98]',
            secondary: 'bg-background-card text-foreground border border-border hover:bg-background-hover hover:border-border-hover',
            ghost: 'text-foreground-muted hover:text-foreground hover:bg-background-hover',
            danger: 'bg-danger text-white hover:bg-danger-hover shadow-md hover:shadow-lg active:scale-[0.98]'
        }

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-11 px-5 text-base',
            lg: 'h-13 px-7 text-lg'
        }

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
