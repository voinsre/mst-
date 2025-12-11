import Link from 'next/link'
import { PriceChangeBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { StockSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StockRowProps {
    stock: StockSummary
    showVolume?: boolean
    className?: string
}

export function StockRow({ stock, showVolume = false, className }: StockRowProps) {
    return (
        <Link
            href={`/stock/${stock.code}`}
            className={cn(
                "flex items-center justify-between p-4 hover:bg-surface-secondary transition-colors border-b border-border last:border-0 group",
                className
            )}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-8 flex items-center justify-center bg-surface-tertiary/30 rounded font-bold text-xs text-text-secondary group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-400 transition-colors">
                    {stock.code}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-text-primary truncate group-hover:text-brand-active transition-colors">
                        {stock.name}
                    </span>
                    {showVolume && (
                        <span className="text-[10px] text-text-tertiary">
                            Vol: {stock.volume.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-medium text-text-primary">
                        {formatPrice(stock.price)}
                    </span>
                </div>
                <PriceChangeBadge change={stock.changePercent} variant="pill" className="w-[72px]" />
            </div>
        </Link>
    )
}
