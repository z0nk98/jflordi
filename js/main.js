/*
 * Progressive enhancements only: the page is fully readable without this file.
 * Features: theme toggle, mobile menu, scroll-spy nav, reading progress,
 * reveal-on-scroll, animated stats, project filters, copy email, and a
 * Ctrl/⌘+K command palette for keyboard navigation.
 */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  // ---------------------------------------------------------------- Toast
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  // ---------------------------------------------------------------- Theme
  const themeBtn = $('#theme-toggle');
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function toggleTheme() { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); }
  setTheme(root.dataset.theme || 'light');
  themeBtn.addEventListener('click', toggleTheme);

  // ----------------------------------------------------------- Mobile menu
  const menuBtn = $('#menu-toggle');
  const navLinks = $('#nav-links');
  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
  });

  // ------------------------------------------- Header shadow + progress bar
  const linkFor = Object.fromEntries($$('.nav-links a').map((a) => [a.hash.slice(1), a]));
  const header = $('.site-header');
  const bar = $('#progress-bar');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 8);
    if (y < 300) Object.values(linkFor).forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
    bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ----------------------------------------------------------- Scroll spy
  const sections = $$('main section[id]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      Object.values(linkFor).forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      const a = linkFor[entry.target.id];
      if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  // ------------------------------------------------------ Reveal on scroll
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 4) * 60, 180)}ms`;
      io.observe(el);
    });
  }

  // --------------------------------------------------------- Count-up stats
  if (!reduceMotion) {
    $$('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1100;
      el.textContent = '0' + suffix;
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }

  // ------------------------------------------------- Highlight filter chips
  // Each .filters toolbar dims the [data-tags] items in its own section that
  // don't match the chosen chip (content stays in the DOM for ATS/readers).
  $$('.filters').forEach((bar) => {
    const chips = $$('.chip', bar);
    const items = $$('[data-tags]', bar.closest('section'));
    chips.forEach((chip) => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      items.forEach((el) => {
        const match = f === 'all' || el.dataset.tags.split(' ').includes(f);
        el.classList.toggle('is-dim', !match);
        el.classList.toggle('is-match', match && f !== 'all');
      });
    }));
  });

  // -------------------------------------------------------- Copy to clipboard
  async function copyText(text, label = 'Email') {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(`${label} copied to clipboard ✓`);
  }
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', () => copyText(btn.dataset.copy, btn.dataset.copyLabel)));
  window.portfolio = { copyText, toast }; // shared with page-specific scripts (e.g. js/va.js)
  const phone = ($('[data-copy-label="Phone number"]') || {}).dataset?.copy || '';

  // ------------------------------------------------------- Command palette
  const palette = $('#palette');
  const input = $('#palette-input');
  const list = $('#palette-list');
  const email = ($('[data-copy]') || {}).dataset?.copy || '';

  const go = (hash) => () => {
    const el = document.querySelector(hash);
    if (el) { el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); history.replaceState(null, '', hash); }
  };
  const commands = [
    ...$$('.nav-links a').map((a) => ({ label: a.textContent.trim(), group: 'Section', icon: '#', run: go(a.hash) })),
    { label: 'View resume', group: 'Action', icon: '📄', run: () => { location.href = ($('.nav-actions a.btn') || {}).href || 'resume.html'; } },
    { label: 'Copy email address', group: 'Action', icon: '✉', run: () => copyText(email) },
    { label: 'Send an email', group: 'Action', icon: '↗', run: () => { location.href = 'mailto:' + email; } },
    ...(phone ? [{ label: 'Copy phone number', group: 'Action', icon: '☎', run: () => copyText(phone, 'Phone number') }] : []),
    { label: 'Toggle dark / light mode', group: 'Action', icon: '◐', run: toggleTheme },
    ...$$('.hero-meta a[target], .contact-links a[target]')
      .filter((a, i, arr) => arr.findIndex((b) => b.href === a.href) === i)
      .map((a) => ({ label: 'Open ' + a.textContent.replace('↗', '').trim(), group: 'Link', icon: '↗', run: () => window.open(a.href, '_blank', 'noopener') })),
  ];

  let results = commands;
  let active = 0;
  let lastFocus = null;

  function render() {
    const q = input.value.trim().toLowerCase();
    results = commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    active = Math.min(active, Math.max(results.length - 1, 0));
    if (!results.length) {
      list.innerHTML = '<li class="pl-empty" role="option" aria-disabled="true">No matches</li>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    list.innerHTML = '';
    results.forEach((c, i) => {
      const li = document.createElement('li');
      li.id = 'pl-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.innerHTML = '<span class="pl-icon" aria-hidden="true"></span><span class="pl-label"></span><span class="pl-group"></span>';
      li.querySelector('.pl-icon').textContent = c.icon;
      li.querySelector('.pl-label').textContent = c.label;
      li.querySelector('.pl-group').textContent = c.group;
      li.addEventListener('mousemove', () => { if (active !== i) { active = i; highlight(); } });
      li.addEventListener('click', () => choose(i));
      list.appendChild(li);
    });
    input.setAttribute('aria-activedescendant', 'pl-' + active);
  }
  function highlight() {
    $$('li[role="option"]', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
    input.setAttribute('aria-activedescendant', 'pl-' + active);
    const el = $('#pl-' + active);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function choose(i) {
    const c = results[i];
    if (!c) return;
    closePalette();
    c.run();
  }
  function openPalette() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    input.value = '';
    active = 0;
    render();
    input.focus();
    document.body.style.overflow = 'hidden';
  }
  function closePalette() {
    palette.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $('#palette-open').addEventListener('click', openPalette);
  palette.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closePalette(); });
  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(results.length, 1); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(results.length, 1); highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Tab') { e.preventDefault(); } // keep focus trapped in the dialog
  });

  // Show the right shortcut hint for the platform
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbd = $('#palette-open kbd');
  if (kbd && !isMac) kbd.textContent = 'Ctrl K';

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape') {
      if (!palette.hidden) closePalette();
      else if (navLinks.classList.contains('is-open')) setMenu(false);
    } else if (e.key === '/' && !typing && palette.hidden) {
      e.preventDefault();
      openPalette();
    }
  });
})();
