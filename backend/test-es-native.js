async function test() {
  try {
    const mod = await new Function("return import('yahoo-finance2')")();
    const yahooFinance = mod.default;
    const quote = await yahooFinance.quote('VUAA.L');
    console.log(quote.regularMarketPrice);
  } catch (err) {
    console.error(err);
  }
}
test();
