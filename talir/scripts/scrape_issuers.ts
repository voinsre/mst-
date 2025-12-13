
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const ISSUERS_URL = 'https://www.mse.mk/en/issuers/shares-listing/super-listing'; // Starting point, but we need all listings
const BASE_URL = 'https://www.mse.mk';
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'issuers.json');

interface IssuerDetails {
    code: string;
    name: string;
    sector: string;
    address: string;
    city: string;
    phone: string;
    website: string;
    reportLinks: { title: string; url: string; date: string }[];
}

async function fetchHtml(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.text();
    } catch (e) {
        console.error(`Error fetching ${url}:`, e);
        return null;
    }
}

async function scrapeListingPage(url: string, issuers: Map<string, IssuerDetails>) {
    console.log(`Scraping listing page: ${url}`);
    const html = await fetchHtml(url);
    if (!html) return;

    const $ = cheerio.load(html);
    const rows = $('table tbody tr');

    for (const row of rows) {
        const cells = $(row).find('td');
        if (cells.length < 7) continue;

        // Logo is in 0, Name in 1
        const nameLink = $(cells[1]).find('a');
        const name = nameLink.text().trim();
        const relativeLink = nameLink.attr('href'); // /en/symbol/ALK
        const code = relativeLink?.split('/').pop() || '';

        if (!code) continue;

        const business = $(cells[2]).text().trim();
        const address = $(cells[3]).text().trim();
        const city = $(cells[4]).text().trim();
        const phone = $(cells[5]).text().trim();
        const siteLink = $(cells[6]).find('a').attr('href') || '';

        issuers.set(code, {
            code,
            name,
            sector: business,
            address,
            city,
            phone,
            website: siteLink,
            reportLinks: []
        });
    }
}

async function scrapeIssuerDetails(code: string, details: IssuerDetails) {
    const url = `${BASE_URL}/en/symbol/${code}`;
    console.log(`Scraping details for ${code} (${url})...`);
    const html = await fetchHtml(url);
    if (!html) return;

    const $ = cheerio.load(html);

    // Scrape financial reports from SEI-Net News section if available
    // Note: The structure might be dynamic. We look for the "Financial reports" tab content.
    // Based on research, it seems we might need to look for links to seinet.com.mk

    const reportLinks: { title: string; url: string; date: string }[] = [];

    // Select all links that go to seinet or resemble a report
    $('div#seiNetIssuerFinancialNews a').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        // Assuming date might be near the link or in the text
        // For now, just capturing the link and text
        if (href && (href.includes('seinet.com.mk') || href.includes('ViewNews'))) {
            reportLinks.push({
                title: text,
                url: href.startsWith('http') ? href : `https://seinet.com.mk${href}`, // Adjust if needed
                date: '' // Date extraction might be complex without specific selectors
            });
        }
    });

    details.reportLinks = reportLinks;
}

async function main() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const issuers = new Map<string, IssuerDetails>();

    // 1. Scrape listing pages
    // MSE has Super Listing, Exchange Listing, Mandatory Listing
    await scrapeListingPage(`${BASE_URL}/en/issuers/shares-listing/super-listing`, issuers);
    await scrapeListingPage(`${BASE_URL}/en/issuers/shares-listing/exchange-listing`, issuers);
    await scrapeListingPage(`${BASE_URL}/en/issuers/shares-listing/mandatory-listing`, issuers);

    console.log(`Found ${issuers.size} issuers. Starting detail scrape...`);

    // 2. Scrape details for each issuer (concurrency constrained)
    const codes = Array.from(issuers.keys());
    const CHUNK_SIZE = 5;

    for (let i = 0; i < codes.length; i += CHUNK_SIZE) {
        const chunk = codes.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(code => scrapeIssuerDetails(code, issuers.get(code)!)));
        // polite delay
        await new Promise(r => setTimeout(r, 500));
    }

    // 3. Save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(issuers.values()), null, 2));
    console.log(`Saved issuers data to ${OUTPUT_FILE}`);
}

main().catch(console.error);
