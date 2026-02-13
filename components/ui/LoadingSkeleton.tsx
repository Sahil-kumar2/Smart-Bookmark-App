export default function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 animate-pulse"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 bg-zinc-800 rounded w-3/4" />
                            <div className="h-3 bg-zinc-800 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
