
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const INDICES = [
    { code: 'MBI10', url: 'https://www.mse.mk/en/indicies/MBI10/values' },
    { code: 'OMB', url: 'https://www.mse.mk/en/indicies/OMB/values' }
];

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'indices');

async function scrapeIndex(indexCode: string, url: string, browser: any) {
    console.log(`Scraping ${indexCode} history from ${url}...`);
    const outputFile = path.join(DATA_DIR, `${indexCode}.json`);
    const allData: any[] = [];

    // Create new page
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Use a standard UA
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for initial load
        await new Promise(r => setTimeout(r, 2000));

        // Get available years from dropdown
        const availableYears = await page.evaluate(() => {
            const select = document.querySelector('select#cmbYear') as HTMLSelectElement;
            if (!select) return [];
            return Array.from(select.options).map(o => o.value).filter(v => /^\d{4}$/.test(v));
        });

        console.log(`Available years for ${indexCode}: ${availableYears.join(', ')}`);

        // Iterate through years
        for (const year of availableYears) {
            if (parseInt(year) < 1996) continue;
            console.log(`Fetching ${indexCode} for ${year}...`);

            try {
                // 1. Select the year
                await page.select('select#cmbYear', year);

                // 2. Wait for the table to actually contain the year we selected.
                // This confirms the data has updated.
                await page.waitForFunction(
                    (y: string) => {
                        const table = document.querySelector('div#HistoryTable table') || document.querySelector('div#resultsTableDivId table');
                        if (!table) return false;
                        // Check if the table text contains the year (e.g. "1.1.2024")
                        // Or check if a date cell ends with the year
                        return table.textContent?.includes(y);
                    },
                    { timeout: 10000 },
                    year
                );

                // Small extra buffer for rendering
                await new Promise(r => setTimeout(r, 500));

            } catch (e: any) {
                console.log(`  -> Wait warning for ${year}: ${e.message}`);
            }

            // 3. Scrape Table
            const records = await page.evaluate(() => {
                let rows = Array.from(document.querySelectorAll('div#HistoryTable table tbody tr'));
                if (rows.length === 0) {
                    rows = Array.from(document.querySelectorAll('div#resultsTableDivId table tbody tr'));
                }

                const results: any[] = [];

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 3) return;

                    const dateStr = cells[0].textContent?.trim() || '';
                    const valueStr = cells[1].textContent?.trim() || '';
                    const changeStr = cells[2].textContent?.trim() || '';

                    // Allow for . or / separators in date
                    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('.');
                    if (parts.length !== 3) return;

                    // Heuristic: yyyy is usually not first in d.m.y or m.d.y
                    // Standard MSE EN seems to be M/d/yyyy or d.M.yyyy
                    // If parsing fails, we might need a smarter parser. 
                    // Let's assume standard logic first.

                    let d, m, y;
                    if (parts[2].length === 4) { // d.m.yyyy or m.d.yyyy
                        // If first part > 12, it's day.
                        const p0 = parseInt(parts[0]);
                        const p1 = parseInt(parts[1]);
                        if (p0 > 12) { d = parts[0]; m = parts[1]; y = parts[2]; }
                        else {
                            // ambiguity. standard mse is d.m.yyyy usually.
                            d = parts[0]; m = parts[1]; y = parts[2];
                        }
                    } else if (parts[0].length === 4) { // yyyy.m.d
                        y = parts[0]; m = parts[1]; d = parts[2];
                    }

                    if (!y || !m || !d) return;

                    const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

                    const value = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
                    const change = parseFloat(changeStr.replace(/\./g, '').replace(',', '.'));

                    if (!isNaN(value)) {
                        results.push({ date: isoDate, value, change });
                    }
                });
                return results;
            });

            console.log(`  -> Found ${records.length} records.`);
            allData.push(...records);
        }

    } catch (e) {
        console.error(`Error scraping ${indexCode}:`, e);
    } finally {
        await page.close();
    }

    // Sort & Save
    const sorted = allData
        .filter(d => !isNaN(d.value))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Dedupe
    const unique = new Map();
    sorted.forEach(item => unique.set(item.date, item));
    const finalData = Array.from(unique.values());

    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));
    console.log(`Saved ${finalData.length} records to ${outputFile}`);
}

async function main() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        for (const index of INDICES) {
            await scrapeIndex(index.code, index.url, browser);
        }
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
