import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, Share2, Star, Globe, Phone, ExternalLink } from 'lucide-react'
import { getStock, getChartData } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { PriceChangeBadge } from '@/components/ui/Badge'
import { ClientPriceChart } from '@/components/charts/ClientPriceChart'
import { formatPrice } from '@/lib/utils'

export default async function StockPage({ params }: { params: Promise<{ code: string }> }) {
    const resolvedParams = await params
    const code = resolvedParams.code

    // Check if code is valid/exists to avoid unnecessary fetch failures
    if (!code) {
        notFound()
    }

    const stock = await getStock(code)

    if (!stock) {
        notFound()
    }

    const { history } = stock
    const latest = history[0] || {}
    const chartData = getChartData(history, 60) // Default load max or decent amount

    // Safe accessors
    const currentPrice = latest.last_transaction_price || 0
    const priceChange = latest.percent_change || 0
    const absoluteChange = (currentPrice * priceChange) / 100 // Estimate absolute change from pct

    // Stats
    const low = latest.min_price
    const high = latest.max_price
    const volume = latest.quantity
    const turnover = latest.total_turnover_mkd
    const avgPrice = latest.average_price

    // 52 Week High/Low (Simplified calculation from loaded history)
    const yearHistory = getChartData(history, 12)
    const yearHigh = yearHistory.length ? Math.max(...yearHistory.map(d => d.value)) : 0
    const yearLow = yearHistory.length ? Math.min(...yearHistory.map(d => d.value)) : 0

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 animate-fade-in w-full max-w-[1600px] mx-auto">
            {/* Breadcrumb / Back */}
            <Link href="/" className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Overview</span>
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-active text-brand-text px-3 py-1 rounded-lg text-lg font-bold tracking-widest shadow-sm">
                            {stock.company_code}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                            {stock.company_name}
                        </h1>
                    </div>
                    <div className="flex items-end gap-4 mt-2">
                        <span className="text-4xl font-mono font-bold text-text-primary tracking-tighter">
                            {formatPrice(currentPrice)}
                        </span>
                        <div className="mb-1.5 flex items-center gap-2">
                            <PriceChangeBadge change={priceChange} className="scale-110 origin-left" />
                            <span className="text-sm text-text-tertiary font-mono">
                                ({absoluteChange > 0 ? '+' : ''}{absoluteChange.toFixed(2)})
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-text-tertiary">
                        Last trade: {latest.date} • {stock.sector ? stock.sector : 'Market: MSE'}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-start md:self-end">
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Star className="h-4 w-4" /> <span className="hidden sm:inline">Watch</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Alert</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section (2/3 width) */}
                <Card className="lg:col-span-2 p-1 border-none shadow-none bg-transparent lg:bg-surface lg:shadow-card lg:border lg:border-border">
                    <CardHeader className="px-0 pt-0 lg:px-6 lg:pt-6 border-none pb-2">
                        <h2 className="text-lg font-bold text-text-primary">Price Performance</h2>
                    </CardHeader>
                    <CardContent className="px-0 lg:px-6 pb-0 lg:pb-6 min-h-[450px]">
                        <ClientPriceChart data={getChartData(history, 60)} />
                        {/* <div className="flex items-center justify-center h-full text-text-tertiary">Chart Disabled for Debug</div> */}
                    </CardContent>
                </Card>

                {/* Right Sidebar (Stats & Info) */}
                <div className="flex flex-col gap-6">

                    {/* Key Statistics */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-bold text-text-primary">Key Statistics</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Day Range */}
                            {low !== null && high !== null && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Day Range</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(low)} - {formatPrice(high)}
                                    </span>
                                </div>
                            )}

                            {/* 52 Week Range */}
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-text-secondary">52 Week Range</span>
                                <span className="text-sm font-mono font-medium text-text-primary">
                                    {formatPrice(yearLow)} - {formatPrice(yearHigh)}
                                </span>
                            </div>

                            {/* Avg Price */}
                            {avgPrice > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Average Price</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(avgPrice)}
                                    </span>
                                </div>
                            )}

                            {/* Volume */}
                            {volume > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Volume</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {volume.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {/* Turnover */}
                            {turnover > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Turnover</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(turnover)}
                                    </span>
                                </div>
                            )}

                            {/* First Trade Date */}
                            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                <span className="text-sm text-text-secondary">First Trade</span>
                                <span className="text-sm font-medium text-text-primary">
                                    {stock.first_trade_date}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Info */}
                    {(stock.issuer_data?.address || stock.issuer_data?.phone || stock.issuer_data?.website) && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-bold text-text-primary">Company Info</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stock.issuer_data.address && (
                                    <div className="text-sm text-text-secondary">
                                        <p className="font-medium text-text-primary mb-1">Address</p>
                                        {stock.issuer_data.address}, {stock.issuer_data.city}
                                    </div>
                                )}

                                {stock.issuer_data.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-text-tertiary" />
                                        <a href={`tel:${stock.issuer_data.phone}`} className="text-text-primary hover:text-brand-500 hover:underline transition-colors">
                                            {stock.issuer_data.phone}
                                        </a>
                                    </div>
                                )}

                                {stock.issuer_data.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-text-tertiary" />
                                        <a
                                            href={`https://${stock.issuer_data.website}?ref=talir`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand-500 hover:text-brand-600 hover:underline transition-colors flex items-center gap-1"
                                        >
                                            {stock.issuer_data.website}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    )
}
