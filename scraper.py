
import asyncio
import aiohttp
import json
import os
import argparse
import datetime
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

# List of all symbols (retrieved during research)
# List of all symbols (retrieved during research)
SYMBOLS = [
    "11OK", "ADIN", "AITO", "ALK", "ALKB", "AMBR", "AMEH", "APTK", "ATPP", "AUMK", "BANA", "BGOR", "BIKF", "BIM", "BLTU", "CBNG", "CEVI", "CKB", "CKBKO2", "DEBA", "DIMI", "EDST", "ELMA", "ENER", "EUHA", "EVRO", "FAKM", "FERS", "FKBR", "FKPO", "FKTK", "FUBT", "GALE", "GDKM", "GIMS", "GRDN", "GRNT", "GRZD", "GTC", "GTRG", "GUMA", "IJUG", "INB", "INBR", "INDI", "INHO", "INOV", "INPR", "INTP", "JAKO", "JULI", "JUSK", "KARO", "KJUBI", "KKFI", "KLST", "KMB", "KMPR", "KOMU", "KONF", "KONZ", "KORZ", "KPSS", "KVAS", "LOTO", "LOZP", "M010428", "M010428D", "M010931D", "M011133D", "M011231D", "M011237", "M020126", "M020127", "M021132D", "M030337", "M030338", "M031131D", "M031230D", "M031235D", "M040336", "M040532D", "M040630D", "M040837", "M040837D", "M040838", "M050836", "M050939", "M051032D", "M051234D", "M060240", "M060328D", "M060340", "M060432D", "M060629", "M060639", "M060732D", "M060830D", "M060850D", "M070329", "M070339", "M070426D", "M070530D", "M070633", "M070932D", "M070938", "M070938D", "M071134", "M071232D", "M080229", "M080239", "M080333D", "M080632D", "M080731D", "M080834D", "M080839", "M081030D", "M090238", "M090332D", "M090631D", "M090730D", "M090833D", "M090937", "M090937D", "M091027", "M091040", "M100128", "M100140", "M100428", "M100440", "M100526", "M100539", "M100740", "M100832D", "M101039", "M110128", "M110133D", "M110139", "M110226", "M110226D", "M110231D", "M110538", "M110739", "M120132D", "M120138", "M120230D", "M120330D", "M120439", "M120439D", "M120537", "M121227D", "M121229", "M130137", "M130235", "M130738", "M131037", "M131140", "M140126D", "M140131D", "M140136", "M140431D", "M140437D", "M140526", "M141031D", "M141036", "M141126", "M141139", "M141226", "M141238", "M150233D", "M150436", "M150436D", "M150638", "M150638D", "M151030", "M151030D", "M160232D", "M160430D", "M160534", "M160637", "M160637D", "M160936", "M161138", "M170228", "M170230", "M170331D", "M170636", "M170636D", "M170832D", "M170930D", "M171137", "M171225D", "M180449D", "M180635", "M180749D", "M180826", "M180826D", "M180831D", "M180837D", "M180927", "M180940", "M181048D", "M181136D", "M190627", "M190628", "M190640", "M190640D", "M190748D", "M190927", "M190934", "M190939", "M191032D", "M191130D", "M200732D", "M200738", "M200830D", "M200933", "M200933D", "M210633D", "M210827", "M210840", "M210932D", "M210938", "M220131D", "M220528", "M220540", "M220632D", "M220931D", "M221133D", "M221231D", "M230332D", "M230631D", "M230730D", "M231132D", "M240326", "M240428", "M240930D", "M241225D", "M250133", "M250133D", "M250630D", "M251027", "M260132D", "M260230D", "M260330D", "M260448D", "M260538D", "M270830D", "M280131D", "M280234", "M280731D", "M281127", "M281238D", "M290632D", "M290638D", "M290931D", "M291030D", "M291035", "M291237", "M291237D", "M300150D", "M300332D", "M300338", "M300338D", "M300450D", "M300637", "M300730D", "M301132D", "M310149D", "M310331D", "M311049D", "MAGP", "MAKP", "MAKS", "MB", "MERM", "MKSD", "MLKR", "MODA", "MOKL", "MPOL", "MPT", "MTUR", "MZHE", "MZOV", "MZPU", "NEME", "NOSK", " OBIN", "OBMT", "OHTU", "OILK", "OKTA", "OMOS", "OPFO", "OPTK", "ORAN", "OSPO", "OTEK", "PALT", "PKB", "POPK", "PPIV", "PROD", "PROT", "RADE", "REPL", "RIMI", "RINS", "RMDEN15", "RMDEN16", "RMDEN17", "RMDEN18", "RMDEN19", "RMDEN20", "RMDEN21", "RMDEN22", "RMDEN23", "RZEK", "RZIT", "RZLE", "RZLV", "RZTK", "RZUG", "RZUS", "S2909331", "S2909332", "S2909333", "SBT", "SDOM", "SIGA", "SIL", "SKP", "SLAV", "SOLN", "SPAZ", "SPAZP", "SPOL", "SSPR", "STB", "STBP", "STEL", "STIL", "STOK", "TAJM", "TASK", "TEAL", "TEHN", "TEL", "TETE", "TIGA", "TIKV", "TKPR", "TKVS", "TNB", "TRDB", "TROZ", "TRPS", "TRUB", "TSMP", "TTK", "TTKO2", "TTKO3", "TURT", "UNI", "UNIPO2", "UNIPO3", "UNIPO4", "USJE", "VARG", "VENC", "VITA", "VROS", "VSC", "VTKS", "ZAS", "ZELE", "ZILU", "ZILUP", "ZKAR", "ZLRB", "ZPKO", "ZPOG", "ZSIL", "ZUS"
]

BASE_URL = "https://www.mse.mk/mk/stats/symbolhistory/{}"
DATA_DIR = "./data"

def parse_number(text):
    if not text:
        return None
    # Replace . with nothing (thousands) and , with . (decimal)
    cleaned = text.replace('.', '').replace(',', '.')
    try:
        return float(cleaned)
    except ValueError:
        return None

def parse_date(text):
    # Depending on locale, might optionally be D.M.YYYY
    # The site seems to output DD.MM.YYYY
    try:
        day, month, year = text.split('.')
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except ValueError:
        return text

async def fetch_issuer_details(session, symbol):
    # 1. Search for the symbol to get the issuer page URL
    search_url = f"https://www.mse.mk/mk/search/{symbol}"
    try:
        async with session.get(search_url) as response:
            if response.status != 200:
                print(f"Error fetching search page for {symbol}")
                return None
            search_html = await response.text()
            soup = BeautifulSoup(search_html, 'html.parser')
            
            # Find the link to the symbol/issuer
            target_link = None
            for link in soup.find_all('a', href=True):
                if f"/symbol/{symbol}" in link['href'] or f"/issuer/{symbol}" in link['href']:
                     target_link = link['href']
                     break
            
            if not target_link:
                # Fallback: check text match
                for link in soup.find_all('a', href=True):
                    if symbol == link.text.strip():
                        target_link = link['href']
                        break
            
            if not target_link:
                print(f"Could not find issuer link for {symbol}")
                return None

            if not target_link.startswith("http"):
                target_link = "https://www.mse.mk" + target_link
            
            # 2. Fetch the issuer page
            async with session.get(target_link) as response2:
                if response2.status != 200:
                    return None
                html = await response2.text()
                soup2 = BeautifulSoup(html, 'html.parser')
                
                details = {}
                
                # Name: Try div.col-md-8.title (New Selector) then <title> tag
                title_div = soup2.select_one('div.col-md-8.title')
                if title_div:
                    details['company_name'] = title_div.text.strip()
                elif soup2.title:
                    # Fallback: Extract from <title> e.g. "Податоци за издавачот - Гранит АД Скопје"
                    details['company_name'] = soup2.title.text.split('-')[-1].strip()
                
                # Parse details from div.row elements (New Selector)
                for row in soup2.select('div.row'):
                    cols = row.select('div')
                    if len(cols) >= 2:
                        key = cols[0].text.strip().lower()
                        val = cols[1].text.strip()
                        
                        if "адреса" in key:
                            details['address'] = val
                        elif "град" in key:
                            details['city'] = val
                        elif "e-mail" in key:
                            details['email'] = val
                        elif "веб страница" in key:
                             # Logic for link inside
                             a_tag = cols[1].find('a')
                             if a_tag:
                                 details['website'] = a_tag['href']
                             else:
                                 details['website'] = val
                        elif "телефон" in key:
                            details['phone'] = val
                        elif "факс" in key:
                            details['fax'] = val
                
                return details

    except Exception as e:
        print(f"Error fetching details for {symbol}: {e}")
        return None

def parse_html(html, symbol, year):
    soup = BeautifulSoup(html, 'html.parser')
    rows = soup.select('#resultsTable tbody tr')
    data = []
    
    # Extract company name from title
    company_name = None
    title_div = soup.select_one('#main-content > div.title > h1')
    
    # Removed verbose debug log writing
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 9:
            continue
            
        record = {
            "date": parse_date(cells[0].text.strip()),
            "last_transaction_price": parse_number(cells[1].text.strip()),
            "max_price": parse_number(cells[2].text.strip()),
            "min_price": parse_number(cells[3].text.strip()),
            "average_price": parse_number(cells[4].text.strip()),
            "percent_change": parse_number(cells[5].text.strip()),
            "quantity": parse_number(cells[6].text.strip()),
            "turnover_best_mkd": parse_number(cells[7].text.strip()),
            "total_turnover_mkd": parse_number(cells[8].text.strip()),
        }
        data.append(record)
    return data, company_name

async def fetch_data(session, symbol, year):
    # Construct date range
    from_date = f"1.1.{year}"
    to_date = f"31.12.{year}"
    
    payload = {
        'FromDate': from_date,
        'ToDate': to_date,
        'Code': symbol
    }
    
    try:
        async with session.post(BASE_URL.format(symbol), data=payload) as response:
            if response.status == 200:
                html = await response.text()
                return parse_html(html, symbol, year)
            else:
                print(f"Error fetching {symbol} for {year}: Status {response.status}")
                return [], None
    except Exception as e:
        print(f"Exception fetching {symbol} for {year}: {e}")
        return [], None

async def process_symbol(symbol, years, session, update_mode=False):
    file_path = os.path.join(DATA_DIR, f"{symbol}.json")
    existing_data = {"company_code": symbol, "company_name": "", "history": []}
    
    last_date = None
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
                if 'company_code' in content:
                    existing_data = content
                
                if existing_data['history']:
                    existing_data['history'].sort(key=lambda x: x['date'], reverse=True)
                    last_date_str = existing_data['history'][0]['date']
                    # Handle potentially legacy non-padded dates during transition
                    try:
                        last_date = datetime.datetime.strptime(last_date_str, "%Y-%m-%d").date()
                    except ValueError:
                         # Attempt to parse non-padded format if strptime fails
                         # Format was YYYY-M-D
                         parts = last_date_str.split('-')
                         if len(parts) == 3:
                             last_date = datetime.date(int(parts[0]), int(parts[1]), int(parts[2]))
        except:
            pass 

    if update_mode and last_date:
        current_year = datetime.date.today().year
        start_year = last_date.year
        target_years = list(range(start_year, current_year + 1))
    else:
        target_years = years

    all_history = existing_data['history']
    found_name = existing_data.get('company_name', "")
    
    # Try to fetch detailed info if missing or in update mode
    if not existing_data.get('issuer_data'):
         print(f"Fetching issuer details for {symbol}...")
         details = await fetch_issuer_details(session, symbol)
         if details:
             existing_data['issuer_data'] = details
             if 'company_name' in details:
                 found_name = details['company_name']

    # Use a set for faster duplicate checking
    existing_dates = set(item['date'] for item in all_history)

    for year in target_years:
        try:
            records, name = await fetch_data(session, symbol, year)
            if name and not found_name:
                found_name = name
                
            for rec in records:
                # records from fetch_data should now have padded dates
                # Check formatted date
                if rec['date'] not in existing_dates:
                    existing_dates.add(rec['date'])
                    all_history.append(rec)
        except Exception as e:
            print(f"Error processing {symbol} for year {year}: {e}")

    # Sort history
    # Properly sort by converting to date object, then reverse
    def date_key(x):
        try:
           return datetime.datetime.strptime(x['date'], "%Y-%m-%d")
        except:
           # fallback for legacy weirdness, though parse_date handles padding now
           parts = x['date'].split('-')
           return datetime.date(int(parts[0]), int(parts[1]), int(parts[2]))

    all_history.sort(key=date_key, reverse=True)
    existing_data['history'] = all_history
    existing_data['company_name'] = found_name
    
    if all_history:
        # last element is the oldest because we sorted reverse=True
        existing_data['first_trade_date'] = all_history[-1]['date']
    
    # Save
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, indent=2, ensure_ascii=False)
        
    print(f"Processed {symbol}: {len(all_history)} records. Name: {found_name}")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--backfill', action='store_true', help='Run full backfill from 2002')
    parser.add_argument('--update', action='store_true', help='Run incremental update')
    parser.add_argument('--test', action='store_true', help='Run test for one symbol')
    args = parser.parse_args()

    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    current_year = datetime.date.today().year
    all_years = list(range(2002, current_year + 1))
    
    if args.test:
        target_symbols = ["KORZ"]
        target_years = [current_year]
    else:
        target_symbols = SYMBOLS
        target_years = all_years

    # Limit total concurrent connections to avoid limits/errors
    connector = aiohttp.TCPConnector(limit=10)
    
    # Semaphore to limit concurrent SYMBOL processing
    sem = asyncio.Semaphore(10) 

    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        
        async def bounded_process(s, sym, yrs, mode):
            async with sem:
                await process_symbol(sym, yrs, s, mode)

        for symbol in target_symbols:
            if args.test:
                 tasks.append(bounded_process(session, symbol, target_years, False))
            elif args.backfill:
                 tasks.append(bounded_process(session, symbol, all_years, False))
            elif args.update:
                 tasks.append(bounded_process(session, symbol, all_years, True))
            else:
                print("Please specify --backfill or --update")
                return

        # gather is fine if the semaphore correctly bounds the heavy lifting
        if tasks:
            await asyncio.gather(*tasks)

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
