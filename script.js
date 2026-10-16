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
    '.service-card, .gallery__item, .contact__detail-item, .about__content, .about__image-wrap, .about__trades'
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
      el.style.setProperty('--reveal-delay', (i % 3) * 0.08 + 's');
      observer.observe(el);
    });

    /* Sikkerhetsnett. IntersectionObserver kjoerer ikke naar dokumentet er
       skjult, for eksempel i en preview-rute som ikke vises, eller i en
       bakgrunnsfane som aldri faar fokus. Uten dette blir innholdet staaende
       usynlig. Etter tre sekunder vises alt uansett. */
    window.setTimeout(function () {
      animateEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 3000);
  } else {
    /* Fallback: show all immediately */
    animateEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ============================================
     KARUSELL — tilbakemeldinger paa mobil
     Sveipingen er ren CSS (scroll-snap). Her lages bare prikkene som viser
     hvor man er og lar en hoppe direkte til et kort.
     ============================================ */
  const reviewTrack = document.querySelector('.reviews__grid');
  const reviewDots  = document.querySelector('.reviews__dots');

  if (reviewTrack && reviewDots) {
    const cards = Array.from(reviewTrack.children);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cardLeft(card) {
      return card.offsetLeft - parseFloat(getComputedStyle(reviewTrack).paddingLeft);
    }

    const dots = cards.map(function (card, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews__dot';
      dot.setAttribute('aria-label', 'Vis tilbakemelding ' + (i + 1) + ' av ' + cards.length);
      dot.addEventListener('click', function () {
        reviewTrack.scrollTo({ left: cardLeft(card), behavior: smooth ? 'smooth' : 'auto' });
      });
      reviewDots.appendChild(dot);
      return dot;
    });

    let ticking = false;
    function markActive() {
      ticking = false;
      let active = 0;
      let best = Infinity;
      cards.forEach(function (card, i) {
        const d = Math.abs(cardLeft(card) - reviewTrack.scrollLeft);
        if (d < best) { best = d; active = i; }
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    }

    reviewTrack.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(markActive); }
    }, { passive: true });
    markActive();
  }

  /* ============================================
     LIGHTBOX — prosjektbilder
     ============================================ */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  const galleryItems  = Array.from(
    document.querySelectorAll('#prosjekter .beforeafter__item, #prosjekter .gallery__item')
  );

  if (lightbox && galleryItems.length) {
    let currentIndex = 0;
    let returnFocusTo = null;
    const lightboxButtons = [lightboxClose, lightboxPrev, lightboxNext];

    function showImage(index) {
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      const img = galleryItems[currentIndex].querySelector('img');
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
    }

    function openLightbox(index) {
      returnFocusTo = document.activeElement;
      showImage(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (returnFocusTo) returnFocusTo.focus();
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { showImage(currentIndex - 1); });
    lightboxNext.addEventListener('click', function () { showImage(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'Tab') {
        const i = lightboxButtons.indexOf(document.activeElement);
        const step = e.shiftKey ? -1 : 1;
        e.preventDefault();
        lightboxButtons[(i + step + lightboxButtons.length) % lightboxButtons.length].focus();
      }
    });
  }

})();
