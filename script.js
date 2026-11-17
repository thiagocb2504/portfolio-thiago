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
   RESERVA DOS EFEITOS 3D
========================= */

// os efeitos vêm de módulos externos; se não carregarem a tempo,
// o nome em texto e a foto estática aparecem no lugar
setTimeout(() => {
  const title = document.querySelector('.intro-title');
  const badge = document.querySelector('.hero-badge');
  if (title && !title.classList.contains('is-electric')) title.classList.add('no-electric');
  if (badge && !badge.classList.contains('is-3d')) badge.classList.add('no-3d');
  // se o GSAP não carregou, os blocos aparecem sem animação
  document.querySelectorAll('[data-animate]:not(.is-animated)').forEach((el) => el.classList.add('is-animated'));
}, 8000);


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
   TÍTULOS EM NEON
========================= */

const neonTitles = document.querySelectorAll('.section-head h2');

if ('IntersectionObserver' in window) {
  const neonObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('lit');
        neonObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -15% 0px' });

  neonTitles.forEach((titleEl) => neonObserver.observe(titleEl));
} else {
  neonTitles.forEach((titleEl) => titleEl.classList.add('lit'));
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


/* =========================
   TABULEIRO DO CAMPO MINADO
========================= */

function renderBoard(board) {
  const rows = board.dataset.board.split('|');
  board.style.setProperty('--cols', rows[0].length);

  rows.join('').split('').forEach((cell) => {
    const span = document.createElement('span');

    if (cell === 'M') {
      span.className = 'flag';
      span.textContent = 'M';
    } else if (cell !== '#') {
      span.className = 'open' + (cell === '.' ? '' : ` n${cell}`);
      span.textContent = cell === '.' ? '' : cell;
    }

    board.append(span);
  });
}

document.querySelectorAll('.mock-mines').forEach(renderBoard);


/* =========================
   DETALHES DOS PROJETOS
========================= */

const dialog = document.querySelector('#project-dialog');
const dialogMedia = dialog.querySelector('.pdialog-media');
const dialogContent = dialog.querySelector('.pdialog-content');

function buildGallery(figures) {
  const tabs = document.createElement('div');
  tabs.className = 'gallery-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Telas do projeto');

  const frame = document.createElement('div');
  frame.className = 'frame frame--browser';
  frame.innerHTML = `
    <div class="frame-bar">
      <span class="frame-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="frame-url mono"></span>
    </div>`;

  const url = frame.querySelector('.frame-url');

  function show(index) {
    const figure = figures[index];
    url.textContent = figure.dataset.url;
    frame.querySelector('img')?.remove();
    frame.append(figure.querySelector('img').cloneNode());

    tabs.querySelectorAll('button').forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
    });
  }

  figures.forEach((figure, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.textContent = figure.dataset.label;
    tab.addEventListener('click', () => show(index));
    tabs.append(tab);
  });

  show(0);
  return figures.length > 1 ? [tabs, frame] : [frame];
}

function openProject(card) {
  const name = card.dataset.project;
  const template = document.querySelector(`#projeto-${name}`);

  if (!template) {
    return;
  }

  const content = template.content.cloneNode(true);
  const figures = [...content.querySelectorAll('[data-slot="gallery"] figure')];

  // projetos com telas reais usam a galeria; os outros reaproveitam a ilustração do card
  dialogMedia.replaceChildren(
    ...(figures.length
      ? buildGallery(figures)
      : [card.querySelector('.pcard-media > .frame').cloneNode(true)])
  );

  dialogContent.replaceChildren(content.querySelector('[data-slot="content"]'));
  dialog.showModal();
  dialog.scrollTop = 0;

  history.replaceState(null, '', `#projeto-${name}`);
}

document.querySelectorAll('.pcard').forEach((card) => {
  card.querySelector('.pcard-open').addEventListener('click', () => openProject(card));
});

dialog.querySelector('.pdialog-close').addEventListener('click', () => dialog.close());

// clique fora da caixa fecha
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

dialog.addEventListener('close', () => {
  history.replaceState(null, '', '#projetos');
});

// link direto para um projeto, ex.: #projeto-vinivinhos
const linkedCard = location.hash.startsWith('#projeto-')
  ? document.querySelector(`.pcard[data-project="${CSS.escape(location.hash.slice(9))}"]`)
  : null;

if (linkedCard) {
  document.querySelector('#projetos').scrollIntoView();
  openProject(linkedCard);
}
