/* =========================
   BORDAS ELÉTRICAS
========================= */

import { createElectricBorder } from '../components/electric-border.js';

const SETTINGS = {
  color: '#ff0000',
  speed: 1,
  chaos: 0.5,
  spread: 0.6,
  strands: 3,
  thickness: 1.5
};

// cada borda é um contexto WebGL e o navegador aceita poucos por página,
// então ela só existe enquanto a caixa está perto da tela
const boxes = document.querySelectorAll('.pcard, .ai-block');
const borders = new Map();

const attach = (box) => {
  if (borders.has(box) || !box.dataset.near) return;
  const radius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0;
  const border = createElectricBorder(box, { ...SETTINGS, borderRadius: radius });
  if (border) borders.set(box, border);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const box = entry.target;

    if (entry.isIntersecting) {
      box.dataset.near = 'true';
      attach(box);
    } else {
      delete box.dataset.near;
      borders.get(box)?.destroy();
      borders.delete(box);
    }
  });
}, { rootMargin: '150px 0px' });

boxes.forEach((box) => observer.observe(box));
