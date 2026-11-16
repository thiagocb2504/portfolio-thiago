/* =========================
   NOME COM EFEITO ELÉTRICO
========================= */

import { createElectricLogo } from './electric-logo.js';

const title = document.querySelector('.intro-title');
const stage = title?.querySelector('.intro-electric');
const wordmark = document.querySelector('.wordmark');
const wordmarkStage = wordmark?.querySelector('.wordmark-electric');

const SETTINGS = {
  color: '#ff0000',
  glowColor: '#000000',
  scale: 0.85,
  strands: 2,
  bend: 0.25,
  crackle: 2,
  arcs: 1.3,
  speed: 1.5,
  interactive: true,
  intensity: 1.25,
  glow: 1.15,
  thickness: 1.2,
  flicker: 0.95,
  fill: 0.3,
  cursorRadius: 230
};

// desenha "Thiago Brito" com a mesma fonte do título; o efeito contorna esse desenho
async function drawName() {
  const size = 300;
  const regular = `400 ${size}px "Instrument Serif"`;
  const italic = `italic 400 ${size}px "Instrument Serif"`;

  await Promise.all([document.fonts.load(regular), document.fonts.load(italic)]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tracking = `${-0.035 * size}px`;

  const measure = (font, text) => {
    ctx.font = font;
    ctx.letterSpacing = tracking;
    return ctx.measureText(text).width;
  };

  const first = 'Thiago ';
  const last = 'Brito';
  const firstWidth = measure(regular, first);
  const lastWidth = measure(italic, last);
  const pad = size * 0.1;

  canvas.width = Math.ceil(firstWidth + lastWidth + pad * 2);
  canvas.height = Math.ceil(size * 1.15);

  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  const baseline = size * 0.88;

  ctx.font = regular;
  ctx.letterSpacing = tracking;
  ctx.fillText(first, pad, baseline);

  ctx.font = italic;
  ctx.letterSpacing = tracking;
  ctx.fillText(last, pad + firstWidth, baseline);

  return canvas;
}

async function start() {
  if (!stage && !wordmarkStage) {
    return;
  }

  const shape = await drawName();

  // sem WebGL2 o texto normal continua aparecendo
  if (stage && createElectricLogo(stage, shape, SETTINGS)) {
    title.classList.add('is-electric');
  }

  // o nome pequeno do header usa o mesmo desenho e as mesmas configurações
  if (wordmarkStage && createElectricLogo(wordmarkStage, shape, SETTINGS)) {
    wordmark.classList.add('is-electric');
  }
}

start();
