import fs from 'node:fs';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/pwa-build-patch.mjs <index.html>');
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf8');

const headMarkup = `
  <link rel="icon" type="image/svg+xml" href="app-icon.svg?v=20260803a">
  <link rel="apple-touch-icon" href="app-icon.svg?v=20260803a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="BankHome账本">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="stylesheet" href="mobile-nav.css?v=20260803a">
`;

if (!html.includes('app-icon.svg?v=20260803a')) {
  html = html.replace('</head>', `${headMarkup}</head>`);
}

if (!html.includes('mobile-nav.js?v=20260803a')) {
  html = html.replace('</body>', '  <script src="mobile-nav.js?v=20260803a"></script>\n</body>');
}

html = html.replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#f3a2d8">');
html = html.replace(/<title>[^<]*<\/title>/, '<title>BankHome账本 · 多银行记账</title>');

fs.writeFileSync(target, html);
console.log(`Added BankHome PWA identity to ${target}`);
