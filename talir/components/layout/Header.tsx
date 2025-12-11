"use client"

import { Search, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { PriceChangeBadge } from '@/components/ui/Badge'
import { cn, formatPrice } from '@/lib/utils'
import { useState } from 'react'

export function Header({ className }: { className?: string }) {
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [activeTab, setActiveTab] = useState('All')

    // Mock Data based on site content
    const searchData = [
        { type: 'Index', symbol: 'MBI10', name: 'MBI10 Index', price: 6420.50, change: -0.45 },
        { type: 'Index', symbol: 'OMB', name: 'OMB Index', price: 128.30, change: 0.12 },
        { type: 'Stock', symbol: 'KMB', name: 'Komercijalna Banka AD Skopje', price: 18500, change: 1.5 },
        { type: 'Stock', symbol: 'ALK', name: 'Alkaloid AD Skopje', price: 21200, change: 0.8 },
        { type: 'Stock', symbol: 'GRNT', name: 'Granit AD Skopje', price: 1450, change: -2.3 },
        { type: 'Stock', symbol: 'MPT', name: 'Makpetrol AD Skopje', price: 67000, change: 0.0 },
        { type: 'Stock', symbol: 'TEL', name: 'Makedonski Telekom AD', price: 380, change: -0.5 },
    ]

    const tabs = ['All', 'Index', 'Stocks']

    const filteredData = activeTab === 'All'
        ? searchData
        : searchData.filter(item => {
            if (activeTab === 'Stocks') return item.type === 'Stock'
            return item.type === activeTab
        })


    return (
        // Changed: Removed 'sticky top-0'. added 'relative z-50' to stack above everything else (sidebar is z-40 usually)
        <header className={cn(
            "relative z-50 flex h-16 w-full items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md md:px-6 transition-colors duration-300 flex-shrink-0",
            className
        )}>
            <div className="flex items-center gap-4">
                <Logo />
            </div>

            <div className="flex flex-1 items-center justify-center px-4 max-w-2xl transition-all duration-300 mx-auto">
                <div
                    className={cn(
                        "relative hidden w-full md:block transition-all duration-300",
                        isSearchFocused ? "z-50" : ""
                    )}
                >
                    <div className={cn(
                        "relative flex items-center w-full transition-all duration-300",
                        isSearchFocused ? "shadow-lg rounded-t-2xl bg-surface border-x border-t border-border z-10" : "shadow-none"
                    )}>
                        <Search className={cn(
                            "absolute left-4 h-5 w-5 transition-colors",
                            isSearchFocused ? "text-brand-600 dark:text-brand-400" : "text-text-tertiary"
                        )} />
                        <input
                            type="text"
                            placeholder="Search for stocks, ETFs & more"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow clicking items
                            className={cn(
                                "h-11 w-full border-none bg-transparent pl-12 pr-12 text-sm font-medium text-text-primary outline-none transition-all placeholder:text-text-tertiary",
                                !isSearchFocused && "bg-surface-secondary rounded-full border border-transparent hover:bg-surface-tertiary hover:shadow-sm"
                            )}
                        />
                        {isSearchFocused && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 h-8 w-8 text-text-tertiary hover:text-text-primary"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    setIsSearchFocused(false)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Dropdown Results */}
                    {isSearchFocused && (
                        <div className="absolute top-full left-0 right-0 bg-surface border-x border-b border-border rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ease-out origin-top">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto scrollbar-hide">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            setActiveTab(tab)
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap",
                                            activeTab === tab
                                                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                                                : "text-text-tertiary hover:bg-surface-secondary hover:text-text-secondary"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="px-4 py-3 flex items-center gap-2 text-xs text-text-tertiary">
                                <span>About these suggestions</span>
                                <div className="h-4 w-4 rounded-full border border-text-tertiary/30 flex items-center justify-center text-[10px] font-mono cursor-help">i</div>
                            </div>

                            {/* List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <div
                                            key={item.symbol}
                                            className="px-4 py-3 hover:bg-surface-secondary transition-colors cursor-pointer group flex items-center justify-between"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-text-primary transition-colors">
                                                    {item.name}
                                                </span>
                                                <span className="text-xs text-text-tertiary font-bold tracking-wider">
                                                    {item.symbol} <span className="font-normal opacity-50">• {item.type.toUpperCase()}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-mono font-medium text-text-primary">
                                                    {formatPrice(item.price)}
                                                </span>
                                                <PriceChangeBadge change={item.change} variant="pill" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                                        No results found for {activeTab}
                                    </div>
                                )}
                            </div>

                            {/* Footer hint */}
                            <div className="bg-surface-secondary/30 px-4 py-2 text-[10px] text-text-tertiary border-t border-border text-center">
                                Press <kbd className="font-sans px-1 py-0.5 rounded bg-surface border border-border mx-1">Enter</kbd> to see all results
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-5 w-5" />
                </Button>
                <ThemeToggle />
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-brand-500 transition-all dark:ring-offset-zinc-900">
                    U
                </div>
            </div>
        </header>
    )
}
