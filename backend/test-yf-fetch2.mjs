import fs from 'fs';
async function test() {
   try {
     const symbol = 'VUAA.L';
     const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=1y`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
     const data = await res.json();
     
     const timestamps = data?.chart?.result?.[0]?.timestamp || [];
     const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
     
     const historicalQuotes = timestamps.map((ts, i) => ({
        date: new Date(ts * 1000),
        month: new Date(ts * 1000).getMonth() + 1,
        close: closes[i]
     })).filter(q => q.close !== null);
     
     fs.writeFileSync('test-out2.json', JSON.stringify(historicalQuotes, null, 2));
   } catch (e) {
     console.log("ERROR", e);
   }
}
test();
