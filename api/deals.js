const { scrapeSakelover, scrapeKihya } = require('./_shared');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const results = await Promise.allSettled([
    scrapeSakelover(103, '타임세일'),
    scrapeSakelover(101, '공동구매'),
    scrapeKihya(),
  ]);
  const items = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  const errors = results.map((r, i) =>
    r.status === 'rejected' ? ['사케러버타임세일', '사케러버공구', '키햐'][i] + ': ' + r.reason.message : null
  ).filter(Boolean);
  res.json({ items, errors, updatedAt: new Date().toLocaleString('ko-KR') });
};
