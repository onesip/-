import fs from 'node:fs';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/mobile-nav-patch.mjs <index.html>');
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf8');
if (html.includes('id="mobile-nav-toggle"')) {
  console.log('Mobile navigation already patched.');
  process.exit(0);
}

const navPosition = html.indexOf('<nav id="nav"');
if (navPosition < 0) throw new Error('Navigation element was not found.');
const brandClose = html.lastIndexOf('</div>', navPosition);
if (brandClose < 0) throw new Error('Brand container was not found.');

const toggleMarkup = `
        <button id="mobile-nav-toggle" class="mobile-nav-toggle" type="button" aria-expanded="false" aria-controls="nav">
          <span class="menu-icon" aria-hidden="true"></span>
          <span class="menu-label">菜单</span>
        </button>
      `;
html = html.slice(0, brandClose) + toggleMarkup + html.slice(brandClose);

const mobileCss = `
/* BankHome mobile collapsible navigation */
.brand > div:nth-child(2) { min-width: 0; flex: 1; }
.mobile-nav-toggle {
  display: none;
  flex: 0 0 auto;
  min-width: 78px;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #efd7e7;
  border-radius: 14px;
  background: linear-gradient(135deg, #fff3f9, #f3efff);
  color: #735c91;
  font-weight: 800;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-shadow: 0 7px 18px rgba(164, 118, 170, .10);
}
.mobile-nav-toggle .menu-icon {
  width: 17px;
  height: 12px;
  position: relative;
  display: inline-block;
  border-top: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
}
.mobile-nav-toggle .menu-icon::after {
  content: "";
  position: absolute;
  left: 0; right: 0; top: 3px;
  border-top: 2px solid currentColor;
}
.sidebar.nav-open .mobile-nav-toggle .menu-icon { border: 0; height: 17px; }
.sidebar.nav-open .mobile-nav-toggle .menu-icon::before,
.sidebar.nav-open .mobile-nav-toggle .menu-icon::after {
  content: "";
  position: absolute;
  left: 8px; top: 0;
  height: 17px;
  border-left: 2px solid currentColor;
}
.sidebar.nav-open .mobile-nav-toggle .menu-icon::before { transform: rotate(45deg); }
.sidebar.nav-open .mobile-nav-toggle .menu-icon::after { transform: rotate(-45deg); }

@media (max-width: 920px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar {
    position: sticky;
    top: 10px;
    inset: auto;
    width: auto;
    min-height: auto;
    margin: 10px 10px 0;
    padding: 12px 14px;
    border-radius: 22px;
    background: rgba(255,255,255,.90);
    box-shadow: 0 12px 34px rgba(164, 118, 170, .14);
  }
  .brand { padding: 0; gap: 11px; }
  .brand-mark { width: 42px; height: 42px; border-radius: 14px; font-size: 20px; }
  .mobile-nav-toggle { display: inline-flex; }
  .nav-list {
    display: none !important;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0dfea;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .sidebar.nav-open .nav-list { display: grid !important; animation: bankhomeNavReveal .18s ease-out; }
  .privacy-note { display: none; }
  .main-area { grid-column: 1; padding: 12px 14px 44px; margin-left: 0; }
  @keyframes bankhomeNavReveal {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
@media (max-width: 820px) {
  .nav-item {
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-height: 62px;
    font-size: 11px;
    padding: 9px 6px;
  }
  .nav-item span { font-size: 18px; width: auto; }
}
@media (max-width: 560px) {
  .sidebar { margin: 8px 8px 0; padding: 11px 12px; border-radius: 20px; }
  .brand strong { font-size: 16px; }
  .brand span { font-size: 9px; }
  .mobile-nav-toggle { min-width: 72px; height: 40px; padding: 0 11px; }
  .nav-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`;

const styleEnd = html.indexOf('</style>');
if (styleEnd < 0) throw new Error('Closing style tag was not found.');
html = html.slice(0, styleEnd) + mobileCss + '\n' + html.slice(styleEnd);

const mobileScript = `
<script>
(() => {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.getElementById('mobile-nav-toggle');
  const nav = document.getElementById('nav');
  if (!sidebar || !toggle || !nav) return;
  const label = toggle.querySelector('.menu-label');
  const isMobile = () => window.matchMedia('(max-width: 920px)').matches;
  const closeMenu = () => {
    sidebar.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = '菜单';
  };
  toggle.addEventListener('click', event => {
    event.stopPropagation();
    const open = sidebar.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '收起' : '菜单';
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('[data-view]') && isMobile()) closeMenu();
  });
  document.addEventListener('click', event => {
    if (isMobile() && sidebar.classList.contains('nav-open') && !sidebar.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => { if (!isMobile()) closeMenu(); });
})();
</script>`;

html = html.replace('</body>', mobileScript + '\n</body>');
html = html.replace('<meta name="theme-color" content="#ffedf6">', '<meta name="theme-color" content="#ffedf6">\n  <meta name="bankhome-build" content="2026-07-27-mobile-collapse-v2">');
fs.writeFileSync(target, html);
console.log(`Patched collapsible mobile navigation in ${target}`);
