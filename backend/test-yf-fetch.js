async function test() {
   try {
     const res = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/VUAA.L?interval=1mo&range=1y', { headers: { 'User-Agent': 'Mozilla/5.0' } });
     const data = await res.json();
     console.log("Timestamps:");
     console.log(JSON.stringify(data.chart.result[0].timestamp.slice(-6)));
     console.log("Closes:");
     console.log(JSON.stringify(data.chart.result[0].indicators.quote[0].close.slice(-6)));
   } catch (e) {
     console.log("ERROR", e);
   }
}
test();
