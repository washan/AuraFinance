async function test() {
  try {
    const { default: yahooFinance } = await import('yahoo-finance2');
    const quote = await yahooFinance.quote('VUAA.L');
    console.log(quote.regularMarketPrice);
  } catch (err) {
    console.error(err);
  }
}
test();
