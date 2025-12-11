import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg overflow-hidden group">
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-none" />

                <span className="font-display text-xl font-bold italic relative z-10">T</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-text-primary">
                Talir
            </span>
        </div>
    )
}
