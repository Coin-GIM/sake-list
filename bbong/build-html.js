const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');
const tmpl  = fs.readFileSync('template.html', 'utf8');

try { new Function(appJs); }
catch (e) { console.error('JS 구문 에러:', e.message); process.exit(1); }

const html = tmpl.replace('__SCRIPT__', appJs);
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html OK:', html.length, 'chars');
