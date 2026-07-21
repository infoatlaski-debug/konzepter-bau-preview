(() => {
  'use strict';

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Mobile menu */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    burger?.classList.add('is-open');
    burger?.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
  }
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* Reveal-on-scroll (a11y-safe: only transform, safety-timeout) */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
    setTimeout(() => revealEls.forEach((el) => el.classList.add('is-visible')), 2500);
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* Cookie banner */
  const COOKIE_KEY = 'konzepterbau_cookie_consent';
  const banner = document.querySelector('.cookie-banner');
  function getConsent() {
    try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch (e) { /* ignore */ }
    banner?.classList.remove('is-visible');
  }
  if (banner && !getConsent()) {
    banner.classList.add('is-visible');
  }
  document.querySelectorAll('[data-cookie-accept]').forEach((btn) =>
    btn.addEventListener('click', () => setConsent('accepted'))
  );
  document.querySelectorAll('[data-cookie-reject]').forEach((btn) =>
    btn.addEventListener('click', () => setConsent('rejected'))
  );
  document.querySelectorAll('[data-cookie-reopen]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      banner?.classList.add('is-visible');
    })
  );

  /* Contact form */
  const form = document.querySelector('#contact-form');
  if (form) {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const webhook = form.dataset.webhook;

    function showStatus(kind, message) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = `form-status is-visible ${kind}`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Honeypot */
      const honeypot = form.querySelector('input[name="website_url"]');
      if (honeypot && honeypot.value) return;

      const name = form.querySelector('#f-name')?.value.trim();
      const email = form.querySelector('#f-email')?.value.trim();
      const message = form.querySelector('#f-message')?.value.trim();
      const consent = form.querySelector('#f-consent')?.checked;

      if (!name || !email || !message) {
        showStatus('error', 'Bitte fülle Name, E-Mail und Nachricht aus.');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showStatus('error', 'Bitte gib eine gültige E-Mail-Adresse ein.');
        return;
      }
      if (!consent) {
        showStatus('error', 'Bitte stimme der Datenschutzerklärung zu.');
        return;
      }

      const payload = {
        name,
        email,
        phone: form.querySelector('#f-phone')?.value.trim() || '',
        topic: form.querySelector('#f-topic')?.value || 'Allgemein',
        message,
        consent: true,
        source: 'konzepterbau.de',
        submitted_at: new Date().toISOString(),
      };

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wird gesendet …'; }

      try {
        if (webhook) {
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        showStatus('success', 'Danke! Deine Anfrage ist angekommen — wir melden uns zeitnah.');
        form.reset();
      } catch (err) {
        showStatus('error', 'Da ist etwas schiefgelaufen. Bitte versuch es erneut oder ruf uns direkt an.');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Anfrage senden'; }
      }
    });
  }
})();
