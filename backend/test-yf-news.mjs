import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const result = await yahooFinance.search('VUAA.L', { newsCount: 3 });
    console.log(JSON.stringify(result.news, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
