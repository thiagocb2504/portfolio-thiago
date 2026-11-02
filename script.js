const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');


/* =========================
   HEADER AO ROLAR
========================= */

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();


/* =========================
   MENU MOBILE
========================= */

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

menuButton.addEventListener('click', () => {
  setMenu(!navLinks.classList.contains('open'));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});


/* =========================
   TEMA CLARO / ESCURO
========================= */

const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeMetas = document.querySelectorAll('meta[name="theme-color"]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function savedTheme() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;

  themeButton.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
  );

  const paper = getComputedStyle(root).getPropertyValue('--paper').trim();
  themeMetas.forEach((meta) => meta.setAttribute('content', paper));
}

themeButton.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';

  try {
    localStorage.setItem('theme', next);
  } catch {
    // sem armazenamento: o tema vale só para esta visita
  }

  if (document.startViewTransition && !reduceMotion.matches) {
    document.startViewTransition(() => applyTheme(next));
  } else {
    applyTheme(next);
  }
});

// sem escolha salva, acompanha o tema do sistema
systemDark.addEventListener('change', (event) => {
  if (!savedTheme()) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

applyTheme(root.dataset.theme || (systemDark.matches ? 'dark' : 'light'));


/* =========================
   HORA EM BRASÍLIA
========================= */

const clock = document.querySelector('.clock');

const clockFormat = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo'
});

function updateClock() {
  clock.textContent = clockFormat.format(new Date());
}

updateClock();
setInterval(updateClock, 30000);


/* =========================
   ANIMAÇÃO DE ENTRADA
========================= */

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}


/* =========================
   LINK ATIVO NO MENU
========================= */

const sections = document.querySelectorAll('main section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    navLinks.querySelectorAll('a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach((section) => navObserver.observe(section));


/* =========================
   COPIAR E-MAIL
========================= */

const copyButton = document.querySelector('.copy-btn');
const copyStatus = document.querySelector('.copy-status');

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    copyStatus.textContent = 'Copiado';
  } catch {
    copyStatus.textContent = 'Não foi possível copiar';
  }

  setTimeout(() => {
    copyStatus.textContent = '';
  }, 2200);
});


/* =========================
   ANO NO RODAPÉ
========================= */

document.querySelector('.year').textContent = new Date().getFullYear();
