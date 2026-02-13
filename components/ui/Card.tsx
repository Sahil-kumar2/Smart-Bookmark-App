import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glass?: boolean
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass, hover, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border p-6',
                    glass
                        ? 'glass'
                        : 'bg-background-card border-border',
                    hover && 'hover:border-border-hover hover:shadow-lg cursor-pointer',
                    'transition-all duration-200',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export default Card
