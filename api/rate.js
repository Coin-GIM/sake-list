let rateCache = { rate: null, date: null, ts: 0 };

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const now = Date.now();
  if (rateCache.rate && now - rateCache.ts < 3600000) {
    return res.json({ rate: rateCache.rate, date: rateCache.date, cached: true });
  }
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=JPY&to=KRW');
    const data = await r.json();
    rateCache = { rate: data.rates.KRW, date: data.date, ts: now };
    res.json({ rate: rateCache.rate, date: rateCache.date });
  } catch (e) {
    if (rateCache.rate) return res.json({ rate: rateCache.rate, date: rateCache.date, cached: true });
    res.status(500).json({ error: e.message });
  }
};
