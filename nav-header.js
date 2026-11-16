/* =========================
   NAVEGAÇÃO GOOEY NO HEADER
========================= */

import { createGooeyNav } from './gooey-nav.js';

const header = document.querySelector('.header');
const navBar = header?.querySelector('.nav');
const actions = navBar?.querySelector('.nav-actions');
const links = [...document.querySelectorAll('.nav-links a')];

// mesmos links do menu do celular, com "Início" na frente
const items = [
  { label: 'Início', href: '#topo', section: document.querySelector('.intro') },
  ...links.map((link) => ({
    label: link.textContent.trim(),
    href: link.getAttribute('href'),
    section: document.querySelector(link.getAttribute('href'))
  }))
];

// enquanto a página rola até a seção clicada, o acompanhamento da rolagem fica pausado
let locked = false;
let unlockTimer = 0;

const unlock = () => {
  locked = false;
  clearTimeout(unlockTimer);
};

if (navBar && actions) {
  const host = document.createElement('div');
  host.className = 'gooey-host';
  navBar.insertBefore(host, actions);

  const gooey = createGooeyNav(host, {
    items,
    initialActiveIndex: 0,
    theme: 'dark',
    size: 'md',
    frame: true,
    color: '#d90f0f',
    particleCount: 15,
    spread: 56,
    animationTime: 600,
    timeVariance: 300,
    gooeyness: 0.5,
    wobble: 0.5,
    hoverEffect: true,
    label: 'Navegação principal',
    onChange: () => {
      locked = true;
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(unlock, 1500);
      window.addEventListener('scrollend', unlock, { once: true });
    }
  });

  // o vidro do componente puxava para o roxo; aqui ele segue o preto quente do site
  gooey.nav.style.setProperty('--gn-frame', 'rgba(34, 27, 27, 0.66)');

  header.classList.add('has-gooey');

  // a bolinha acompanha a seção que está no meio da tela
  const spy = new IntersectionObserver((entries) => {
    if (locked) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = items.findIndex((item) => item.section === entry.target);
      if (index >= 0) gooey.setActive(index);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  items.forEach((item) => item.section && spy.observe(item.section));
}
