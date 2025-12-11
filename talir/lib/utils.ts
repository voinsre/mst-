import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: 'MKD' | 'EUR' = 'MKD'): string {
    return new Intl.NumberFormat('mk-MK', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price) + (currency === 'MKD' ? ' MKD' : ' €')
}

export function formatPriceChange(change: number): string {
    if (isNaN(change)) return '0.00%' // Handle potential NaN
    const safeChange = Number(change)
    return `${safeChange >= 0 ? '+' : ''}${safeChange.toFixed(2)}%`
}

export function formatVolume(volume: number): string {
    if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M'
    if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K'
    return volume.toString()
}

export function addRefToUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        urlObj.searchParams.set('ref', 'talir')
        return urlObj.toString()
    } catch {
        return url + (url.includes('?') ? '&' : '?') + 'ref=talir'
    }
}
