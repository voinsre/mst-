
import { getAllStocks } from "@/lib/data"
import { PortfolioClient } from "./client"

export default async function PortfolioPage() {
    const stockData = await getAllStocks()
    return <PortfolioClient stockData={stockData} />
}
