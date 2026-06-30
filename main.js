/**
 * Wolfgang Ronner KFZ-Service – main.js  (v2 – Premium Revision)
 *
 * Modules:
 *  1. initIcons        – render Lucide icons (deferred-safe)
 *  2. initNav          – sticky header + transparent-to-solid transition
 *  3. initMobileMenu   – slide-down drawer + keyboard/escape support
 *  4. initReveal       – IntersectionObserver scroll-reveal with stagger
 *  5. initEyebrows     – animated underline on eyebrow labels
 *  6. initCounters     – number count-up animation in trust bar
 *  7. initCarousel     – testimonials: drag/swipe, auto-play, dots, arrows
 *  8. initForm         – validation, shake, async-submit simulation
 *  9. initAnchors      – smooth scroll accounting for fixed nav height
 * 10. initHeroParallax – subtle hero background movement on scroll
 */

'use strict';

/* ── 0. WAIT FOR DOM + LUCIDE ─────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Lucide may still be loading (defer). Poll briefly then render.
  waitForLucide(() => {
    lucide.createIcons();
    boot();
  });
});

function waitForLucide(cb, attempts = 0) {
  if (typeof lucide !== 'undefined') { cb(); return; }
  if (attempts > 30) { boot(); return; } // give up after ~1.5 s
  setTimeout(() => waitForLucide(cb, attempts + 1), 50);
}

function boot() {
  initNav();
  initMobileMenu();
  initReveal();          // .reveal / .reveal-left / .reveal-right
  initEyebrows();        // eyebrow underline sweep
  initCounters();        // trust-bar count-up
  initCarousel();        // testimonials carousel
  initTestimonialCascade(); // staggered card entrance
  initFooterReveal();    // footer columns fade-up
  initAblaufConnectors(); // connector arrow fade-in
  initForm();
  initAnchors();
  initHeroParallax();
}


/* ── 1. STICKY NAV ────────────────────────────────────────────── */
function initNav() {
  const header = document.getElementById('nav-header');
  if (!header) return;

  const update = () =>
    header.classList.toggle('scrolled', window.scrollY > 48);

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ── 2. MOBILE MENU ───────────────────────────────────────────── */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  let isOpen = false;

  const open = () => {
    isOpen = true;
    menu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first link for a11y
    const firstLink = menu.querySelector('.mobile-link');
    if (firstLink) firstLink.focus();
  };

  const close = () => {
    isOpen = false;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => (isOpen ? close() : open()));

  // Close when any link inside is clicked
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', close)
  );

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Click outside
  document.addEventListener('click', e => {
    if (isOpen && !menu.contains(e.target) && !burger.contains(e.target))
      close();
  });
}


/* ── 3. SCROLL REVEAL  (fade-up / fade-left / fade-right) ─────── */
function initReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sel = '.reveal, .reveal-left, .reveal-right';
  const items = document.querySelectorAll(sel);
  if (!items.length) return;

  if (reduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Stagger siblings of the SAME class within the same parent
      const el       = entry.target;
      const parent   = el.parentElement;
      const siblings = [...parent.querySelectorAll(sel)];
      const idx      = siblings.indexOf(el);
      // Set CSS custom property so transition-delay is CSS-driven
      el.style.setProperty('--stagger-i', idx);

      el.classList.add('visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  items.forEach(el => observer.observe(el));
}


/* ── 4. EYEBROW UNDERLINE ANIMATION ──────────────────────────── */
function initEyebrows() {
  const eyebrows = document.querySelectorAll('.eyebrow');
  if (!eyebrows.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  eyebrows.forEach(el => observer.observe(el));
}


/* ── 5. COUNT-UP ANIMATION ────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.trust-num[data-target]');
  if (!counters.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const format = (n, target, suffix) => {
    const disp = n >= 1000 ? n.toLocaleString('de-DE') : String(n);
    return disp + (suffix || '');
  };

  const animate = el => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';

    if (reduced) {
      el.textContent = format(target, target, suffix);
      return;
    }

    const duration  = 1800;
    const startTime = performance.now();

    const tick = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased   = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = format(current, target, suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


/* ── 6. TESTIMONIAL CAROUSEL ──────────────────────────────────── */
function initCarousel() {
  const track    = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const btnPrev  = document.getElementById('carousel-prev');
  const btnNext  = document.getElementById('carousel-next');
  if (!track || !dotsWrap || !btnPrev || !btnNext) return;

  const cards = [...track.querySelectorAll('.tcard')];
  const total = cards.length;
  let current = 0;
  let timer   = null;

  /* How many cards are visible at the current viewport? */
  const perView = () => {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const maxIdx = () => Math.max(0, total - perView());

  /* Build / rebuild dot buttons */
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    const count = maxIdx() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'c-dot' + (i === current ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Bewertung ${i + 1}`);
      btn.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsWrap.appendChild(btn);
    }
  };

  const syncDots = () => {
    dotsWrap.querySelectorAll('.c-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  };

  const syncBtns = () => {
    btnPrev.disabled = current === 0;
    btnNext.disabled = current >= maxIdx();
  };

  /* Scroll track to position */
  const goTo = idx => {
    current = Math.max(0, Math.min(idx, maxIdx()));

    // Card width + gap (--sp-6 = 24px by default)
    const gap  = parseInt(getComputedStyle(track).gap) || 24;
    const cardW = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${current * (cardW + gap)}px)`;

    syncDots();
    syncBtns();
  };

  /* Auto-play */
  const startTimer = () => {
    timer = setInterval(() => {
      goTo(current >= maxIdx() ? 0 : current + 1);
    }, 5200);
  };
  const resetTimer = () => { clearInterval(timer); startTimer(); };

  btnPrev.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  btnNext.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  /* Touch / pointer drag support */
  let dragStartX = 0;
  let isDragging = false;

  track.addEventListener('pointerdown', e => {
    dragStartX = e.clientX;
    isDragging = true;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    const delta = dragStartX - e.clientX;
    if (Math.abs(delta) > 48) {
      delta > 0 ? goTo(current + 1) : goTo(current - 1);
      resetTimer();
    }
  });

  /* Pause on hover (desktop) */
  const wrap = track.parentElement;
  wrap.addEventListener('mouseenter', () => clearInterval(timer));
  wrap.addEventListener('mouseleave', startTimer);

  /* Recalculate on resize (debounced) */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, maxIdx()));
    }, 200);
  });

  /* Init */
  buildDots();
  goTo(0);
  startTimer();
}


/* ── 7. FORM VALIDATION + SUBMIT ──────────────────────────────── */
function initForm() {
  const btn     = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  if (!btn || !success) return;

  // Inject shake keyframes once
  if (!document.getElementById('shake-style')) {
    const s = document.createElement('style');
    s.id = 'shake-style';
    s.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        18%      { transform: translateX(-7px); }
        38%      { transform: translateX(7px); }
        56%      { transform: translateX(-5px); }
        74%      { transform: translateX(5px); }
        88%      { transform: translateX(-2px); }
      }
    `;
    document.head.appendChild(s);
  }

  const shake = el => {
    el.style.animation = 'none';
    void el.offsetHeight; // force reflow
    el.style.animation = 'shake .5s ease';
  };

  const setError = (el, has) => {
    el.style.borderColor = has ? '#C8102E' : '';
    el.setAttribute('aria-invalid', has ? 'true' : 'false');
  };

  const validate = () => {
    const fields = [
      document.getElementById('f-name'),
      document.getElementById('f-phone'),
      document.getElementById('f-email'),
      document.getElementById('f-leistung'),
    ];
    let ok = true;
    fields.forEach(f => {
      if (!f) return;
      const empty = !f.value.trim();
      setError(f, empty);
      if (empty) ok = false;
    });
    return ok;
  };

  // Clear error state as user types
  ['f-name','f-phone','f-email','f-leistung'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => setError(el, false));
  });

  btn.addEventListener('click', () => {
    if (!validate()) { shake(btn); return; }

    // Simulate async submit
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Wird gesendet…';

    // Add CSS spin animation if not already present
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style');
      s.id = 'spin-style';
      s.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; }
      `;
      document.head.appendChild(s);
    }

    setTimeout(() => {
      btn.hidden = true;
      success.hidden = false;
      // Re-render any Lucide icons inside success block
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 1400);
  });
}


/* ── 8. SMOOTH ANCHOR SCROLLING ───────────────────────────────── */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      // Read nav height from CSS variable so changes are automatic
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ── 9. HERO PARALLAX (subtle) ────────────────────────────────── */
function initHeroParallax() {
  const glowBlue = document.querySelector('.hero-glow--blue');
  const glowRed  = document.querySelector('.hero-glow--red');
  if (!glowBlue || !glowRed) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      glowBlue.style.transform = `translateY(${y * 0.18}px)`;
      glowRed.style.transform  = `translateY(${y * -0.12}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}


/* ── 10. TESTIMONIAL CASCADE  — staggered card entrance ───────── */
/*
 * Cards get .card-cascade class + --cascade-delay CSS var.
 * JS triggers entrance when the carousel section enters viewport.
 */
function initTestimonialCascade() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards   = document.querySelectorAll('.tcard');
  if (!cards.length) return;

  if (reduced) {
    cards.forEach(c => { c.classList.add('card-cascade', 'visible'); });
    return;
  }

  // Assign cascade class + per-card delay
  cards.forEach((card, i) => {
    card.classList.add('card-cascade');
    // Remove any existing .reveal so we don't double-animate
    card.classList.remove('reveal');
    card.style.setProperty('--cascade-delay', `${i * 110}ms`);
  });

  // Trigger all at once when the section wrapper scrolls in
  const section = document.getElementById('testimonials');
  if (!section) return;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    // Small lead-in before cascade starts
    setTimeout(() => {
      cards.forEach(c => c.classList.add('visible'));
    }, 80);
    observer.disconnect();
  }, { threshold: 0.12 });

  observer.observe(section);
}


/* ── 11. FOOTER REVEAL  — staggered columns ───────────────────── */
function initFooterReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cols    = document.querySelectorAll('.footer-reveal');
  if (!cols.length) return;

  if (reduced) {
    cols.forEach(c => c.classList.add('visible'));
    return;
  }

  // Set per-column delay (0, 80, 160, 240 ms)
  cols.forEach((col, i) => {
    col.style.setProperty('--footer-delay', `${i * 80}ms`);
  });

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(() => {
      cols.forEach(c => c.classList.add('visible'));
    }, 60);
    observer.disconnect();
  }, { threshold: 0.1 });

  // Observe the footer element itself as trigger
  const footer = document.querySelector('.footer');
  if (footer) observer.observe(footer);
}


/* ── 12. ABLAUF CONNECTOR ARROWS  — fade in after steps ───────── */
function initAblaufConnectors() {
  const reduced     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connectors  = document.querySelectorAll('.ablauf-connector');
  if (!connectors.length) return;

  if (reduced) {
    connectors.forEach(c => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  connectors.forEach(c => observer.observe(c));
}

