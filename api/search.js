const { scrapeSakelover, scrapeKihya, scrapeSake09 } = require('./_shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ items: [] });

  const results = await Promise.allSettled([
    scrapeSakelover(103, '타임세일'),
    scrapeSakelover(101, '공동구매'),
    scrapeKihya(),
    scrapeSake09(q),
  ]);
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  const lq = q.toLowerCase();
  const krwItems = all.filter(i => i.site !== '사케09' && i.name.toLowerCase().includes(lq));
  const jpyItems = all.filter(i => i.site === '사케09');
  const items = [...krwItems, ...jpyItems];
  const links = [
    { site: '사케러버', url: `https://sakelover.jp/product/search.html?search_query=${encodeURIComponent(q)}` },
    { site: '키햐',    url: `https://m.kihya.com/search/search.php?keyword=${encodeURIComponent(q)}` },
    { site: '사케09',  url: `https://sake09.com/shop/search.php?stx=${encodeURIComponent(q)}` },
    { site: '데일리샷',url: `https://dailyshot.co/?search=${encodeURIComponent(q)}` },
  ];
  res.json({ items, links, query: q });
};
