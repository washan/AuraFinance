const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const quote = await yahooFinance.quote('VUAA.L');
    console.log(JSON.stringify(quote, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
