import { StockData, StockSummary, DailyPrice, MarketIndex, NewsItem } from './types'
import { transliterate } from './transliterate'

import { promises as fs } from 'fs'
import path from 'path'

// Helper to fetch JSON from public folder (Server Side)
async function fetchJson<T>(relativePath: string): Promise<T | null> {
    try {
        const fullPath = path.join(process.cwd(), 'public', 'data', relativePath)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        return JSON.parse(fileContents)
    } catch (e) {
        console.error(`Failed to read ${relativePath}`, e)
        return null
    }
}

// Fetch all stocks summary
export async function getAllStocks(): Promise<StockSummary[]> {
    try {
        const data = await fetchJson<any[]>('market_summary.json')
        if (!data) return []

        return data.map((item: any) => ({
            code: item.code,
            name: transliterate(item.name || ''),
            price: item.price,
            change: 0,
            changePercent: item.change_pct || 0,
            volume: item.volume || 0,
            turnover: item.turnover || 0,
            date: item.date
        })).filter(s => s.price > 0 || s.volume > 0)
    } catch (e) {
        console.error("Error getting all stocks", e)
        return []
    }
}

// Fetch single stock details
export async function getStock(code: string): Promise<StockData | null> {
    try {
        const stock = await fetchJson<any>(`stocks/${code}.json`)
        if (!stock) return null

        // Process history to standard format
        const history: DailyPrice[] = Array.isArray(stock.history) ? stock.history : []

        return {
            company_code: stock.company_code,
            company_name: transliterate(stock.company_name),
            company_name_original: stock.company_name,
            history: history,
            first_trade_date: history.length > 0 ? history[history.length - 1].date : '',
            issuer_data: stock.issuer_data // Pass through optional issuer data
        }
    } catch (e) {
        console.error(`Error getting stock ${code}`, e)
        return null
    }
}

export async function getTopGainers(limit: number = 5): Promise<StockSummary[]> {
    const all = await getAllStocks()
    return all.sort((a, b) => b.changePercent - a.changePercent).slice(0, limit)
}

export async function getTopLosers(limit: number = 5): Promise<StockSummary[]> {
    const all = await getAllStocks()
    return all.sort((a, b) => a.changePercent - b.changePercent).slice(0, limit)
}

export async function getMostActive(limit: number = 5): Promise<StockSummary[]> {
    const all = await getAllStocks()
    return all.sort((a, b) => b.turnover - a.turnover).slice(0, limit)
}

// Chart Data Helper
export function getChartData(history: DailyPrice[], months: number = 12) {
    if (!history || history.length === 0) return []

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months)

    // Dedup by date string (handling potentially different formats like 2025-9-1 and 2025-09-01)
    const uniqueMap = new Map<string, DailyPrice>()
    history.forEach(item => {
        // Normalize date to YYYY-MM-DD
        const d = new Date(item.date)
        const key = d.toISOString().split('T')[0]
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item)
        }
    })

    return Array.from(uniqueMap.values())
        .map(d => ({
            time: new Date(d.date).toISOString().split('T')[0],
            value: d.last_transaction_price,
            volume: d.quantity
        }))
        .filter(d => new Date(d.time) >= cutoff)
        .sort((a, b) => a.time.localeCompare(b.time))
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
    // Mock data for indices as we don't have a direct source yet
    return [
        {
            name: 'MBI10',
            value: 6420.50,
            change: -28.90,
            changePercent: -0.45,
            chartData: [6450, 6440, 6435, 6420, 6425, 6415, 6420.50]
        },
        {
            name: 'OMB',
            value: 128.30,
            change: 0.12,
            changePercent: 0.09,
            chartData: [128.1, 128.15, 128.2, 128.25, 128.3, 128.28, 128.30]
        },
    ]
}

export async function getLatestNews(limit: number = 4): Promise<NewsItem[]> {
    // Mock news data
    return [
        {
            id: '1',
            title: 'Macedonian Stock Exchange turnover rises 15% in Q1',
            source: 'SEENews',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=300&h=200'
        },
        {
            id: '2',
            title: 'Alkaloid AD Skopje reports record profits for 2024',
            source: 'Macedonian News Agency',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=300&h=200'
        },
        {
            id: '3',
            title: 'Komercijalna Banka announces new dividend payout',
            source: 'Finance Mk',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=300&h=200'
        },
        {
            id: '4',
            title: 'Construction sector sees growth despite global headwinds',
            source: 'Economy Press',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300&h=200'
        }
    ].slice(0, limit)
}
