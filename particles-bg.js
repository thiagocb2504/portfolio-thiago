/* =========================
   FUNDO DE PARTÍCULAS
========================= */

import { createParticles } from './particles.js';

// fica fixo atrás de todo o conteúdo e não bloqueia cliques
const background = document.createElement('div');
background.className = 'particles-bg';
background.setAttribute('aria-hidden', 'true');
document.body.prepend(background);

const particles = createParticles(background, {
  particleColors: ['#ff0000', '#ff0000', '#ff0000'],
  particleCount: 1600,
  particleSpread: 10,
  speed: 0.1,
  particleBaseSize: 45,
  glow: 0.6,
  twinkle: 0,
  moveParticlesOnHover: true,
  hoverEffect: 'parallax',
  drift: 'forward',
  driftSpeed: 1.2
});

// sem WebGL2 o fundo continua só com a cor
if (!particles) {
  background.remove();
}
