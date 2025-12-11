"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus, Filter, LayoutList, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { TickerBadge, PriceChangeBadge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { formatPrice } from "@/lib/utils"

// Component for the SVG Sparkline
function Sparkline({ data, color, className }: { data: number[], color: string, className?: string }) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = 100 - ((val - min) / range) * 100
        return `${x},${y}`
    }).join(' ')

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${data.map((val, i) => `L${(i / (data.length - 1)) * 100},${100 - ((val - min) / range) * 100}`).join(' ')} L100,100 Z`}
                fill={color}
                fillOpacity="0.1"
                stroke="none"
            />
        </svg>
    )
}

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Mock Data
    const indexData = [
        { name: 'MBI10', value: 6420.50, change: -0.45, chartData: [6450, 6440, 6435, 6420, 6425, 6415, 6420.50] },
        { name: 'OMB', value: 128.30, change: 0.12, chartData: [128.1, 128.15, 128.2, 128.25, 128.3, 128.28, 128.30] },
        { name: 'MBID', value: 3450.20, change: 1.05, chartData: [3410, 3420, 3435, 3440, 3445, 3448, 3450.20] },
    ]

    const watchlist = [
        { symbol: 'KMB', name: 'Komercijalna Banka AD Skopje', price: 18500, change: 1.5, volume: '2.5M' },
        { symbol: 'ALK', name: 'Alkaloid AD Skopje', price: 21200, change: 0.8, volume: '1.2M' },
        { symbol: 'GRNT', name: 'Granit AD Skopje', price: 1450, change: -2.3, volume: '450K' },
        { symbol: 'MPT', name: 'Makpetrol AD Skopje', price: 67000, change: 0.0, volume: '120K' },
        { symbol: 'TEL', name: 'Makedonski Telekom AD', price: 380, change: -0.5, volume: '80K' },
    ]

    return (
        <div className="space-y-10 font-sans pb-10">
            {/* Top Movers / Index Strip */}
            <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Market Summary</h2>
                    <Button variant="ghost" size="sm" className="text-brand-text">More markets</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {indexData.map((idx) => (
                        <Card key={idx.name} interactive className="group border-none shadow-sm hover:shadow-md bg-surface border-l-4 border-l-transparent hover:border-l-brand-600 overflow-hidden relative">
                            <CardContent className="p-5 relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-text-secondary text-sm tracking-wider">{idx.name}</div>
                                    <PriceChangeBadge change={idx.change} />
                                </div>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold tracking-tight text-text-primary">{idx.value.toLocaleString()}</span>
                                    <span className="text-xs text-text-tertiary font-medium">MKD</span>
                                </div>
                                <div className="h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Sparkline
                                        data={idx.chartData}
                                        color={idx.change >= 0 ? '#16a34a' : '#dc2626'}
                                        className="w-full h-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Watchlist Section (2/3 width) */}
                <div className="lg:col-span-2 space-y-6 animate-slide-up">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-normal text-text-primary">Your Watchlist</h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon"><Filter className="h-5 w-5" /></Button>
                            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> New List
                            </Button>
                        </div>
                    </div>

                    <div className="bg-surface rounded-3xl shadow-card border border-border overflow-hidden">
                        <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                            <div className="col-span-4">Symbol</div>
                            <div className="col-span-3 text-right">Price</div>
                            <div className="col-span-3 text-right">Change</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-border bg-surface">
                            {watchlist.map((stock) => (
                                <div key={stock.symbol} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-secondary transition-colors group cursor-pointer">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <TickerBadge symbol={stock.symbol} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-text-primary">{stock.symbol}</span>
                                            <span className="text-xs text-text-secondary line-clamp-1">{stock.name}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-right font-mono font-medium text-text-primary">
                                        {formatPrice(stock.price).split(' ')[0]} <span className="text-xs text-text-tertiary">MKD</span>
                                    </div>
                                    <div className="col-span-3 flex justify-end">
                                        <PriceChangeBadge change={stock.change} variant="pill" />
                                    </div>
                                    <div className="col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-border text-center">
                            <Button variant="ghost" size="sm" className="text-brand-text font-bold">View all investments</Button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (News/Trends) (1/3 width) */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-normal text-text-primary">Market Trends</h2>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                    </div>

                    <div className="space-y-4">
                        {['Top Gainers', 'Top Losers', 'Most Active'].map((label) => (
                            <Card key={label} interactive className="rounded-2xl border-none shadow-sm hover:shadow-md bg-surface-secondary/50">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <span className="font-bold text-sm text-text-secondary">{label}</span>
                                    <ArrowUpRight className="h-4 w-4 text-text-tertiary" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer mt-8">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <LayoutList className="h-32 w-32" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 relative z-10">Talir Premium</h3>
                        <p className="text-brand-100 text-sm mb-4 relative z-10">Get real-time data and advanced analytics.</p>
                        <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 relative z-10 backdrop-blur-md">
                            Upgrade
                        </Button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New List">
                <div className="space-y-6 pt-2">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">List Name</label>
                        <input
                            type="text"
                            placeholder="e.g. My Dividend portfolio"
                            className="w-full rounded-xl border border-border bg-surface-secondary/50 p-3 text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-text-tertiary">
                        Lists allow you to track a custom set of stocks. You can add stocks to this list later from the market overview page.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Create List</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
