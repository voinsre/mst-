import { StockData, StockSummary, DailyPrice } from './types'
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
            change: 0, // Market summary doesn't explicitly have absolute change, only pct?
            // Actually, based on JSON viewed: "change_pct": 0.21
            // We can calculate absolute change if needed, or if JSON has it.
            // JSON sample: price: 25690, change_pct: 0.21. 
            // Absolute change = price - (price / (1 + change_pct/100)). 
            // Or just use 0 if not needed for summary list, but let's try to be precise.
            // Using 0 for now unless we calculate it.
            changePercent: item.change_pct || 0,
            volume: item.volume || 0,
            turnover: item.turnover || 0,
            date: item.date
        })).filter(s => s.price > 0 || s.volume > 0) // Filter out inactive if desired, or keep all
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
