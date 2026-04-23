async function test() {
  try {
    const symbols = ['^GSPC', 'QQQ', 'market'];
    for (const symbol of symbols) {
      const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await res.json();
      console.log(`\n--- News for ${symbol} ---`);
      if (data.news && data.news.length > 0) {
         data.news.forEach(n => console.log(`- ${n.title}`));
      } else {
         console.log('No news');
      }
    }
  } catch (error) {
    console.error(error);
  }
}

test();
