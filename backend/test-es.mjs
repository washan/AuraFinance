import yahooFinance from 'yahoo-finance2';

async function main() {
  const res = await yahooFinance.quote('VUAA.L');
  console.log('--- KEYS ---');
  console.log(Object.keys(res).join(', '));
  console.log('--- VALUES ---');
  console.log(`regularMarketPrice: ${res.regularMarketPrice}`);
  console.log(`regularMarketPreviousClose: ${res.regularMarketPreviousClose}`);
  console.log(`price: ${res.price}`);
  console.log(`bid: ${res.bid}`);
  console.log(`ask: ${res.ask}`);
}
main().catch(console.error);
