"use client"

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/lib/store'

interface ChartData {
    time: string
    value: number
    volume?: number
}

interface PriceChartProps {
    data: ChartData[]
    colors?: {
        upColor?: string
        downColor?: string
    }
}

export function PriceChart({ data }: PriceChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)
    const { theme } = useThemeStore() // Assuming we have access to theme state
    // Or simpler: check document class for 'dark'

    const [isDarkMode, setIsDarkMode] = useState(false)
    const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'>('1Y')

    // Detect dark mode initially and on change
    useEffect(() => {
        const checkDark = () => document.documentElement.classList.contains('dark')
        setIsDarkMode(checkDark())

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(checkDark())
                }
            })
        })

        observer.observe(document.documentElement, { attributes: true })
        return () => observer.disconnect()
    }, [])

    // Filter data based on timeframe
    const filteredData = (() => {
        if (!data.length) return []
        const now = new Date()
        const cutoff = new Date()

        switch (timeframe) {
            case '1M': cutoff.setMonth(now.getMonth() - 1); break;
            case '3M': cutoff.setMonth(now.getMonth() - 3); break;
            case '6M': cutoff.setMonth(now.getMonth() - 6); break;
            case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
            case '5Y': cutoff.setFullYear(now.getFullYear() - 5); break;
            case 'MAX': return data;
        }

        return data.filter(d => new Date(d.time) >= cutoff)
    })()

    // Determine trend color based on filtered data start/end
    const isPositive = filteredData.length > 2
        ? filteredData[filteredData.length - 1].value >= filteredData[0].value
        : true

    const chartColor = isPositive ? '#10b981' : '#ef4444' // emerald-500 : red-500

    useEffect(() => {
        if (!chartContainerRef.current) return

        // Wait for container to have dimensions
        if (chartContainerRef.current.clientWidth === 0) return

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
            }
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDarkMode ? '#9ca3af' : '#6b7280',
            },
            grid: {
                vertLines: { color: isDarkMode ? '#374151' : '#e5e7eb', visible: false },
                horzLines: { color: isDarkMode ? '#374151' : '#e5e7eb', visible: true, style: 2 },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            autoSize: true,
            handleScale: false,
            handleScroll: false,
        })

        // Add Area Series
        const newSeries = chart.addAreaSeries({
            lineColor: chartColor,
            topColor: chartColor + '40',
            bottomColor: chartColor + '00',
            lineWidth: 2,
        })

        newSeries.setData(filteredData.map(d => ({
            time: d.time as Time,
            value: d.value
        })))

        chart.timeScale().fitContent()

        chartRef.current = chart
        seriesRef.current = newSeries

        const resizeObserver = new ResizeObserver(() => handleResize())
        resizeObserver.observe(chartContainerRef.current)

        return () => {
            resizeObserver.disconnect()
            chart.remove()
            chartRef.current = null
        }
    }, [filteredData, isDarkMode, chartColor])

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="h-[400px] w-full" ref={chartContainerRef} />

            <div className="flex justify-center md:justify-end gap-1 flex-wrap">
                {(['1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={cn(
                            "px-3 py-1 text-xs font-bold rounded-full transition-all",
                            timeframe === tf
                                ? "bg-brand-active text-brand-text shadow-sm"
                                : "text-text-tertiary hover:bg-surface-secondary hover:text-text-secondary"
                        )}
                    >
                        {tf}
                    </button>
                ))}
            </div>
        </div>
    )
}
