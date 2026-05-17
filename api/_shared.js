const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function scrapeSakelover(cateNo, type) {
  const url = `https://sakelover.jp/product/list.html?cate_no=${cateNo}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];
  $('li.df-prl__item').each((_, el) => {
    const nameEl = $(el).find('a.df-prl__name');
    const name = nameEl.text().trim();
    const href = nameEl.attr('href') || '';
    let price = '', orig = '';
    $(el).find('ul.df-prl__desc li').each((_, li) => {
      const cls = $(li).attr('class') || '';
      const text = $(li).text();
      const m = text.match(/\d{1,3}(?:,\d{3})+/);
      const val = m ? m[0] : '';
      if (!val) return;
      if (/selling_price/.test(cls) || /판매가/.test(text)) { if (!price) price = val; }
      else if (/consumer_price/.test(cls) || /소비자가/.test(text)) { if (!orig) orig = val; }
    });
    if (!name) return;
    const pn = parseInt(price.replace(/,/g, ''));
    const on = parseInt(orig.replace(/,/g, ''));
    const discount = (price && orig && !isNaN(pn) && !isNaN(on) && on > 0) ? Math.round((1 - pn / on) * 100) : null;
    items.push({ site: '사케러버', type, name, price: price ? price + '원' : '-', orig: orig ? orig + '원' : '-', discount: discount ? discount + '%' : '-', link: 'https://sakelover.jp' + href });
  });
  return items;
}

async function scrapeKihya() {
  const url = 'https://m.kihya.com/goods/goods_list.php?cateCd=006';
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];
  const seen = new Set();
  $('li.goods_prd_item_s, li.goods_prd_item11').each((_, el) => {
    const name = $(el).find('li.prd_name').first().text().trim();
    const href = $(el).find('div.goods_list_info a').first().attr('href') || '';
    const goodsNo = (href.match(/goodsNo=(\d+)/) || [])[1] || '';
    if (!name || (goodsNo && seen.has(goodsNo))) return;
    if (goodsNo) seen.add(goodsNo);
    let price = '', orig = '';
    $(el).find('ul.goods_info_list li.price').each((_, li) => {
      const text = $(li).text();
      const style = $(li).attr('style') || '';
      const m = text.match(/\d{1,3}(?:,\d{3})+/);
      const val = m ? m[0] : '';
      if (!val) return;
      if (/line-through/.test(style) || /정가|소비자가/.test(text)) { if (!orig) orig = val; }
      else { if (!price) price = val; }
    });
    if (!price && !orig) return;
    if (!price && orig) price = orig;
    const pn = parseInt(price.replace(/,/g, ''));
    const on = parseInt((orig || '').replace(/,/g, ''));
    const discount = (orig && !isNaN(pn) && !isNaN(on) && on > 0 && pn < on) ? Math.round((1 - pn / on) * 100) : null;
    const cleanHref = href.replace(/&mtn=[^&]*/g, '');
    const link = cleanHref.startsWith('http') ? cleanHref : 'https://m.kihya.com/goods/' + cleanHref.replace(/^(\.\.\/)*goods\//, '');
    items.push({ site: '키햐', type: '할인', name, price: price + '원', orig: orig ? orig + '원' : '-', discount: discount ? discount + '%' : '-', link });
  });
  return items;
}

async function scrapeSake09(query) {
  const url = `https://sake09.com/shop/products/list.php?mode=search&name=${encodeURIComponent(query)}&search_flag=1`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];
  $('div.list_area.clearfix').each((_, el) => {
    const nameEl = $(el).find('h3 a').first();
    const name = nameEl.text().trim();
    const href = nameEl.attr('href') || '';
    if (!name) return;
    const priceText = $(el).find('span[id^="price02_default_"]').first().text().trim();
    const m = priceText.match(/[\d,]+/);
    if (!m) return;
    const link = href.startsWith('http') ? href : 'https://sake09.com' + href;
    items.push({ site: '사케09', type: '검색', name, price: m[0] + '円', orig: '-', discount: '-', currency: 'JPY', link });
  });
  return items;
}

module.exports = { scrapeSakelover, scrapeKihya, scrapeSake09 };
