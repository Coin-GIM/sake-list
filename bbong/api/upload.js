const { google } = require('googleapis');
const { Readable } = require('stream');

const ADMIN_PIN      = process.env.ADMIN_PIN;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || null;

async function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth: await auth.getClient() });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const pin = req.headers['x-admin-pin'];
  if (!pin || pin !== ADMIN_PIN) {
    return res.status(403).json({ error: 'PIN이 틀렸습니다' });
  }

  try {
    const { image, name, mimeType } = req.body;
    if (!image) return res.status(400).json({ error: '이미지 없음' });

    const drive = await getDriveClient();
    const buffer = Buffer.from(image, 'base64');

    const fileMeta = { name: name || ('avatar-' + Date.now() + '.jpg'), mimeType: mimeType || 'image/jpeg' };
    if (DRIVE_FOLDER_ID) fileMeta.parents = [DRIVE_FOLDER_ID];

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const uploaded = await drive.files.create({
      requestBody: fileMeta,
      media: { mimeType: fileMeta.mimeType, body: stream },
      fields: 'id',
    });

    const fileId = uploaded.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return res.status(200).json({ ok: true, url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
