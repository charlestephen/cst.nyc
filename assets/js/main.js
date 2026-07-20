'use strict';

/* =============================================
   Typewriter effect
   ============================================= */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'an IT/Infrastructure Engineer',
    'an AI Automation Engineer',
    'an MCP & n8n Tinkerer',
    'a Homelab Sorcerer',
    'a Plant Papa',
    'a Dog Dad',
    'a Lifelong Learner',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    el.textContent = deleting ? phrase.slice(0, charIdx--) : phrase.slice(0, charIdx++);

    let delay = deleting ? 45 : 95;

    if (!deleting && charIdx > phrase.length) {
      delay    = 2000;
      deleting = true;
    } else if (deleting && charIdx < 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      charIdx   = 0;
      delay     = 450;
    }

    setTimeout(tick, delay);
  }

  tick();
}());

/* =============================================
   Copyright year
   ============================================= */
const yearEl = document.getElementById('copyrightYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =============================================
   Skill bar animations (Intersection Observer)
   ============================================= */
(function initSkillBars() {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.skill-item').forEach((item, i) => {
          const fill  = item.querySelector('.skill-item__fill');
          const value = item.dataset.value;
          if (fill && value) {
            setTimeout(() => { fill.style.width = value + '%'; }, i * 70);
          }
        });
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(grid);
}());

/* =============================================
   Scroll-reveal animations
   ============================================= */
(function initScrollReveal() {
  const items = document.querySelectorAll('[data-animate]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
}());

/* =============================================
   Active nav link on scroll
   ============================================= */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    },
    { threshold: 0, rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}());

/* =============================================
   Smooth scroll + close mobile nav on link click
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    closeMobileNav();
  });
});

/* =============================================
   Mobile navigation
   ============================================= */
const navToggle      = document.getElementById('navToggle');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openMobileNav() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  sidebarOverlay.removeAttribute('aria-hidden');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  if (!sidebar.classList.contains('open')) return;
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navToggle?.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

sidebarOverlay?.addEventListener('click', closeMobileNav);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileNav();
});

/* =============================================
   Back-to-top button
   ============================================= */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btn.classList.toggle('visible', window.scrollY > 400);
      ticking = false;
    });
  }, { passive: true });
}());
