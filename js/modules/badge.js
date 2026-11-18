/* =========================
   CRACHÁ 3D (LANYARD)
========================= */

import { createLanyard } from '../components/lanyard.js';

const holder = document.querySelector('.hero-badge');
const stage = holder?.querySelector('.lanyard-stage');

const NAVY = '#071739';
const NAVY_LIGHT = '#0d2a63';
const SKY = '#38adfc';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const canvasOf = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')];
};

const cover = (ctx, image, width, height) => {
  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
};

// frente: foto com nome e cargo embaixo
function drawFront(photo, logo) {
  const [canvas, ctx] = canvasOf(1024, 1440);
  cover(ctx, photo, 1024, 1440);

  const shade = ctx.createLinearGradient(0, 880, 0, 1440);
  shade.addColorStop(0, 'rgba(7, 23, 57, 0)');
  shade.addColorStop(0.55, 'rgba(7, 23, 57, 0.82)');
  shade.addColorStop(1, 'rgba(7, 23, 57, 0.97)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 880, 1024, 560);

  ctx.drawImage(logo, 64, 150, 200, (200 * logo.height) / logo.width);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 128px "Instrument Serif"';
  ctx.fillText('Thiago Brito', 64, 1290);

  ctx.fillStyle = SKY;
  ctx.font = '500 34px "Geist Mono"';
  ctx.fillText('ESTAGIÁRIO · DESENVOLVIMENTO', 68, 1360);

  return canvas.toDataURL('image/png');
}

// verso: logo da empresa e os dados do crachá
function drawBack(logo) {
  const [canvas, ctx] = canvasOf(1024, 1440);
  const bg = ctx.createLinearGradient(0, 0, 1024, 1440);
  bg.addColorStop(0, NAVY);
  bg.addColorStop(1, NAVY_LIGHT);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1440);

  const logoWidth = 620;
  ctx.drawImage(logo, (1024 - logoWidth) / 2, 190, logoWidth, (logoWidth * logo.height) / logo.width);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#a9c3e8';
  ctx.font = '400 36px Geist';
  ctx.fillText('Onde dados viram decisão', 512, 510);

  ctx.fillStyle = 'rgba(56, 173, 252, 0.35)';
  ctx.fillRect(90, 565, 844, 2);

  ctx.textAlign = 'left';
  const field = (label, value, x, y, size = 50) => {
    ctx.fillStyle = SKY;
    ctx.font = '500 26px "Geist Mono"';
    ctx.fillText(label, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = `500 ${size}px Geist`;
    ctx.fillText(value, x, y + size + 10);
  };

  field('NOME', 'Thiago da Costa Brito', 90, 650);
  field('CARGO', 'Estagiário de Desenvolvimento', 90, 800, 44);
  field('ÁREA', 'Fullstack · Integrações · ERP · CRM', 90, 940, 44);
  field('DESDE', 'Out. 2026', 90, 1080, 44);
  field('LOCAL', 'Brasília, DF', 540, 1080, 44);

  // código de barras decorativo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  let x = 90;
  const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2];
  bars.forEach((w, i) => {
    if (i % 2 === 0) ctx.fillRect(x, 1250, w * 5, 90);
    x += w * 5 + 4;
  });
  ctx.fillStyle = '#a9c3e8';
  ctx.font = '400 28px "Geist Mono"';
  ctx.textAlign = 'right';
  ctx.fillText('cdssolutions.com.br', 934, 1330);

  return canvas.toDataURL('image/png');
}

// cordão: logo repetida sobre o azul da marca
function drawStrap(logo) {
  const [canvas, ctx] = canvasOf(1400, 200);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, 1400, 200);
  const height = 132;
  const width = (height * logo.width) / logo.height;
  [130, 830].forEach((x) => ctx.drawImage(logo, x, (200 - height) / 2, width, height));
  ctx.fillStyle = SKY;
  [600, 1300].forEach((x) => ctx.fillRect(x, 92, 16, 16));
  return canvas.toDataURL('image/png');
}

async function start() {
  if (!stage) return;

  await Promise.all([
    document.fonts.load('400 128px "Instrument Serif"'),
    document.fonts.load('500 50px Geist'),
    document.fonts.load('500 26px "Geist Mono"')
  ]);
  const [photo, logo] = await Promise.all([
    loadImage('assets/img/thiago-cracha.webp'),
    loadImage('assets/img/cds-logo.svg')
  ]);

  const lanyard = createLanyard(stage, {
    frontImage: drawFront(photo, logo),
    backImage: drawBack(logo),
    strapImage: drawStrap(logo),
    cardColor: NAVY,
    finish: 'glossy',
    metal: 'silver',
    size: 0.6,
    strapLength: 0.42,
    strapWidth: 0.8
  });

  // sem WebGL a foto estática aparece no lugar
  holder.classList.add(lanyard ? 'is-3d' : 'no-3d');
}

start().catch(() => holder?.classList.add('no-3d'));
