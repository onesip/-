(() => {
  const sidebar = document.querySelector('.sidebar');
  const nav = document.getElementById('nav');
  if (!sidebar || !nav || document.getElementById('mobile-nav-toggle')) return;

  const button = document.createElement('button');
  button.id = 'mobile-nav-toggle';
  button.className = 'mobile-nav-toggle';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav');
  button.innerHTML = '<span class="menu-icon" aria-hidden="true"></span><span class="menu-label">菜单</span>';
  sidebar.insertBefore(button, nav);

  const label = button.querySelector('.menu-label');
  const isMobile = () => window.matchMedia('(max-width: 920px)').matches;
  const closeMenu = () => {
    sidebar.classList.remove('nav-open');
    button.setAttribute('aria-expanded', 'false');
    label.textContent = '菜单';
  };

  button.addEventListener('click', event => {
    event.stopPropagation();
    const open = sidebar.classList.toggle('nav-open');
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? '收起' : '菜单';
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('[data-view]') && isMobile()) closeMenu();
  });

  document.addEventListener('click', event => {
    if (isMobile() && sidebar.classList.contains('nav-open') && !sidebar.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) closeMenu();
  });
})();
