const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
const links = document.querySelectorAll('.site-menu a');

function closeMenu() {
  toggle.classList.remove('open');
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
}

toggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
links.forEach(link => link.addEventListener('click', closeMenu));
document.querySelector('#year').textContent = new Date().getFullYear();
