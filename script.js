/* =============================================
   ALFAVINKEL · script.js
   ============================================= */

(function () {
  'use strict';

  /* ---- Elements ---- */
  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  /* ============================================
     HEADER — Scroll effect
     ============================================ */
  const SCROLL_THRESHOLD = 72;

  function updateHeader() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // run on load in case page is pre-scrolled

  /* ============================================
     MOBILE MENU
     ============================================ */
  function openMenu() {
    nav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  }

  /* Toggle on hamburger click */
  hamburger.addEventListener('click', toggleMenu);

  /* Close on nav link click */
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on outside click */
  document.addEventListener('click', function (e) {
    if (
      nav.classList.contains('open') &&
      !nav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* ============================================
     SMOOTH SCROLL — polyfill for anchor links
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ============================================
     INTERSECTION OBSERVER — Fade-in on scroll
     ============================================ */
  const animateEls = document.querySelectorAll(
    '.service-card, .gallery__item, .contact__detail-item, .about__content, .about__image-wrap'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    animateEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.08 + 's';
      observer.observe(el);
    });
  } else {
    /* Fallback: show all immediately */
    animateEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

})();
