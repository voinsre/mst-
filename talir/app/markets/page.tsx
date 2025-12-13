
import { MarketsClient } from './client'
import { getAllStocks } from '@/lib/data'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Markets | Talir',
    description: 'Explore all stocks on the Macedonian Stock Exchange',
}

export default async function MarketsPage() {
    const stocks = await getAllStocks()

    return (
        <div className="min-h-screen bg-background pb-20">
            <main className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
                <div className="flex flex-col gap-8">
                    {/* Client Logic */}
                    <MarketsClient initialStocks={stocks} />
                </div>
            </main>
        </div>
    )
}
