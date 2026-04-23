const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const result = await yahooFinance.search('VUAA.L', { newsCount: 3 });
    console.log(JSON.stringify(result.news, null, 2));
    
    // Also try getting general finance news instead of specific if it fails
  } catch (error) {
    console.error(error);
  }
}

test();
