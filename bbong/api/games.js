const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const ADMIN_PIN      = process.env.ADMIN_PIN;
const DATA_RANGE     = '데이터!A1';

async function getSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth: await auth.getClient() });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pin');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sheets = await getSheetsClient();

    // ── GET: 게임 목록 조회 (공개) ─────────────────────────
    if (req.method === 'GET') {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: DATA_RANGE,
      });
      const raw = resp.data.values?.[0]?.[0] || '[]';
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(raw);
    }

    // ── POST: 게임 저장 (관리자 PIN 필요) ─────────────────
    if (req.method === 'POST') {
      const pin = req.headers['x-admin-pin'];
      if (!pin || pin !== ADMIN_PIN) {
        return res.status(403).json({ error: 'PIN이 틀렸습니다' });
      }

      // body가 null/비어있으면 PIN 검증만 하고 종료
      const body = req.body;
      const isEmpty = body === null || body === undefined || body === ''
        || (typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0);
      if (isEmpty) {
        return res.status(200).json({ ok: true, verified: true });
      }

      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: DATA_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [[payload]] },
      });
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
