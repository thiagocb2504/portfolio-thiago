/* =========================
   ÓRBITA DOS PROJETOS
========================= */

import { createOrbitImages } from './orbit-images.js';

const section = document.querySelector('#projetos');
const grid = section?.querySelector('.projects-grid');
const cards = [...document.querySelectorAll('.projects-grid > .pcard')];

if (grid && cards.length) {
  const host = document.createElement('div');
  host.className = 'projects-orbit';
  host.setAttribute('data-animate', '');
  grid.before(host);

  // cada posição da órbita mostra a mesma ilustração do card
  const items = cards.map((card) => {
    const media = card.querySelector('.pcard-media').cloneNode(true);
    media.querySelectorAll('img').forEach((img) => img.removeAttribute('loading'));
    const title = card.querySelector('.pcard-open').textContent.trim();
    return { node: media, label: `Abrir detalhes: ${title}` };
  });

  const hint = document.createElement('p');
  hint.className = 'orbit-hint mono';
  hint.textContent = 'Clique em um projeto';

  const orbit = createOrbitImages(host, {
    items,
    radiusX: 340,
    radiusY: 80,
    rotation: -8,
    duration: 30,
    itemSize: 150,
    depth: 0.6,
    itemRadius: 10,
    showPath: true,
    pathColor: 'rgba(255, 40, 40, 0.35)',
    centerContent: hint,
    // abre a mesma janela de detalhes do card
    onItemClick: (index) => cards[index].querySelector('.pcard-open').click()
  });

  // a miniatura acompanha o tamanho dos itens, que muda com a largura da tela
  const first = orbit.root.querySelector('.orbit-item');
  new ResizeObserver(() => {
    host.style.setProperty('--orbit-zoom', String(first.offsetWidth / 520));
  }).observe(first);
}
