/**
 * dobi · 60fps Motion & Interactive Visual Engine
 * Spring physics reveals, cursor spotlight cards, animated counters, and cosmic particle field.
 */
(function () {
  'use strict';

  // 1. 60FPS COSMIC STARFIELD & ORBITAL PARTICLES CANVAS
  function initCosmicCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cosmic-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:0.75;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }, { passive: true });

    const count = Math.min(70, Math.floor((w * h) / 22000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.65 + 0.15,
      phase: Math.random() * Math.PI * 2,
      isOrange: Math.random() > 0.45
    }));

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.018;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isOrange
          ? `rgba(245, 130, 32, ${a})`
          : `rgba(255, 255, 255, ${a * 0.7})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // 2. 60FPS SPRING SCROLL REVEALS (Framer-Motion style)
  function initScrollMotion() {
    const els = document.querySelectorAll('[data-motion]');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.getAttribute('data-delay') || '0');
          setTimeout(() => {
            el.classList.add('motion-visible');
          }, delay * 1000);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => io.observe(el));
  }

  // 3. 60FPS CURSOR SPOTLIGHT & 3D TILT ON CARDS
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
      let rafId = null;
      card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          // Subtle 3D tilt physics
          if (card.hasAttribute('data-tilt')) {
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = ((y - cy) / cy) * -3.5;
            const ry = ((x - cx) / cx) * 3.5;
            card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
          }
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (card.hasAttribute('data-tilt')) {
          card.style.transform = '';
        }
      }, { passive: true });
    });
  }

  // 4. 60FPS ANIMATED NUMBER COUNTERS
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        const target = parseInt(el.getAttribute('data-counter'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const useDots = el.getAttribute('data-format') === 'dots';
        const duration = 1600;
        const start = performance.now();

        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo (Framer Motion spring feel)
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.round(eased * target);
          const formatted = useDots
            ? current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            : current.toString();
          el.textContent = `${prefix}${formatted}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });

    counters.forEach((c) => io.observe(c));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCosmicCanvas();
    initScrollMotion();
    initSpotlightCards();
    initCounters();
  });
})();
