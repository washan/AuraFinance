async function test() {
  try {
    const symbol = 'VUAA.L';
    const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&quotesCount=0&newsCount=3`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.news, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
