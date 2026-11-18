/* =========================
   ENTRADA DOS BLOCOS
========================= */

import { createAnimatedContent } from '../components/animated-content.js';

const SETTINGS = {
  distance: 100,
  direction: 'vertical',
  duration: 1.4,
  ease: 'power3.out',
  blur: 0,
  threshold: 0.1
};

// data-animate="stagger": cada filho entra na sua vez; data-animate: o bloco entra inteiro
document.querySelectorAll('[data-animate]').forEach((el) => {
  const stagger = el.dataset.animate === 'stagger' ? 0.14 : 0;
  createAnimatedContent(el, { ...SETTINGS, stagger });
  el.classList.add('is-animated');
});
