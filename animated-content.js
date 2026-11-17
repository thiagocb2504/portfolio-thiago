/* =========================================================
   ANIMATED CONTENT
   Versão em JavaScript puro do componente <AnimatedContent />
   do React Bits (https://reactbits.dev). A animação é a original,
   feita com GSAP + ScrollTrigger; os hooks do React viraram uma
   função que recebe o elemento.
========================================================= */

import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

const WIPES = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

/* Anima a entrada de `el`. Com stagger > 0, cada filho direto entra na sua vez.
   Devolve uma função que desfaz tudo. */
export function createAnimatedContent(el, {
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  scrub = false,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete
} = {}) {
  const callbacks = { onStart, onComplete, onDisappearanceComplete };
  const scroller = typeof container === 'string' ? document.querySelector(container) : container || null;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const ctx = gsap.context(() => {
    const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
    const horizontal = direction === 'horizontal';
    const axis = horizontal ? 'x' : 'y';
    const sign = reverse ? -1 : 1;
    const mask = WIPES[wipe];

    gsap.set(el, { visibility: 'visible' });

    if (reduce) {
      callbacks.onComplete?.();
      return;
    }

    const from = {
      [axis]: distance * sign,
      scale,
      opacity: animateOpacity ? initialOpacity : 1
    };
    const to = {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease
    };

    if (blur > 0) {
      from.filter = `blur(${blur}px)`;
      to.filter = 'blur(0px)';
    }
    if (rotate) {
      from.rotation = rotate * sign;
      to.rotation = 0;
    }
    if (tilt) {
      const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
      from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
      to[tiltAxis] = 0;
      from.transformPerspective = 900;
      to.transformPerspective = 900;
    }
    if (mask) {
      gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
      from['--ac-wipe'] = 0;
      to['--ac-wipe'] = 1;
    }
    if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

    const settle = () => {
      if (scrub) return;
      gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });
    };

    const disappear = () => {
      if (disappearAfter <= 0) return;
      const out = {
        [axis]: -distance * sign,
        scale: 0.8,
        opacity: animateOpacity ? initialOpacity : 0,
        delay: disappearAfter,
        duration: disappearDuration,
        ease: disappearEase,
        onComplete: () => callbacks.onDisappearanceComplete?.()
      };
      if (blur > 0) out.filter = `blur(${blur}px)`;
      if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
      gsap.to(targets, out);
    };

    const tl = gsap.timeline({
      paused: true,
      onStart: () => callbacks.onStart?.(),
      onComplete: () => {
        callbacks.onComplete?.();
        settle();
        if (once && !scrub) disappear();
      }
    });
    tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

    if (trigger === 'mount') {
      tl.play();
      return;
    }

    const start = `top ${(1 - threshold) * 100}%`;

    if (scrub) {
      ScrollTrigger.create({
        trigger: el,
        scroller,
        start,
        end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
        scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
        animation: tl
      });
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      scroller,
      start,
      once,
      onEnter: () => tl.play(),
      onLeaveBack: once
        ? undefined
        : () => {
            if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
            tl.reverse();
          }
    });
  }, el);

  return () => ctx.revert();
}
