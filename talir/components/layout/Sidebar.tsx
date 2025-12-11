"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, PieChart, Section, Settings, Plus, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/lib/store'
import { useEffect, useState } from 'react'

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    href: string
    isActive?: boolean
    isCollapsed?: boolean
}

// Fixed dimensions for icon container to ensure perfect "badge" uniformity
const ICON_CONTAINER_CLASS = "flex items-center justify-center w-10 h-10 flex-shrink-0"

function SidebarItem({ icon: Icon, label, href, isActive, isCollapsed }: SidebarItemProps) {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "flex items-center rounded-xl transition-all duration-200 group relative my-1 overflow-hidden",
                    isActive
                        ? "bg-brand-active text-brand-text font-bold"
                        : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                    isCollapsed ? "justify-center px-0 w-10 mx-auto" : "w-full px-2"
                )}
                title={isCollapsed ? label : undefined}
            >
                <div className={ICON_CONTAINER_CLASS}>
                    <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300 ease-sidebar flex items-center",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 pl-2"
                )}>
                    <span className="text-sm font-medium">{label}</span>
                </div>
            </Link>
        </li>
    )
}

function SectionHeader({ label, onAdd, isCollapsed }: { label: string, onAdd?: () => void, isCollapsed?: boolean }) {
    if (isCollapsed) return <li className="my-2"><div className="h-px bg-border w-6 mx-auto" /></li>

    return (
        <li className="flex items-center justify-between px-4 py-2 mt-4 mb-2 group cursor-pointer transition-opacity duration-300 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary group-hover:text-text-secondary transition-colors">{label}</span>
            {onAdd && (
                <button className="text-text-tertiary hover:text-brand-text p-1 rounded-full hover:bg-surface-secondary transition-all">
                    <Plus className="h-3.5 w-3.5" />
                </button>
            )}
        </li>
    )
}

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { isSidebarOpen, toggleSidebar } = useThemeStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isOpen = mounted ? isSidebarOpen : false

    return (
        <aside
            className={cn(
                // Structure: No more sticky. It fills height of flex parent.
                "hidden md:flex flex-col h-full bg-surface border-r border-border z-40 pb-2 overflow-hidden",
                "transition-[width] duration-300 ease-sidebar will-change-[width]",
                isOpen ? "w-[260px]" : "w-[72px]",
                className
            )}
        >
            <nav className="flex-1 w-full overflow-y-auto scrollbar-hide pt-4">
                <ul className="space-y-1 px-3">
                    <SidebarItem icon={Home} label="Home" href="/" isActive={pathname === '/'} isCollapsed={!isOpen} />
                    <SidebarItem icon={LayoutGrid} label="Market Overview" href="/markets" isActive={pathname === '/markets'} isCollapsed={!isOpen} />
                    <SidebarItem icon={TrendingUp} label="Market Activity" href="/activity" isActive={pathname === '/activity'} isCollapsed={!isOpen} />

                    <SectionHeader label="Portfolios" onAdd={() => { }} isCollapsed={!isOpen} />

                    <li>
                        {!isOpen ? (
                            <div className="flex justify-center w-full my-1">
                                <Button size="icon" variant="ghost" className="rounded-xl w-10 h-10 bg-surface-secondary hover:bg-surface-tertiary text-text-secondary">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="px-1 py-1">
                                <div className="p-4 text-left bg-surface-secondary/30 rounded-xl border border-dashed border-border hover:border-border-active cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2 text-brand-text font-medium text-xs">
                                        <Plus className="h-3 w-3" /> <span>New Portfolio</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>

                    <SectionHeader label="Watchlists" onAdd={() => { }} isCollapsed={!isOpen} />

                    <li>
                        {!isOpen ? (
                            <div className="flex justify-center w-full my-1">
                                <div className="w-10 h-10 rounded-xl bg-brand-active text-brand-text flex items-center justify-center font-bold text-xs cursor-pointer border border-border hover:border-brand-text/30 transition-colors">
                                    WL
                                </div>
                            </div>
                        ) : (
                            <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-secondary transition-all group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-active text-brand-text flex items-center justify-center font-bold text-[10px] border border-border group-hover:border-brand-text/30">WL</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-text-primary">Main Watchlist</span>
                                    <span className="text-[10px] text-text-tertiary">5 assets</span>
                                </div>
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="mt-auto border-t border-border bg-surface w-full p-3">
                <div className={cn("flex mb-2", !isOpen ? "justify-center" : "justify-end")}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="w-10 h-10 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-secondary"
                    >
                        {!isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>

                <ul className="space-y-1">
                    <SidebarItem icon={Settings} label="Settings" href="/settings" isActive={pathname === '/settings'} isCollapsed={!isOpen} />
                </ul>
            </div>
        </aside>
    )
}
