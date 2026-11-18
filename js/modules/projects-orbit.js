/* =========================
   ÓRBITA DOS PROJETOS
========================= */

import { createOrbitImages } from '../components/orbit-images.js';

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

  const small = window.matchMedia('(max-width: 700px)').matches;

  // formato das capturas (1200×577) com a barra da janela por cima: elas aparecem inteiras, sem corte
  const ASPECT = 1.9;
  host.style.setProperty('--orbit-aspect', String(ASPECT));

  const hint = document.createElement('p');
  hint.className = 'orbit-hint mono';
  hint.textContent = small ? 'Toque em um projeto' : 'Clique em um projeto';

  const orbit = createOrbitImages(host, {
    items,
    // no celular a elipse é mais estreita e alta, para os itens ficarem grandes o bastante para tocar
    radiusX: small ? 190 : 360,
    radiusY: small ? 130 : 100,
    rotation: small ? -6 : -8,
    duration: 30,
    itemSize: small ? 200 : 240,
    itemAspect: ASPECT,
    depth: 0.6,
    itemRadius: 10,
    showPath: true,
    pathColor: 'rgba(255, 40, 40, 0.35)',
    centerContent: hint,
    // abre a mesma janela de detalhes do card
    onItemClick: (index) => cards[index].querySelector('.pcard-open').click()
  });

  // com a órbita no ar, a grade de cards sai de cena; ela continua no HTML como fonte
  // das ilustrações e dos detalhes, e volta a aparecer se a órbita não carregar
  section.classList.add('has-orbit');

  // a miniatura acompanha o tamanho dos itens, que muda com a largura da tela
  const first = orbit.root.querySelector('.orbit-item');
  new ResizeObserver(() => {
    host.style.setProperty('--orbit-zoom', String(first.offsetWidth / 520));
  }).observe(first);
}
