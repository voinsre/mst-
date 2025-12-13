"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Bell, Share2, Globe, Phone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { PriceChangeBadge } from '@/components/ui/Badge'
import { ClientPriceChart } from '@/components/charts/ClientPriceChart'
import { formatPrice } from '@/lib/utils'
import { StockPageActions } from '@/components/stock/StockPageActions'
import { PortfolioHoldingIndicator } from '@/components/portfolio/PortfolioHoldingIndicator'
import { NewsSection } from '@/components/common/NewsSection'
import { ResponsiveText } from '@/components/ui/ResponsiveText'
import { StockSummary, StockHistoryItem } from '@/lib/types'

// Replicate the ChartData interface locally or import it
interface ChartData {
    time: string
    value: number
    volume?: number
}

interface StockClientProps {
    stock: any // Using specific type if available, e.g. Stock from lib/types
    history: StockHistoryItem[]
    currentPrice: number
    chartData: ChartData[]
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX'

export function StockClient({ stock, history, currentPrice, chartData }: StockClientProps) {
    const [timeframe, setTimeframe] = useState<Timeframe>('1Y')

    // Filter Logic (Lifted from PriceChart)
    const filteredData = useMemo(() => {
        if (!chartData.length) return []
        const now = new Date()
        const cutoff = new Date()

        switch (timeframe) {
            case '1D': cutoff.setDate(now.getDate() - 1); break; // Note: Daily data usually implies 1D is just the latest point or diff
            case '5D': cutoff.setDate(now.getDate() - 5); break;
            case '1M': cutoff.setMonth(now.getMonth() - 1); break;
            case '3M': cutoff.setMonth(now.getMonth() - 3); break;
            case '6M': cutoff.setMonth(now.getMonth() - 6); break;
            case 'YTD': cutoff.setMonth(0); cutoff.setDate(1); cutoff.setFullYear(now.getFullYear()); break;
            case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
            case '5Y': cutoff.setFullYear(now.getFullYear() - 5); break;
            case 'MAX': return chartData;
        }

        return chartData.filter(d => new Date(d.time) >= cutoff)
    }, [chartData, timeframe])

    // Calculate Dynamic Stats
    const displayStats = useMemo(() => {
        // Default to "Daily" stats if 1D or logic fails
        let change = stock.history[0]?.percent_change || 0
        let absChange = (currentPrice * change) / 100
        let label = "Today"

        if (timeframe !== '1D' && filteredData.length > 0) {
            const first = filteredData[0]
            const last = filteredData[filteredData.length - 1] // or currentPrice

            // Should accurate calculation use currentPrice as the "latest"?
            const latestVal = currentPrice
            const startVal = first.value

            if (startVal !== 0) {
                absChange = latestVal - startVal
                change = (absChange / startVal) * 100
            }

            // Set Label based on timeframe
            if (timeframe === 'YTD') label = 'Year-to-Date'
            else if (timeframe === 'MAX') label = 'All Time'
            else label = timeframe
        } else if (timeframe === '1D') {
            // Keep default daily calc
            const latest = history[0] || {}
            change = latest.percent_change || 0
            absChange = (currentPrice * change) / 100
        }

        return { change, absChange, label }
    }, [timeframe, filteredData, currentPrice, stock, history])

    // Derived Stats for Sidebar
    const latest = history[0] || {}
    const low = latest.min_price
    const high = latest.max_price
    const volume = latest.quantity
    const turnover = latest.total_turnover_mkd
    const avgPrice = latest.average_price

    // 52 Week Range calc (could be outside, but fast enough here)
    const yearLow = useMemo(() => {
        const yearData = chartData.filter(d => {
            const cut = new Date(); cut.setFullYear(cut.getFullYear() - 1);
            return new Date(d.time) >= cut
        })
        return yearData.length ? Math.min(...yearData.map(d => d.value)) : 0
    }, [chartData])

    const yearHigh = useMemo(() => {
        const yearData = chartData.filter(d => {
            const cut = new Date(); cut.setFullYear(cut.getFullYear() - 1);
            return new Date(d.time) >= cut
        })
        return yearData.length ? Math.max(...yearData.map(d => d.value)) : 0
    }, [chartData])


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
                    <div className="flex flex-col gap-1 items-start">
                        <div className="bg-brand-active/10 text-brand-text px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase border border-brand-active/20">
                            {stock.company_code}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                            {stock.company_name}
                        </h1>
                    </div>
                    <div className="flex items-end gap-4 mt-2">
                        <span className="text-4xl font-mono font-bold text-text-primary tracking-tighter">
                            {formatPrice(currentPrice)}
                        </span>
                        <div className="mb-1.5 flex items-center gap-2">
                            <PriceChangeBadge change={displayStats.change} className="scale-110 origin-left" />
                            <span className="text-sm text-text-tertiary font-mono">
                                ({displayStats.absChange > 0 ? '+' : ''}{displayStats.absChange.toFixed(2)}) {displayStats.label}
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-text-tertiary">
                        Last trade: {latest.date} • {stock.sector ? stock.sector : 'Market: MSE'}
                    </span>
                </div>

                {/* Actions */}
                <StockPageActions stockCode={stock.company_code} stockData={{
                    code: stock.company_code,
                    company_code: stock.company_code,
                    company_name: stock.company_name,
                    price: currentPrice,
                    change: displayStats.absChange, // Using displayed change or daily? Usually Actions use Daily default, but keeping consistent is OK
                    changePercent: displayStats.change
                }} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">


                    <Card className="p-1 border-none shadow-none bg-transparent lg:bg-surface lg:shadow-card lg:border lg:border-border">
                        <CardHeader className="px-0 pt-0 lg:px-6 lg:pt-6 border-none pb-2">
                            <h2 className="text-lg font-bold text-text-primary">Price Performance</h2>
                        </CardHeader>
                        <CardContent className="px-0 lg:px-6 pb-0 lg:pb-6 min-h-[450px]">
                            <ClientPriceChart
                                data={filteredData} // Passing Pre-Filtered Data
                                timeframe={timeframe}
                                onTimeframeChange={setTimeframe}
                            // We might need to tell PriceChart NOT to filter internally if we pass pre-filtered data
                            // But keeping PriceChart dump is better.
                            />
                        </CardContent>
                    </Card>

                    <NewsSection stockCode={stock.company_code} title="In the news" />
                </div>

                {/* Right Sidebar (Stats & Info) */}
                <div className="flex flex-col gap-6">
                    <PortfolioHoldingIndicator stockCode={stock.company_code} currentPrice={currentPrice} />

                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-bold text-text-primary">Key Statistics</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {low !== null && high !== null && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Day Range</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(low)} - {formatPrice(high)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-text-secondary">52 Week Range</span>
                                <span className="text-sm font-mono font-medium text-text-primary">
                                    {formatPrice(yearLow)} - {formatPrice(yearHigh)}
                                </span>
                            </div>

                            {avgPrice > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Average Price</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(avgPrice)}
                                    </span>
                                </div>
                            )}

                            {volume > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Volume</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {volume.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {turnover > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">Turnover</span>
                                    <span className="text-sm font-mono font-medium text-text-primary">
                                        {formatPrice(turnover)}
                                    </span>
                                </div>
                            )}

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
