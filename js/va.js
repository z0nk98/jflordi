/* Virtual assistant page extras: live Cebu clock and the support-plan builder. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const copy = window.portfolio && window.portfolio.copyText;

  // ------------------------------------------------------------ Live clock
  const clock = $('#clock');
  function tick() {
    try {
      const o = { hour: 'numeric', minute: '2-digit', weekday: 'short' };
      const mine = new Intl.DateTimeFormat('en-US', { ...o, timeZone: 'Asia/Manila' }).format(new Date());
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let txt = `It's ${mine} for Judy in Cebu`;
      if (tz && !['Asia/Manila', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Taipei'].includes(tz)) {
        txt += ` · ${new Intl.DateTimeFormat('en-US', o).format(new Date())} for you`;
      }
      clock.textContent = txt;
    } catch (e) { clock.textContent = ''; }
  }
  if (clock) { tick(); setInterval(tick, 30000); }

  // ---------------------------------------------------------- Plan builder
  const SVC = [
    ['Data entry & data cleanup', 'Accurate records and clean spreadsheets. I process data updates at 99%+ accuracy at Accenture.'],
    ['Customer & inbox support', 'Replies, ticket tracking and follow-ups until each request is resolved, done to SLA for 4+ years.'],
    ['SOPs & documentation', 'Clear step-by-step guides so tasks are repeatable. I write knowledge base articles every week.'],
    ['File & document management', 'Organized drives, version control and approval tracking, from my document controller work.'],
    ['Reports & spreadsheets', 'Excel and Google Sheets reports and summaries you can read at a glance.'],
    ['AI-powered productivity', 'Faster drafts, summaries and troubleshooting using AI tools, always checked by me.'],
  ];
  const form = $('#plan-form');
  if (!form) return;
  const picks = Array.from(form.querySelectorAll('input[name="svc"]'));
  const biz = $('#plan-biz');
  const list = $('#plan-list');
  const count = $('#plan-count');
  const msg = $('#plan-msg');
  const copyBtn = $('#plan-copy');
  const mail = $('#plan-mail');
  const email = 'judy.flor.di@gmail.com';

  function render() {
    const chosen = picks.filter((c) => c.checked).map((c) => SVC[Number(c.value)]);
    list.textContent = '';
    count.textContent = chosen.length + (chosen.length === 1 ? ' task' : ' tasks');
    if (!chosen.length) {
      const li = document.createElement('li');
      li.className = 'plan-empty';
      li.textContent = 'Tick at least one task to build your plan.';
      list.append(li);
      msg.value = '';
      copyBtn.disabled = true;
      mail.setAttribute('aria-disabled', 'true');
      mail.href = `mailto:${email}`;
      return;
    }
    chosen.forEach(([name, how]) => {
      const li = document.createElement('li');
      const b = document.createElement('strong'); b.textContent = name;
      const s = document.createElement('span'); s.textContent = how;
      li.append(b, s);
      list.append(li);
    });
    const b = biz.value.trim();
    const article = /^[aeiou]/i.test(b) ? 'an ' : 'a ';
    const runs = b ? ` and I run ${/^(a|an|the|my|our)\s/i.test(b) ? b : article + b}` : '';
    msg.value = `Hi Judy,\n\nI found your portfolio${runs}. I'm looking for help with:\n`
      + chosen.map(([name]) => `• ${name}`).join('\n')
      + `\n\nCould we set up a quick call to talk about the tasks, hours and rate?\n\nThanks,\n[Your name]`;
    copyBtn.disabled = false;
    mail.removeAttribute('aria-disabled');
    mail.href = `mailto:${email}?subject=${encodeURIComponent('Virtual assistant support')}&body=${encodeURIComponent(msg.value)}`;
  }

  picks.forEach((c) => c.addEventListener('change', render));
  biz.addEventListener('input', render);
  copyBtn.addEventListener('click', () => {
    if (copy) copy(msg.value, 'Message');
    else { msg.select(); document.execCommand('copy'); }
  });
  render();
})();
