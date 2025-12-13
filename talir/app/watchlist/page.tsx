
import { getAllStocks } from "@/lib/data"
import { WatchlistClient } from "./client"

export default async function WatchlistPage() {
    const stockData = await getAllStocks()
    return <WatchlistClient stockData={stockData} />
}
