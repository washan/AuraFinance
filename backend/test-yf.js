const yf = require('yahoo-finance2').default;

async function test() {
  try {
    yf.suppressNotices(['yahooFinance.quote(...)']);
    const quote = await yf.quote('VUAA.L');
    console.log(JSON.stringify(quote));
  } catch (err) {
    console.error(err);
  }
}
test();
