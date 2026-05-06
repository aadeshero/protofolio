/**
 * main.js
 * Portfolio interactivity:
 *  - Loader / preloader
 *  - Custom cursor
 *  - Navigation scroll behaviour & mobile toggle
 *  - Typing animation
 *  - Scroll-reveal (Intersection Observer)
 *  - Stats counter animation
 *  - Skill-bar animation
 *  - Project filter
 *  - Experience/Education tab switch
 *  - Contact-form validation
 *  - Back-to-top button
 *  - Footer year
 *  - Starfield instances
 */

(function () {
  'use strict';

  /* Selector for all elements that should trigger the hover cursor state */
  var INTERACTIVE_SELECTOR = 'a, button, .project-card, .filter-btn, .tab-btn, .tool-chip, .social-btn, .back-to-top, input, textarea, label';

  /* ── Utility ─────────────────────────────────── */
  function $(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }

  function $$(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LOADER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var loaderStarfield = null;

  function initLoader() {
    var loader = $('#loader');
    if (!loader) return;

    loaderStarfield = new LoaderStarfield('loader-canvas');

    var minDelay = 1800; // ms – minimum display time for the loader
    var startTime = Date.now();

    window.addEventListener('load', function () {
      var elapsed = Date.now() - startTime;
      var remaining = Math.max(0, minDelay - elapsed);
      setTimeout(function () {
        loader.classList.add('fade-out');
        loader.addEventListener('transitionend', function () {
          loader.style.display = 'none';
          if (loaderStarfield) loaderStarfield.stop();
        }, { once: true });
        // Kick off page animations after loader hides
        setTimeout(initReveal, 200);
      }, remaining);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CUSTOM CURSOR
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCursor() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var cursor = $('#cursor');
    var trail  = $('#cursor-trail');
    if (!cursor || !trail) return;

    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var tx = cx, ty = cy;

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });

    // Trailing animation
    function moveCursorTrail() {
      tx += (cx - tx) * 0.12;
      ty += (cy - ty) * 0.12;
      trail.style.left = tx + 'px';
      trail.style.top  = ty + 'px';
      requestAnimationFrame(moveCursorTrail);
    }
    moveCursorTrail();

    // Hover state on interactive elements
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        cursor.classList.add('is-hovering');
        trail.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        cursor.classList.remove('is-hovering');
        trail.classList.remove('is-hovering');
      }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVIGATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initNav() {
    var navbar = $('#navbar');
    var toggle = $('#nav-toggle');
    var links  = $('#nav-links');
    if (!navbar) return;

    // Scroll: add/remove .scrolled class
    function onScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      updateActiveLink();
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Active link highlight based on section in viewport
    function updateActiveLink() {
      var sections = $$('section[id]');
      var scrollY  = window.scrollY + 120;
      var activeId = '';

      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollY) activeId = sec.id;
      });

      $$('.nav-link').forEach(function (a) {
        var href = (a.getAttribute('href') || '').replace('#', '');
        a.classList.toggle('active', href === activeId);
      });
    }

    // Mobile toggle
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('is-open');
        toggle.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      $$('.nav-link').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('is-open');
          toggle.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) {
          links.classList.remove('is-open');
          toggle.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TYPING ANIMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initTyping() {
    var el = $('#typed-text');
    if (!el) return;

    var phrases = [
      'Software Developer',
      'Front-End Engineer',
      'Python Enthusiast',
      'Data Explorer',
      'Problem Solver',
      'Earth Scientist'
    ];

    var phraseIndex = 0;
    var charIndex   = 0;
    var isDeleting  = false;
    var typingDelay = 100;
    var deletingDelay = 55;
    var pauseDelay  = 1800;

    function type() {
      var current = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, deletingDelay);
      } else {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(type, pauseDelay);
          return;
        }
        setTimeout(type, typingDelay);
      }
    }

    setTimeout(type, 800);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SCROLL REVEAL  (Intersection Observer)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initReveal() {
    var targets = $$('.reveal-up, .reveal-left, .reveal-right');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(function (t) { obs.observe(t); });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STATS COUNTER ANIMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCounters() {
    var counters = $$('.stat-number[data-target]');
    if (!counters.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.dataset.target, 10);
        var start  = 0;
        var duration = 1500;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { obs.observe(c); });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SKILL BARS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initSkillBars() {
    var fills = $$('.skill-bar-fill[data-width]');
    if (!fills.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.width = el.dataset.width + '%';
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });

    fills.forEach(function (f) { obs.observe(f); });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PROJECT FILTER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initProjectFilter() {
    var btns  = $$('.filter-btn');
    var cards = $$('.project-card');
    if (!btns.length || !cards.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        cards.forEach(function (card) {
          var cat = card.dataset.category;
          if (filter === 'all' || cat === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TIMELINE TABS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initTimelineTabs() {
    var tabBtns   = $$('.tab-btn');
    var tabPanels = $$('.timeline');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.tab;

        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        tabPanels.forEach(function (panel) {
          var id = panel.id;
          panel.classList.toggle('hidden', id !== 'tab-' + target);
        });

        // Re-run reveal on newly shown items
        $$('#tab-' + target + ' .reveal-left, #tab-' + target + ' .reveal-right').forEach(function (el) {
          el.classList.add('is-visible');
        });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CONTACT FORM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initContactForm() {
    var form    = $('#contact-form');
    if (!form) return;

    var nameInput    = $('#name');
    var emailInput   = $('#email');
    var messageInput = $('#message');
    var submitBtn    = $('#submit-btn');
    var btnText      = submitBtn && submitBtn.querySelector('.btn-text');
    var btnLoading   = submitBtn && submitBtn.querySelector('.btn-loading');
    var successMsg   = $('#form-success');

    function showError(inputEl, errorId, msg) {
      var errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = msg;
      if (inputEl) inputEl.style.borderColor = '#ff6b6b';
    }

    function clearError(inputEl, errorId) {
      var errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = '';
      if (inputEl) inputEl.style.borderColor = '';
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Live validation
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (nameInput.value.trim().length >= 2) clearError(nameInput, 'name-error');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (validateEmail(emailInput.value.trim())) clearError(emailInput, 'email-error');
      });
    }

    if (messageInput) {
      messageInput.addEventListener('input', function () {
        if (messageInput.value.trim().length >= 10) clearError(messageInput, 'message-error');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = nameInput    ? nameInput.value.trim()    : '';
      var email   = emailInput   ? emailInput.value.trim()   : '';
      var message = messageInput ? messageInput.value.trim() : '';
      var valid   = true;

      // Validate
      if (name.length < 2) {
        showError(nameInput, 'name-error', 'Please enter your name (at least 2 characters).');
        valid = false;
      } else {
        clearError(nameInput, 'name-error');
      }

      if (!validateEmail(email)) {
        showError(emailInput, 'email-error', 'Please enter a valid email address.');
        valid = false;
      } else {
        clearError(emailInput, 'email-error');
      }

      if (message.length < 10) {
        showError(messageInput, 'message-error', 'Please enter a message (at least 10 characters).');
        valid = false;
      } else {
        clearError(messageInput, 'message-error');
      }

      if (!valid) return;

      // Simulate sending (replace with actual fetch/EmailJS call)
      if (submitBtn) submitBtn.disabled = true;
      if (btnText)    btnText.classList.add('hidden');
      if (btnLoading) btnLoading.classList.remove('hidden');

      setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText)    btnText.classList.remove('hidden');
        if (btnLoading) btnLoading.classList.add('hidden');
        if (successMsg) successMsg.classList.remove('hidden');
        form.reset();
        if (nameInput)    nameInput.style.borderColor    = '';
        if (emailInput)   emailInput.style.borderColor   = '';
        if (messageInput) messageInput.style.borderColor = '';
        // Hide success after 5s
        setTimeout(function () {
          if (successMsg) successMsg.classList.add('hidden');
        }, 5000);
      }, 1500);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BACK TO TOP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initBackToTop() {
    var btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FOOTER YEAR
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initFooterYear() {
    var el = $('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STARFIELDS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initStarfields() {
    // Hero starfield
    new Starfield('hero-canvas', {
      count: 220,
      shooting: 4,
      colours: ['#ffffff', '#c9d8ff', '#d0b0ff', '#cce8ff', '#ffd0f0']
    });

    // Footer starfield (lightweight)
    new Starfield('footer-canvas', {
      count: 60,
      shooting: 0,
      colours: ['#ffffff', '#c9d8ff']
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PARALLAX on hero nebulae (subtle mouse move)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initHeroParallax() {
    var hero = $('#hero');
    if (!hero) return;

    var nebulae = $$('.nebula', hero);
    var planets = $$('.planet', hero);
    if (!nebulae.length) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var dx   = (e.clientX - cx) / rect.width;   // −0.5 to 0.5
      var dy   = (e.clientY - cy) / rect.height;

      nebulae.forEach(function (n, i) {
        var factor = (i + 1) * 18;
        n.style.transform = 'translate(' + (dx * factor) + 'px, ' + (dy * factor) + 'px) scale(1)';
      });

      planets.forEach(function (p, i) {
        var factor = (i + 1) * 12;
        p.style.transform = 'translate(' + (dx * factor) + 'px, ' + (dy * factor) + 'px)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      nebulae.forEach(function (n) { n.style.transform = ''; });
      planets.forEach(function (p) { p.style.transform = ''; });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SMOOTH SCROLL for anchor links
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var targetId = a.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var navHeight = $('#navbar') ? $('#navbar').offsetHeight : 80;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INIT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function init() {
    initLoader();
    initCursor();
    initNav();
    initTyping();
    // initReveal is called after loader hides, but also call now for users
    // that arrive mid-page or have fast connections
    initReveal();
    initCounters();
    initSkillBars();
    initProjectFilter();
    initTimelineTabs();
    initContactForm();
    initBackToTop();
    initFooterYear();
    initStarfields();
    initHeroParallax();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
