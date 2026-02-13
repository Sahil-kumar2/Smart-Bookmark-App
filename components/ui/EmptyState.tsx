import { Bookmark } from 'lucide-react'

interface EmptyStateProps {
    title?: string
    description?: string
    action?: React.ReactNode
}

export default function EmptyState({
    title = "No bookmarks yet",
    description = "Start saving your favorite links to access them anytime",
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6">
                <Bookmark className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-2">
                {title}
            </h3>

            <p className="text-base text-zinc-400 max-w-md mb-6">
                {description}
            </p>

            {action}
        </div>
    )
}
