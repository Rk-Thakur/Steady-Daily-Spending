// Steady website: scroll reveals, counters, the live phone demo, the
// "Try it" calculator and the privacy page's contents highlight.
// Everything still reads fine without it, and "reduce motion" is respected.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  // ---- Header + scroll progress ----
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.progress');
  const onScroll = () => {
    const y = scrollY;
    header?.classList.toggle('scrolled', y > 24);
    if (bar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Count up ----
  const countUp = (el) => {
    const to = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const fmt = (n) => prefix + Math.round(n).toLocaleString('en-US');
    if (still) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ---- Reveal on scroll (staggered inside [data-stagger]) ----
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.querySelectorAll(':scope > .reveal, :scope > * > .reveal')]
      .forEach((el, i) => el.style.setProperty('--d', `${i * 0.08}s`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---- Cursor spotlight on cards ----
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // ---- Phone: tilt toward the pointer ----
  const phone = document.querySelector('.phone');
  const hero = document.querySelector('.hero');
  if (phone && hero && !still && matchMedia('(pointer: fine)').matches) {
    phone.addEventListener('animationend', () => {
      phone.style.animation = 'none';
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        phone.style.setProperty('--ry', `${-12 + x * 18}deg`);
        phone.style.setProperty('--rx', `${6 - y * 12}deg`);
      });
      hero.addEventListener('pointerleave', () => {
        phone.style.removeProperty('--ry');
        phone.style.removeProperty('--rx');
      });
    }, { once: true });
  }

  // ---- Phone: a little day of spending, on a loop ----
  const num = document.getElementById('demoNum');
  const chg = document.getElementById('demoChg');
  const fill = document.getElementById('demoFill');
  const rows = document.getElementById('demoRows');
  if (num && rows) {
    const day = 42;
    const spends = [
      { dot: '☕', name: 'Corner Coffee', cat: 'Food · just now', amt: 4.5 },
      { dot: '🚌', name: 'Bus Ticket', cat: 'Transport · just now', amt: 2.8 },
      { dot: '🥗', name: 'Lunch', cat: 'Food · just now', amt: 11.2 },
      { dot: '📚', name: 'Paperback', cat: 'Fun · just now', amt: 9 },
    ];
    let left = day;
    let shown = day;
    let i = 0;
    const setNum = (to) => {
      const from = shown;
      shown = to;
      num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
      if (still) { num.textContent = money(to); return; }
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / 700);
        num.textContent = money(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const addRow = (s) => {
      const row = document.createElement('div');
      row.className = 'row enter';
      row.innerHTML = `<span class="dot">${s.dot}</span><span>${s.name}<small>${s.cat}</small></span><b>−$${s.amt.toFixed(2)}</b>`;
      rows.prepend(row);
      while (rows.children.length > 3) rows.lastElementChild.remove();
    };
    const step = () => {
      if (i === spends.length) {
        // A new day: the number resets.
        i = 0; left = day;
        setNum(day);
        chg.textContent = '▲ New day: back to $42';
        chg.classList.remove('down');
        if (fill) fill.style.setProperty('--fill', '62%');
        return;
      }
      const s = spends[i++];
      left -= s.amt;
      addRow(s);
      setNum(left);
      chg.textContent = `$${(day - left).toFixed(2)} spent today`;
      chg.classList.add('down');
      if (fill) fill.style.setProperty('--fill', `${Math.max(8, (left / day) * 62)}%`);
    };
    num.textContent = money(0);
    shown = 0;
    setTimeout(() => setNum(day), still ? 0 : 900);
    if (!still) setInterval(step, 2800);
  }

  // ---- Try it: the daily number calculator ----
  const ids = ['Money', 'Bills', 'Goals', 'Days'];
  const inputs = ids.map((k) => document.getElementById('c' + k));
  if (inputs.every(Boolean)) {
    const big = document.getElementById('cBig');
    const msg = document.getElementById('cMsg');
    const box = document.getElementById('cResult');
    const seg = ['sBills', 'sGoals', 'sFree'].map((k) => document.getElementById(k));
    let shownCalc = 42;
    let raf = 0;
    const render = () => {
      const [m, b, g, d] = inputs.map((el) => Number(el.value));
      inputs.forEach((el, k) => {
        const p = ((el.value - el.min) / (el.max - el.min)) * 100;
        el.style.setProperty('--p', `${p}%`);
        document.getElementById('o' + ids[k]).textContent = k === 3 ? d : money(Number(el.value));
      });
      const free = m - b - g;
      // Rounded down, like the app: never overstates what is safe.
      const target = Math.floor(free / d);
      box.classList.toggle('over', target < 0);
      if (target < 0) {
        msg.textContent = `That's ${money(-free)} short before payday. Steady would show it clearly and spread it over the days ahead.`;
      } else if (target === 0) {
        msg.textContent = 'A tight stretch. Every dollar not spent today makes tomorrow easier.';
      } else if (target < 20) {
        msg.textContent = 'A careful day, but your bills and goals are covered.';
      } else if (target < 80) {
        msg.textContent = "A comfortable day. Spend less and tomorrow's number goes up.";
      } else {
        msg.textContent = 'Plenty of room. Maybe give a goal a little extra?';
      }
      const total = Math.max(m, b + g, 1);
      seg[0].style.width = `${(b / total) * 100}%`;
      seg[1].style.width = `${(g / total) * 100}%`;
      seg[2].style.width = `${(Math.max(0, free) / total) * 100}%`;

      cancelAnimationFrame(raf);
      if (still) { shownCalc = target; big.textContent = fmtSigned(target); return; }
      const from = shownCalc;
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / 350);
        shownCalc = from + (target - from) * (1 - Math.pow(1 - p, 3));
        big.textContent = fmtSigned(shownCalc);
        if (p < 1) raf = requestAnimationFrame(tick);
        else shownCalc = target;
      };
      raf = requestAnimationFrame(tick);
    };
    const fmtSigned = (n) => (n < 0 ? '−' : '') + money(Math.abs(n));
    inputs.forEach((el) => el.addEventListener('input', render));
    render();
  }

  // ---- Privacy page: highlight the section you're reading ----
  const toc = document.querySelectorAll('.toc a');
  if (toc.length) {
    const targets = [...toc]
      .map((a) => [a, document.getElementById(a.hash.slice(1))])
      .filter(([, el]) => el);
    const spy = () => {
      // The last section whose top has passed a third of the screen.
      let current = null;
      for (const [a, el] of targets) {
        if (el.getBoundingClientRect().top < innerHeight * 0.35) current = a;
      }
      toc.forEach((a) => a.classList.toggle('active', a === current));
    };
    addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();
