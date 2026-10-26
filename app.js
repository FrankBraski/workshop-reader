/* Workshop Reader - app logic. Plain JavaScript, no build step. */
(function () {
  'use strict';

  const C = window.CURRICULUM;
  const CFG = window.WR_CONFIG;
  const LEVELS = C.levels;
  const $app = document.getElementById('app');
  const KEY = 'wr_state_v1';
  const QKEY = 'wr_queue_v1';

  // ---------------------------------------------------------------- storage
  function load(k, d) { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }

  const DEFAULTS = {
    name: '', xp: 0, battery: 100, lastDay: '', unlocked: 1,
    best: {}, done: {}, words: {}, solo: {},
    radioUses: 0, decoderUses: 0, minutes: 0, lastSync: '', history: [],
    droidName: '', taught: {}
  };
  let S = Object.assign({}, DEFAULTS, load(KEY, {}));
  function persist() { save(KEY, S); }

  const today = () => new Date().toLocaleDateString('en-CA');
  const levelById = id => LEVELS.find(l => l.id === id);

  function maxBattery() {
    let m = 100;
    const t = CFG.radio.maxByLevel;
    Object.keys(t).map(Number).sort((a, b) => a - b).forEach(k => { if (S.unlocked >= k) m = t[k]; });
    return m;
  }
  function dailyRecharge() {
    const d = today();
    if (S.lastDay === d) return;
    S.battery = S.lastDay ? Math.min(maxBattery(), S.battery + CFG.radio.dailyRecharge) : maxBattery();
    S.lastDay = d;
    persist();
  }
  function addBattery(n) { S.battery = Math.max(0, Math.min(maxBattery(), S.battery + n)); }

  // ---------------------------------------------------------------- helpers
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pickN = (a, n) => shuffle(a).slice(0, n);
  const norm = s => String(s).toLowerCase().replace(/[\s\-.]+/g, '');

  // Fill n slots from a pool, reshuffling as needed, never the same item twice in a row.
  function fill(pool, n) {
    const out = [];
    while (out.length < n && pool.length) {
      for (const x of shuffle(pool)) {
        if (out.length >= n) break;
        if (pool.length > 1 && out[out.length - 1] === x) continue;
        out.push(x);
      }
    }
    return out;
  }

  // NOTE: Twemoji loads from a CDN; school IT may block it. emo() falls back to the
  // plain emoji character (wrEmoFail) so nothing breaks offline.
  // Twemoji images so pictures look the same on every computer (Windows 10 is missing newer emoji).
  const TW = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/';
  window.wrEmoFail = img => { const s = document.createElement('span'); s.className = img.className + ' emo-txt'; s.textContent = img.alt; img.replaceWith(s); };
  function emo(e, cls) {
    if (!e) return '';
    const code = Array.from(e).map(c => c.codePointAt(0).toString(16)).filter(c => c !== 'fe0f').join('-');
    return `<img class="emo ${cls || ''}" src="${TW}${code}.svg" alt="${e}" draggable="false" onerror="wrEmoFail(this)">`;
  }

  // ---------------------------------------------------------------- speech
  let voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang));
    for (const p of ['Aria', 'Jenny', 'Guy', 'Ana', 'Natural', 'Google US English', 'Zira', 'David', 'Mark']) {
      const v = vs.find(v => v.name.includes(p));
      if (v) { voice = v; return; }
    }
    voice = vs[0] || null;
  }
  const canSpeak = 'speechSynthesis' in window;
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text, rate, pitch, hooks) {
    hooks = hooks || {};
    return new Promise(res => {
      if (!canSpeak) { if (hooks.onend) hooks.onend(); return res(); }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = 'en-US';
      u.rate = rate || 0.85;
      u.pitch = pitch || 1;
      if (hooks.onstart) u.onstart = hooks.onstart;
      if (hooks.onboundary) u.onboundary = hooks.onboundary;
      u.onend = u.onerror = () => { if (hooks.onend) hooks.onend(); res(); };
      speechSynthesis.speak(u);
      setTimeout(res, Math.max(10000, text.length * 150));
    });
  }

  // Read text aloud while highlighting each word in `el` as it's spoken, so he
  // connects the sounds he hears with the print he sees. Words in `el` are the
  // .w elements (from readable()), in the same order as the words in `text`;
  // an element with no .w inside is highlighted as a whole.
  let hlToken = 0;
  function sayHL(el, text, rate, pitch) {
    const my = ++hlToken;
    document.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
    const words = !el ? [] : el.querySelectorAll('.w').length ? [...el.querySelectorAll('.w')] : [el];
    const toks = [];
    text.replace(/\S+/g, (m, i) => { toks.push({ i, len: m.length }); return m; });
    rate = rate || 0.85;
    let cur = -1, gotBoundary = false, timer;
    const mark = i => {
      if (my !== hlToken || i === cur) return;
      if (words[cur]) words[cur].classList.remove('hl');
      cur = i;
      if (words[i]) { words[i].classList.add('hl'); if (words.length > 1) words[i].scrollIntoView({ block: 'nearest' }); }
    };
    // Some voices (e.g. Chrome's Google voices) never send word boundaries, so
    // fall back to estimating each word's length from its letters.
    const step = i => {
      if (gotBoundary || i >= toks.length) return;
      mark(i);
      timer = setTimeout(() => step(i + 1), (220 + 65 * toks[i].len) / rate);
    };
    return say(text, rate, pitch || 1, {
      onstart: () => { mark(0); timer = setTimeout(() => step(1), (500 + 65 * (toks[0] ? toks[0].len : 0)) / rate); },
      onboundary: e => {
        if (e.name && e.name !== 'word') return;
        gotBoundary = true;
        clearTimeout(timer);
        let i = 0;
        while (i + 1 < toks.length && toks[i + 1].i <= e.charIndex) i++;
        mark(i);
      },
      onend: () => { clearTimeout(timer); if (my === hlToken) words.forEach(w => w.classList.remove('hl')); }
    });
  }

  // Speak several [target, text, voice] parts in order, highlighting each target.
  // target: element or CSS selector (null = no highlight); voice 'droid' = droid voice.
  // Stops early if something else starts talking.
  async function talk(parts) {
    const base = hlToken;
    for (let k = 0; k < parts.length; k++) {
      if (hlToken !== base + k) return;
      const [t, text, voice] = parts[k];
      const el = typeof t === 'string' ? document.querySelector(t) : t;
      await sayHL(el, text, voice === 'droid' ? 0.95 : 0.85, voice === 'droid' ? 1.6 : 1);
    }
  }
  // Single letters are spoken in capitals ("G") so the voice says the letter, not "uh".
  const speakable = text => text.replace(/(^|\s)([a-z])(?=[.,!?]?(\s|$))/g, (m, p, l) => p + l.toUpperCase());

  // Wrap each word so sayHL can highlight it.
  const readable = text => String(text).split(/(\s+)/).map(t => /^\s*$/.test(t) ? t : `<span class="w">${esc(t)}</span>`).join('');

  let actx;
  function beep(ok) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = ok ? [660, 990] : [180];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.11;
        o.type = ok ? 'triangle' : 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + 0.3);
      });
    } catch (e) { /* no audio */ }
  }

  // ---------------------------------------------------------------- decoder (sound chunks)
  const VOWELS = 'aeiou';
  const TEAMS = ['igh', 'ee', 'ea', 'ai', 'ay', 'oa', 'oo', 'oi', 'oy', 'aw', 'au', 'ow', 'ou', 'ew', 'ey', 'ie', 'ue'];
  const RCTL = ['ar', 'or', 'er', 'ir', 'ur'];
  const DIGS = ['tch', 'dge', 'sh', 'ch', 'th', 'wh', 'ck', 'ng', 'nk', 'ph', 'wr', 'kn', 'qu', 'll', 'ss', 'ff', 'zz'];
  const GRAPHS = [...TEAMS, ...RCTL, ...DIGS].sort((a, b) => b.length - a.length);

  function chunkSyl(s) {
    const out = [], w = s.toLowerCase();
    let i = 0;
    while (i < w.length) {
      const g = GRAPHS.find(g => w.startsWith(g, i)) || w[i];
      const kind = TEAMS.includes(g) ? 'team' : RCTL.includes(g) ? 'r' : DIGS.includes(g) ? 'dig'
        : VOWELS.includes(g) ? 'v' : /[a-z]/.test(g) ? 'c' : 'x';
      out.push({ g: s.substr(i, g.length), k: g, kind });
      i += g.length;
    }
    const n = out.length;
    if (n >= 3 && out[n - 1].k === 'e' && ['c', 'dig'].includes(out[n - 2].kind) && out[n - 3].kind === 'v') {
      out[n - 3].kind = 'long'; out[n - 3].k += '_e';
      out[n - 1].kind = 'silent';
    }
    return out;
  }
  function decode(item) {
    if (item.syl) return item.syl.split('-').map(chunkSyl);
    return String(item.w).split(' ').map(chunkSyl);
  }
  function decoderHTML(item) {
    return `<div class="decoder">${decode(item).map(syl =>
      `<span class="syl">${syl.map(ch =>
        `<button class="chunk k-${ch.kind}" data-act="hint" data-k="${esc(ch.k)}" data-kind="${ch.kind}">${esc(ch.g)}</button>`
      ).join('')}</span>`).join('')}</div>
      <p class="tip">Tap a chunk to hear a word with that sound. Then slide the sounds together.</p>`;
  }
  function hintFor(k, kind) {
    if (kind === 'silent') return say('Silent e. It makes the vowel say its name.');
    const h = C.hints[k];
    if (h) return say(h, 0.75);
  }

  // ---------------------------------------------------------------- the droid
  // He builds a protocol droid that can't read. It learns only the words he
  // teaches it, and it makes mistakes he has to catch (learning by teaching).
  const DROID_PARTS = [
    { id: 'frame',   at: 0,   name: 'Frame' },
    { id: 'eyes',    at: 10,  name: 'Photoreceptors' },
    { id: 'voice',   at: 25,  name: 'Vocabulator' },
    { id: 'arms',    at: 45,  name: 'Servo arms' },
    { id: 'legs',    at: 70,  name: 'Leg actuators' },
    { id: 'core',    at: 100, name: 'Memory core' },
    { id: 'plating', at: 140, name: 'Gold plating' },
    { id: 'antenna', at: 200, name: 'Comm antenna' }
  ];
  const taughtCount = () => Object.keys(S.taught).length;
  const droidHas = id => taughtCount() >= DROID_PARTS.find(p => p.id === id).at;
  const nextPart = () => DROID_PARTS.find(p => p.at > taughtCount());
  const droidName = () => S.droidName || 'your droid';
  const droidSay = text => say(text, 0.95, 1.6);

  // Unfinished protocol droid: silver/gunmetal frame, ONE blue chest plate,
  // missing covers (dashed ghosts + wire hints) until each part is earned.
  function droidSVG(cls) {
    const st = id => droidHas(id) ? 'on' : 'ghost';
    const wires = '<path class="wire w1" d="M0 0 q6 12 0 24 q-6 12 0 24"/><path class="wire w2" d="M6 0 q-6 12 0 24 q6 12 0 24"/>';
    return `<svg class="droid ${cls || ''} ${droidHas('plating') ? 'gold' : ''}" viewBox="0 0 200 320" role="img" aria-label="${esc(droidName())}">
      <defs>
        <linearGradient id="dmSil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f7"/><stop offset=".5" stop-color="#a9b4c2"/><stop offset="1" stop-color="#6b7686"/></linearGradient>
        <linearGradient id="dmGun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c8796"/><stop offset="1" stop-color="#3a4350"/></linearGradient>
        <linearGradient id="dmBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9cc6ff"/><stop offset=".45" stop-color="#3f8cff"/><stop offset="1" stop-color="#1b4fa8"/></linearGradient>
        <linearGradient id="dmGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e2b23a"/><stop offset="1" stop-color="#8a6212"/></linearGradient>
        <radialGradient id="dmEye"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffd54a"/><stop offset="1" stop-color="#c47a00"/></radialGradient>
      </defs>
      <g class="bob">
      <g class="${st('antenna')} antenna"><line x1="100" y1="8" x2="100" y2="24"/><circle class="tip" cx="100" cy="8" r="5"/></g>
      <g class="on frame"><path class="shell" d="M72 46 Q72 20 100 20 Q128 20 128 46 L128 70 Q128 86 100 86 Q72 86 72 70 Z"/><rect class="dark" x="92" y="86" width="16" height="10" rx="2"/><path class="seam" d="M74 44 H126"/></g>
      <g class="${st('eyes')} eyes"><ellipse cx="87" cy="52" rx="9" ry="7"/><ellipse cx="113" cy="52" rx="9" ry="7"/><circle class="glint" cx="84" cy="50" r="2"/><circle class="glint" cx="110" cy="50" r="2"/></g>
      <g class="${st('voice')} voice"><rect x="86" y="66" width="28" height="12" rx="4"/><line x1="92" y1="68" x2="92" y2="76"/><line x1="97" y1="68" x2="97" y2="76"/><line x1="103" y1="68" x2="103" y2="76"/><line x1="108" y1="68" x2="108" y2="76"/></g>
      <g class="on frame torso"><path class="dark" d="M62 98 H138 L132 186 H68 Z"/>
        <g transform="translate(76 140)">${wires}</g><g transform="translate(114 140)">${wires}</g>
        <path class="chest" d="M70 100 H130 L126 136 Q100 146 74 136 Z"/><path class="seam" d="M80 108 H120 M78 120 H122"/></g>
      <g class="${st('core')} core"><circle cx="100" cy="160" r="13"/><circle class="light" cx="100" cy="160" r="5"/></g>
      <g class="${st('arms')} limbs"><circle cx="50" cy="104" r="9"/><circle cx="150" cy="104" r="9"/><rect x="40" y="108" width="18" height="74" rx="8"/><rect x="142" y="108" width="18" height="74" rx="8"/><circle cx="49" cy="190" r="9"/><circle cx="151" cy="190" r="9"/></g>
      <g class="${st('legs')} limbs"><rect x="72" y="190" width="22" height="96" rx="8"/><rect x="106" y="190" width="22" height="96" rx="8"/><circle class="knee" cx="83" cy="236" r="6"/><circle class="knee" cx="117" cy="236" r="6"/><rect x="64" y="286" width="34" height="16" rx="6"/><rect x="102" y="286" width="34" height="16" rx="6"/></g>
      </g>
    </svg>`;
  }

  // The droid's wrong guess: a real word that looks similar, so he has to read closely to catch it.
  function droidMistake(w, level) {
    const pool = LEVELS.filter(l => l.kind === 'words' && l.id <= level.id).flatMap(l => l.words).map(x => x.w).filter(x => x !== w);
    const lc = w.toLowerCase();
    const magic = lc.endsWith('e') ? lc.slice(0, -1) : lc + 'e';
    if (pool.includes(magic) && Math.random() < 0.6) return magic;
    const close = pool.filter(x => x[0] === w[0] && Math.abs(x.length - w.length) <= 1);
    const sameEnd = pool.filter(x => x.slice(-2) === w.slice(-2));
    const pickFrom = close.length ? close : sameEnd.length ? sameEnd : pool;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  function teachWord(key) {
    const before = taughtCount();
    if (!S.taught[key]) S.taught[key] = today();
    const part = DROID_PARTS.find(p => p.at > before && p.at <= taughtCount());
    if (part) setTimeout(() => { toast(`🔧 New droid part installed: ${part.name}!`); beep(true); }, 900);
  }

  // Microphone check (Edge and Chrome). Lenient on purpose: kids' speech is hard for recognizers.
  const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
  function editDist(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function listenFor(target) {
    return new Promise(res => {
      if (!Recog) return res({ ok: false, heard: '', unsupported: true });
      const r = new Recog();
      r.lang = 'en-US';
      r.maxAlternatives = 5;
      r.interimResults = false;
      let done = false;
      const finish = v => { if (!done) { done = true; res(v); } };
      r.onresult = e => {
        const alts = Array.from(e.results[0]).map(a => a.transcript.trim());
        const t = norm(target);
        const ok = alts.some(a => {
          const n = norm(a);
          return n === t || n.includes(t) || (t.length >= 4 && editDist(n, t) <= 1);
        });
        finish({ ok, heard: alts[0] || '' });
      };
      r.onerror = e => finish({ ok: false, heard: '', error: e.error });
      r.onend = () => finish({ ok: false, heard: '' });
      try { r.start(); } catch (e) { finish({ ok: false, heard: '', error: 'start' }); }
    });
  }

  // ---------------------------------------------------------------- reporting
  let flushing = false;
  function report(ev) {
    if (!CFG.reportUrl) return;
    const q = load(QKEY, []);
    q.push(Object.assign({ token: CFG.token, student: S.name || 'student', ts: new Date().toISOString() }, ev));
    save(QKEY, q.slice(-300));
    flush();
  }
  async function flush() {
    if (flushing || !CFG.reportUrl) return;
    let q = load(QKEY, []);
    if (!q.length) return;
    flushing = true;
    try {
      while (q.length) {
        // text/plain + no-cors avoids the CORS preflight Apps Script can't answer.
        await fetch(CFG.reportUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(q[0]) });
        q.shift();
        save(QKEY, q);
      }
      S.lastSync = new Date().toISOString();
      persist();
    } catch (e) { /* offline: try again later */ }
    flushing = false;
    const el = document.getElementById('sync');
    if (el) el.textContent = syncText();
  }
  function syncText() {
    if (!CFG.reportUrl) return 'Reports: not set up';
    const n = load(QKEY, []).length;
    if (n) return `Reports: ${n} waiting to send`;
    return S.lastSync ? `Reports sent ${new Date(S.lastSync).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'Reports: ready';
  }
  window.addEventListener('online', flush);

  // ---------------------------------------------------------------- activities
  const PASS_MISSION = 0.66;
  const TEACH_ACT = { key: 'teach', name: 'Teach Your Droid', icon: '🤖', desc: 'Your droid tries to read. Catch its mistakes and reprogram it.' };
  function activitiesFor(level) {
    if (level.kind === 'sounds') return [
      { key: 'sound', name: 'Sound Check', icon: '👂', desc: 'Hear a part. Type the letter for its sound.' },
      { key: 'letter', name: 'Letter Match', icon: '🔤', desc: 'See a letter. Pick the part that starts with that sound.' },
      TEACH_ACT
    ];
    const acts = [
      { key: 'spot', name: 'Spot the Part', icon: '🔍', desc: 'Hear a word. Find it in the parts list.' },
      { key: 'type', name: 'Typing Bay', icon: '⌨️', desc: 'Hear a word. Type it, one sound at a time.' }
    ];
    const pickable = level.words.filter(w => level.pickMode === 'meaning' ? w.def : w.e);
    if (pickable.length >= 4) acts.push({ key: 'pick', name: 'Read and Pick', icon: '📖', desc: level.pickMode === 'meaning' ? 'Read a code. Pick what it means.' : 'Read a word on your own. Pick its picture.' });
    acts.push(TEACH_ACT);
    (level.missions || []).forEach((m, i) => acts.push({ key: 'mission' + i, name: 'Mission: ' + m.title, icon: '🚀', desc: 'Read the work order, then answer the questions.' }));
    return acts;
  }
  const passFor = key => key.startsWith('mission') ? PASS_MISSION : CFG.passScore;
  const bestKey = (level, key) => `L${level.id}:${key}`;
  const levelDone = level => activitiesFor(level).every(a => (S.best[bestKey(level, a.key)] || 0) >= passFor(a.key));

  function soundPools(level) {
    const own = level.sounds;
    const prev = LEVELS.filter(l => l.kind === 'sounds' && l.id < level.id).flatMap(l => l.sounds);
    return { own, all: own.concat(prev), prev };
  }
  function prevWordLevel(level) { return LEVELS.filter(l => l.kind === 'words' && l.id < level.id).slice(-1)[0]; }

  function spotChoices(w, pool) {
    const seen = new Set([w]), out = [];
    const idx = [...w].findIndex(ch => VOWELS.includes(ch));
    const swaps = idx < 0 ? [] : shuffle([...VOWELS].filter(v => v !== w[idx]).map(v => w.slice(0, idx) + v + w.slice(idx + 1)));
    const words = pool.map(p => p.w).filter(x => x !== w);
    const similar = shuffle(words.filter(x => x[0] === w[0] || x.slice(-1) === w.slice(-1) || x.length === w.length));
    for (const c of [...swaps.slice(0, 2), ...similar, ...shuffle(words), ...swaps.slice(2)]) {
      if (out.length >= 3) break;
      if (!seen.has(c)) { seen.add(c); out.push(c); }
    }
    return shuffle([w, ...out]);
  }

  let R = null; // the round in progress

  function startRound(level, key) {
    if (key === 'teach' && !S.droidName) return renderDroidName(level);
    const n = CFG.roundSize;
    let items = [];
    if (key === 'teach') {
      if (level.kind === 'sounds') {
        const p = soundPools(level);
        items = fill(p.own, n).map(s => {
          const right = Math.random() < 0.5;
          const other = pickN(p.all.filter(o => o.g !== s.g), 1)[0];
          return { s, right, guess: right ? s : other };
        });
      } else {
        const prev = prevWordLevel(level);
        items = shuffle(fill(level.words, n - (prev ? 2 : 0)).concat(prev ? fill(prev.words, 2) : [])).map(w => {
          const wrong = droidMistake(w.w, level);
          const right = !wrong || Math.random() < 0.5;
          return { w, right, guess: right ? (w.say || w.w) : wrong };
        });
      }
    } else if (key === 'sound' || key === 'letter') {
      const p = soundPools(level);
      const reviewN = p.prev.length ? Math.round(n * 0.3) : 0;
      items = shuffle(fill(p.own, n - reviewN).concat(fill(p.prev, reviewN))).map(s => {
        if (key === 'sound') return { s };
        const others = pickN(p.all.filter(o => o.g !== s.g), 2);
        return { s, options: shuffle([s, ...others]) };
      });
    } else if (key === 'spot' || key === 'type') {
      const prev = prevWordLevel(level);
      const reviewN = prev ? 2 : 0;
      items = shuffle(fill(level.words, n - reviewN).concat(prev ? fill(prev.words, reviewN) : []));
      if (key === 'spot') items = items.map(w => ({ w, options: spotChoices(w.w, level.words) }));
      else items = items.map(w => ({ w }));
    } else if (key === 'pick') {
      const meaning = level.pickMode === 'meaning';
      const pool = level.words.filter(w => meaning ? w.def : w.e);
      items = fill(pool, n).map(w => ({ w, options: shuffle([w, ...pickN(pool.filter(o => o !== w), 3)]), meaning }));
    } else if (key.startsWith('mission')) {
      const m = level.missions[+key.slice(7)];
      items = m.text.map(t => ({ sentence: t, mission: m })).concat(m.q.map(q => ({ question: q, mission: m })));
    }
    R = {
      level, key, items, i: 0, correct: 0, scored: 0, missed: [], radio: 0, decoder: 0,
      soloNew: 0, t0: Date.now(), state: 'ask', usedRadio: false, typed: '',
      spoken: 0, msg: '', listening: false, fb: null, fbNew: false, prompted: false
    };
    renderItem();
  }

  function itemWordKey(it) { return it.w ? it.w.w : it.s ? it.s.g : null; }

  function grade(ok, unaided) {
    const it = R.items[R.i];
    R.scored++;
    const wk = itemWordKey(it);
    if (wk) {
      const st = S.words[wk] || (S.words[wk] = { seen: 0, ok: 0 });
      st.seen++;
      if (ok) st.ok++;
    }
    if (ok) {
      R.correct++;
      S.xp += 10 + (unaided ? 5 : 0);
      if (unaided && wk && R.key === 'pick') markSolo([wk]);
      if (unaided && R.key === 'pick') addBattery(2);
    } else if (wk || it.question) {
      R.missed.push(wk || it.question.q);
    }
    beep(ok);
    persist();
  }
  function markSolo(words) {
    words.forEach(w => { w = w.toLowerCase(); if (w && !S.solo[w]) { S.solo[w] = today(); R.soloNew++; } });
  }

  function spendRadio(cost) {
    if (S.battery < cost) {
      toast('📻 Radio battery is too low! Use the Decoder: tap the word and sound out each chunk.');
      say('Radio battery is low. Sound it out with the decoder.');
      return false;
    }
    S.battery -= cost;
    R.radio++;
    R.usedRadio = true;
    S.radioUses++;
    persist();
    const g = document.getElementById('gauge');
    if (g) g.outerHTML = gaugeHTML();
    return true;
  }

  function next() {
    R.i++;
    R.state = 'ask';
    R.usedRadio = false;
    R.typed = '';
    R.msg = '';
    R.fb = null;
    R.fbNew = false;
    R.prompted = false;
    if (R.i >= R.items.length) return finishRound();
    renderItem();
  }

  function finishRound() {
    const total = R.scored || 1;
    const pct = R.correct / total;
    const bk = bestKey(R.level, R.key);
    S.best[bk] = Math.max(S.best[bk] || 0, pct);
    const secs = Math.round((Date.now() - R.t0) / 1000);
    S.minutes += secs / 60;
    const act = activitiesFor(R.level).find(a => a.key === R.key);
    const entry = { d: new Date().toISOString(), level: R.level.id, act: act.name, correct: R.correct, total, radio: R.radio, secs };
    S.history.push(entry);
    S.history = S.history.slice(-200);
    report({
      event: 'activity', level: R.level.id, levelName: R.level.name, activity: act.name,
      correct: R.correct, total, pct: Math.round(pct * 100), radioUsed: R.radio, decoderUsed: R.decoder,
      seconds: secs, missed: R.missed.join(', '), soloWords: Object.keys(S.solo).length, xp: S.xp, battery: S.battery,
      droidWords: taughtCount(), readAloud: R.spoken
    });
    let newCert = null;
    if (!S.done[R.level.id] && levelDone(R.level)) {
      S.done[R.level.id] = today();
      S.unlocked = Math.max(S.unlocked, R.level.id + 1);
      S.xp += 100;
      newCert = R.level;
      report({ event: 'level_complete', level: R.level.id, levelName: R.level.name, activity: R.level.cert, soloWords: Object.keys(S.solo).length, xp: S.xp });
    }
    persist();
    renderResults(pct, act, newCert);
  }

  // ---------------------------------------------------------------- rendering: shared
  function gaugeHTML() {
    const max = maxBattery(), pct = Math.round(S.battery / max * 100);
    const cls = pct > 50 ? 'hi' : pct > 20 ? 'mid' : 'lo';
    return `<div id="gauge" class="gauge ${cls}" title="Radio battery: read-aloud help">
      <span class="g-icon">📻</span><span class="g-bar"><span style="width:${pct}%"></span></span><span class="g-num">${S.battery}%</span></div>`;
  }
  function topbar(back, title) {
    return `<header class="top">
      ${back ? `<button class="btn ghost" data-act="${back}">◀ Back</button>` : `<div class="brand">${emo('🛠️', 'sm')} Workshop Reader</div>`}
      <div class="top-title">${esc(title || '')}</div>
      ${gaugeHTML()}
    </header>`;
  }
  // target: CSS selector of the text to highlight while speaking ('self' = the button itself)
  function speakBtn(text, label, target) { return `<button class="btn speak" data-act="say" data-text="${esc(text)}"${target ? ` data-target="${esc(target)}"` : ''}>🔊 ${label || ''}</button>`; }

  let toastTimer;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 4000);
  }

  // ---------------------------------------------------------------- screens
  let view = 'home', curLevel = null;

  function renderHome() {
    view = 'home';
    R = null;
    const soloCount = Object.keys(S.solo).length;
    const projects = Object.entries(C.projects).map(([k, p]) => {
      const parts = LEVELS.filter(l => l.project === k);
      const got = parts.filter(l => S.done[l.id]).length;
      return `<div class="proj">
        <div class="proj-head">${emo(p.e, 'md')}<div><b>${esc(p.name)}</b><small>${got} of ${parts.length} parts</small></div></div>
        <div class="parts">${parts.map(l => `<div class="part ${S.done[l.id] ? 'have' : ''}" title="${esc(l.part.name)}: ${esc(l.part.note)}">${emo(l.part.e, 'sm')}<span>${esc(l.part.name)}</span></div>`).join('')}</div>
      </div>`;
    }).join('');
    const levels = LEVELS.map(l => {
      const open = l.id <= S.unlocked, done = !!S.done[l.id];
      const acts = activitiesFor(l);
      const passed = acts.filter(a => (S.best[bestKey(l, a.key)] || 0) >= passFor(a.key)).length;
      return `<button class="lvl ${done ? 'done' : open ? 'open' : 'locked'}" ${open ? `data-act="level" data-id="${l.id}"` : 'disabled'}>
        <span class="lvl-num">${done ? '✅' : open ? l.id : '🔒'}</span>
        <span class="lvl-body"><b>${esc(l.name)}</b><small>${done ? 'Certified: ' + esc(l.cert) : open ? `${passed} of ${acts.length} done` : 'Locked'}</small></span>
        <span class="lvl-proj">${emo(C.projects[l.project].e, 'sm')}</span>
      </button>`;
    }).join('');
    $app.innerHTML = `${topbar(null, '')}
      <main class="home">
        <section class="hello">
          <h1>Engineer ${esc(S.name)}</h1>
          <div class="stats">
            <div class="stat"><b>${soloCount}</b><span>words I read on my own</span></div>
            <div class="stat"><b>${S.xp}</b><span>XP</span></div>
            <div class="stat"><b>${Object.keys(S.done).length}/${LEVELS.length}</b><span>certifications</span></div>
          </div>
        </section>
        ${droidPanelHTML()}
        <h2>Projects</h2>
        <section class="projects">${projects}</section>
        <h2>Certifications</h2>
        <section class="levels">${levels}</section>
        <footer class="foot">
          <span id="sync">${esc(syncText())}</span>
          <button class="btn ghost small" data-act="teacher">Teacher panel</button>
        </footer>
      </main>`;
  }

  function droidPanelHTML() {
    const n = taughtCount(), np = nextPart();
    const prevAt = [...DROID_PARTS].reverse().find(p => p.at <= n).at;
    const pct = np ? Math.round((n - prevAt) / (np.at - prevAt) * 100) : 100;
    return `<section class="droid-panel">
      <button class="droid-btn" data-act="droid-talk" title="Talk to your droid">${droidSVG('md')}</button>
      <div class="droid-info">
        <h2>${S.droidName ? esc(S.droidName) : 'Your protocol droid'} <small>protocol droid</small></h2>
        <p><b>${n}</b> words and letters in memory banks</p>
        ${np ? `<div class="meter"><span style="width:${pct}%"></span></div>
          <p class="tip">Next part: <b>${esc(np.name)}</b> at ${np.at} words</p>` : '<p class="tip">Fully operational!</p>'}
        <div class="dparts">${DROID_PARTS.map(p => `<span class="${n >= p.at ? 'have' : ''}">${esc(p.name)}</span>`).join('')}</div>
        <button class="btn primary" data-act="droid-teach">🤖 Teach ${S.droidName ? esc(S.droidName) : 'your droid'}</button>
      </div>
    </section>`;
  }

  function renderLevel(level) {
    view = 'level';
    curLevel = level;
    R = null;
    const acts = activitiesFor(level);
    let tiles = '';
    if (level.kind === 'sounds') {
      tiles = `<div class="tiles">${level.sounds.map(s =>
        `<button class="tile" data-act="say" data-text="${esc(s.key)}" data-target="self">${emo(s.e, 'md')}<b>${esc(s.g)}</b><small>${esc(s.key)}</small></button>`).join('')}</div>
        <p class="tip">Tap a part to hear its name. Say the first sound out loud.</p>`;
    } else {
      const ex = level.words.slice(0, 6);
      tiles = `<div class="examples">${ex.map((w, i) => `<button class="ex" data-act="exdecode" data-i="${i}">${esc(w.w)}</button>`).join('')}</div>
        <div id="exbox"></div>`;
    }
    const tricky = level.tricky ? `<div class="tricky"><h3>❤️ Heart words <small>learn these by heart, they break the rules</small></h3>
      <div class="hw">${level.tricky.map(t => `<button class="hwb" data-act="say" data-text="${esc(t)}" data-target="self">${esc(t)}</button>`).join('')}</div></div>` : '';
    $app.innerHTML = `${topbar('home', 'Level ' + level.id)}
      <main class="level">
        <h1>${esc(level.name)}</h1>
        <div class="pattern"><p id="pattern-text">${readable(level.pattern)}</p>${speakBtn(level.pattern, 'Read this to me (free)', '#pattern-text')}</div>
        ${tiles}
        ${tricky}
        <h2>Jobs</h2>
        <div class="acts">${acts.map(a => {
          const b = S.best[bestKey(level, a.key)];
          const ok = (b || 0) >= passFor(a.key);
          return `<button class="act ${ok ? 'ok' : ''}" data-act="start" data-key="${a.key}">
            <span class="act-icon">${emo(a.icon, 'md')}</span>
            <span class="act-body"><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span>
            <span class="act-score">${b == null ? 'New' : (ok ? '✅ ' : '') + Math.round(b * 100) + '%'}</span>
          </button>`;
        }).join('')}</div>
        <div class="reward">Finish every job to earn <b>${esc(level.cert)}</b> and a new part: ${emo(level.part.e, 'sm')} <b>${esc(level.part.name)}</b></div>
      </main>`;
  }

  function progressHTML() {
    return `<div class="prog">${R.items.map((_, i) => `<span class="${i < R.i ? 'p-done' : i === R.i ? 'p-now' : ''}"></span>`).join('')}</div>`;
  }
  function frame(inner) {
    const act = activitiesFor(R.level).find(a => a.key === R.key);
    $app.innerHTML = `${topbar('level', act.name)}<main class="play">${progressHTML()}${inner}</main>`;
    const inp = document.getElementById('answer');
    if (inp) inp.focus();
  }

  function renderItem() {
    const it = R.items[R.i];
    if (R.key === 'sound') renderSound(it);
    else if (R.key === 'letter') renderLetter(it);
    else if (R.key === 'spot') renderSpot(it);
    else if (R.key === 'type') renderType(it);
    else if (R.key === 'pick') renderPick(it);
    else if (R.key === 'teach') renderTeach(it);
    else if (it.sentence) renderSentence(it);
    else renderQuestion(it);
    // Speak new feedback once (highlighted), or the prompt the first time an item appears.
    if (R.fb && R.fbNew) {
      R.fbNew = false;
      talk([['#fb-text', speakable(R.fb.text), R.fb.voice]]);
    } else if (R.state === 'ask' && !R.prompted) {
      R.prompted = true;
      talk(promptParts(it));
    }
  }

  // What gets read aloud when an item first appears (and on "Hear it again").
  function promptParts(it) {
    if (R.key === 'sound') return [['#pic-main', it.s.key], ['#ask-text', askSound(it.s)]];
    if (R.key === 'letter') return [['#ask-text', 'Which part starts with this sound?']];
    if (R.key === 'spot' || R.key === 'type') return [[null, it.w.say || it.w.w]];
    if (R.key === 'teach') {
      if (it.s) return [['#claim-pic', it.guess.key, 'droid'], ['#bubble-text', speakable(teachBubble(it)), 'droid']];
      return [['.big-word', `This word is... ${sayOf(it.guess)}.`, 'droid']];
    }
    return [];
  }

  // Feedback: set it, then renderItem() shows it and reads it aloud with highlighting.
  // pics: [[soundOrWord, isCorrect], ...] shown under the message.
  function setFb(kind, text, opts) {
    R.fb = Object.assign({ kind, text }, opts || {});
    R.fbNew = true;
  }
  function fbHTML(withNext) {
    const f = R.fb;
    if (!f) return '';
    const icon = f.kind === 'wrong' ? '❌' : '✅';
    const pics = f.pics ? `<div class="fb-pics">${f.pics.map(([s, ok]) =>
      `<span class="fb-pic ${ok ? 'ok' : 'no'}">${emo(s.e, 'md')}<small>${ok ? '✅' : '❌'} ${esc(s.key || s.w)}</small></span>`).join('')}</div>` : '';
    return `<div class="fb ${f.kind}">
      <p class="fb-line"><span class="fb-icon">${icon}</span> <span id="fb-text">${readable(f.text)}</span></p>
      ${pics}${f.extra || ''}${f.tip ? `<p class="tip">${esc(f.tip)}</p>` : ''}
      ${withNext === false ? '' : '<button class="btn primary" data-act="next" id="nextbtn">Next ▶</button>'}
    </div>`;
  }
  const rel = s => s.pos === 'end' ? 'ends with' : 'starts with';
  const askSound = s => `What letter makes the ${s.pos === 'end' ? 'last' : 'first'} sound in this part?`;
  const replayBtn = label => `<button class="btn speak" data-act="replay">🔊 ${label || 'Hear it again'}</button>`;

  // Sound Check: hear keyword, type the letter
  function renderSound(it) {
    const s = it.s;
    frame(`<div class="card center">
      <span id="pic-main" class="pic-main">${emo(s.e, 'xl')}</span>
      <p class="ask" id="ask-text">${readable(askSound(s))}</p>
      ${replayBtn()}
      ${R.state === 'copy' ? fbHTML(false) : ''}
      ${R.state === 'right' ? fbHTML() : `<form data-act="submit" class="typeform"><input id="answer" class="answer short" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="3"><button class="btn primary">Check</button></form>`}
    </div>`);
  }
  function checkSound(val) {
    const s = R.items[R.i].s;
    const ok = [s.g, ...(s.alt || [])].includes(val.trim().toLowerCase());
    if (R.state === 'copy') {
      if (val.trim().toLowerCase() === s.g) { beep(true); next(); } else { beep(false); renderItem(); }
      return;
    }
    grade(ok, true);
    if (ok) {
      R.state = 'right';
      setFb('right', `Yes! ${s.key} ${rel(s)} ${s.g}.`);
    } else {
      R.state = 'copy';
      setFb('wrong', `${s.key} ${rel(s)} ${s.g}. Type ${s.g} to keep going.`, { extra: `<div class="big-letter huge">${esc(s.g)}</div>` });
    }
    renderItem();
  }

  // Letter Match: see the letter, pick the picture
  function renderLetter(it) {
    frame(`<div class="card center">
      <div class="big-letter huge">${esc(it.s.g)}</div>
      <p class="ask" id="ask-text">${readable('Which part starts with this sound?')}</p>
      <div class="choices pics">${it.options.map((o, i) => `
        <div class="pic-wrap">
          <button class="choice pic ${R.state !== 'ask' && o === it.s ? 'is-right' : ''} ${R.state === 'wrong' && o === R.picked ? 'is-wrong' : ''}" data-act="choose" data-i="${i}" ${R.state !== 'ask' ? 'disabled' : ''}>
            <span class="kbd">${i + 1}</span>${emo(o.e, 'lg')}${R.state !== 'ask' ? `<small>${esc(o.key)}</small>` : ''}</button>
          <button class="btn mini" data-act="say" data-text="${esc(o.key)}" data-target='.choice[data-i="${i}"]' title="Hear its name">🔊</button>
        </div>`).join('')}</div>
      ${R.state === 'ask' ? '<p class="tip">Not sure what a picture is? Tap 🔊 to hear its name.</p>' : fbHTML()}
    </div>`);
  }

  // Spot the Part: hear a word, pick its spelling
  function renderSpot(it) {
    const w = it.w;
    frame(`<div class="card center">
      <p class="ask">Listen. Which one did you hear?</p>
      ${replayBtn()}
      <div class="choices words">${it.options.map((o, i) => `
        <button class="choice word ${R.state !== 'ask' && o === w.w ? 'is-right' : ''} ${R.state === 'wrong' && o === R.picked ? 'is-wrong' : ''}" data-act="choose" data-i="${i}" ${R.state !== 'ask' ? 'disabled' : ''}><span class="kbd">${i + 1}</span>${esc(o)}</button>`).join('')}</div>
      ${R.state === 'ask' ? '' : fbHTML()}
    </div>`);
  }

  // Typing Bay: hear a word, type it
  function renderType(it) {
    const w = it.w;
    const copy = R.state === 'copy';
    const len = w.w.replace(/\s/g, '').length;
    frame(`<div class="card center">
      <p class="ask">Type the word you hear. Say each sound as you type it.</p>
      ${replayBtn()}
      <div class="blanks">${Array.from({ length: len }, () => '<span></span>').join('')}</div>
      ${copy ? fbHTML(false) : ''}
      ${R.state === 'right' ? fbHTML() : `<form data-act="submit" class="typeform"><input id="answer" class="answer" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(R.typed)}"><button class="btn primary">Check</button></form>`}
    </div>`);
    updateBlanks();
  }
  function updateBlanks() {
    const inp = document.getElementById('answer'), bl = document.querySelectorAll('.blanks span');
    if (!inp || !bl.length) return;
    const v = inp.value.replace(/\s/g, '');
    bl.forEach((b, i) => { b.textContent = v[i] || ''; b.className = v[i] ? 'filled' : ''; });
  }
  function checkType(val) {
    const w = R.items[R.i].w;
    const ok = norm(val) === norm(w.w);
    if (R.state === 'copy') {
      if (ok) { beep(true); next(); } else { beep(false); R.typed = ''; renderItem(); }
      return;
    }
    grade(ok, true);
    if (ok) { R.state = 'right'; setFb('right', `Yes! ${w.w}.`); }
    else { R.state = 'copy'; R.typed = ''; setFb('wrong', `This is how ${w.w} is spelled. Type it just like this.`, { extra: decoderHTML(w) }); }
    renderItem();
  }

  // Read & Pick: read on your own, pick the picture (or meaning)
  function renderPick(it) {
    const w = it.w;
    frame(`<div class="card center">
      <p class="ask">Read it yourself. Then pick ${it.meaning ? 'what it means' : 'the picture'}.</p>
      <div class="big-word">${esc(w.w)}</div>
      <div class="helpers">
        <button class="btn" data-act="decode">🧩 Decoder (free)</button>
        <button class="btn radio" data-act="radio" data-cost="${CFG.radio.wordCost}">📻 Radio HQ (−${CFG.radio.wordCost}%)</button>
      </div>
      <div id="decbox"></div>
      <div class="choices ${it.meaning ? 'defs' : 'pics'}">${it.options.map((o, i) => `
        <button class="choice ${it.meaning ? 'def' : 'pic'} ${R.state !== 'ask' && o === w ? 'is-right' : ''} ${R.state === 'wrong' && o === R.picked ? 'is-wrong' : ''}" data-act="choose" data-i="${i}" ${R.state !== 'ask' ? 'disabled' : ''}>
          <span class="kbd">${i + 1}</span>${it.meaning ? esc(o.def) : emo(o.e, 'lg')}</button>`).join('')}</div>
      ${R.state === 'ask' ? '' : fbHTML()}
    </div>`);
  }

  // Teach Your Droid: the droid reads, he judges, and he reprograms it when it's wrong
  const sayOf = x => { for (const l of LEVELS) for (const w of (l.words || [])) if (w.w === x) return w.say || w.w; return x; };
  const teachBubble = it => it.s
    ? `${droidName()} says this part ${rel(it.s)} the letter ${it.s.g}.`
    : `${droidName()} read this word out loud.`;

  function renderTeach(it) {
    const name = esc(droidName());
    let below = '';
    // Letter levels: the droid holds up a part and claims it starts with the letter.
    // Word levels: the droid reads the word aloud (what it says is hidden on purpose).
    const shownHTML = it.s
      ? `<div class="claim">
          <div class="claim-part" id="claim-pic">${emo(it.guess.e, 'lg')}</div>
          <div class="claim-says">${rel(it.s)}</div>
          <div class="big-letter huge">${esc(it.s.g)}</div>
        </div>`
      : `<div class="big-word">${esc(it.w.w)}</div>`;
    const bubble = `<span id="bubble-text">${readable(teachBubble(it))}</span>`;
    if (R.state === 'ask') {
      below = `<p class="ask">${it.s ? `Say the part's name. Does it start with the <b>${esc(it.s.g)}</b> sound?` : `Read the word yourself. Did ${name} say it right?`}</p>
        <div class="choices judge">
          <button class="choice judge-yes" data-act="choose" data-i="0"><span class="kbd">1</span>✅ Right</button>
          <button class="choice judge-no" data-act="choose" data-i="1"><span class="kbd">2</span>❌ Wrong</button>
        </div>`;
    } else if (R.state === 'fix') {
      below = `${fbHTML(false)}
        <p class="ask">Read the word to ${name} so it can learn it.</p>
        ${Recog ? `<button class="btn primary big-btn" data-act="listen" ${R.listening ? 'disabled' : ''}>${R.listening ? '🎙️ Listening…' : '🎤 Read it out loud'}</button>` : ''}
        ${R.msg ? `<p class="tip">${esc(R.msg)}</p>` : ''}
        <form data-act="submit" class="typeform"><input id="answer" class="answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${Recog ? 'or type it' : 'type it'}"><button class="btn">Upload</button></form>`;
    } else {
      below = fbHTML();
    }
    frame(`<div class="card center teach">
      <div class="droid-row">
        ${droidSVG('sm talking')}
        <div class="bubble">${bubble}
          <button class="btn mini" data-act="replay">🔊 Hear ${name} again</button></div>
      </div>
      ${shownHTML}
      ${below}
    </div>`);
  }

  // Everything the droid says after he judges is printed and highlighted as it talks.
  function judge(saidRight) {
    const it = R.items[R.i];
    const ok = saidRight === it.right;
    grade(ok, true);
    R.state = ok ? 'right' : 'wrong';
    const droid = { voice: 'droid' };
    if (it.s) {
      const s = it.s, g = it.guess, neg = s.pos === 'end' ? 'does not end with' : 'does not start with';
      if (ok) teachWord(s.g);
      if (ok && it.right) setFb('right', `Thank you, Maker! ${s.key} ${rel(s)} ${s.g}. Saved to memory.`, { ...droid, pics: [[s, true]] });
      else if (ok) setFb('right', `Good catch! ${g.key} ${neg} ${s.g}. ${s.key} does. Saved to memory.`, { ...droid, pics: [[g, false], [s, true]] });
      else if (it.right) setFb('wrong', `Are you sure, Maker? ${s.key} really ${rel(s)} ${s.g}. Say it slowly.`, { ...droid, pics: [[s, true]] });
      else setFb('wrong', `Oh dear. I said ${g.key}, but ${g.key} ${neg} ${s.g}. ${s.key} does.`, { ...droid, pics: [[g, false], [s, true]] });
    } else {
      const w = it.w;
      if (ok && it.right) { teachWord(w.w); setFb('right', `Thank you, Maker! ${w.w}. Saved to memory.`, droid); }
      else if (ok) { R.state = 'fix'; setFb('right', 'Good catch! I made an error. Please reprogram me, Maker.', droid); }
      else if (it.right) setFb('wrong', `Are you sure, Maker? I said ${w.w}, and that was right.`, { ...droid, extra: decoderHTML(w) });
      else setFb('wrong', `Oh dear. I said ${it.guess}, but this word is ${w.w}. You missed my mistake.`, { ...droid, extra: decoderHTML(w) });
    }
    renderItem();
  }

  function fixDone(spoken) {
    const it = R.items[R.i];
    teachWord(it.w.w);
    if (spoken) { R.spoken++; S.spoken = (S.spoken || 0) + 1; S.xp += 5; }
    R.state = 'right';
    setFb('right', `${it.w.w}. Memory corrected. Thank you, Maker!`, { voice: 'droid', tip: spoken ? '🎤 It heard you! +5 XP for reading out loud.' : '' });
    persist();
    beep(true);
    renderItem();
  }

  async function listenFix() {
    const it = R.items[R.i];
    R.listening = true; R.msg = '';
    renderItem();
    const r = await listenFor(it.w.w);
    R.listening = false;
    if (r.ok) return fixDone(true);
    R.msg = r.error === 'not-allowed' ? 'The microphone is blocked. You can type the word instead.'
      : r.heard ? `${droidName()} heard "${r.heard}". Sound it out and try again, or type it.`
      : `${droidName()} didn't hear anything. Try again, or type it.`;
    renderItem();
  }

  function renderDroidName(level) {
    curLevel = level;
    $app.innerHTML = `${topbar('level', 'Droid Lab')}<main><div class="card center">
      ${droidSVG('lg')}
      <div id="droid-intro">
        <h1>${readable('Your protocol droid is ready')}</h1>
        <p class="ask">${readable("It can talk, but it can't read yet. You will teach it. Every word you teach it unlocks a new part.")}</p>
        <p class="ask">${readable('Type a name for your droid.')}</p>
      </div>
      ${speakBtn("Your protocol droid is ready. It can talk, but it can't read yet. You will teach it. Every word you teach it unlocks a new part. Type a name for your droid.", 'Read this to me', '#droid-intro')}
      <form data-act="droidname" class="typeform"><input id="answer" class="answer" autocomplete="off" maxlength="16"><button class="btn primary">Power on</button></form>
    </div></main>`;
    document.getElementById('answer').focus();
  }

  // Mission: read sentences, then answer questions
  function tokenize(sentence, mission) {
    const prev = (mission.preview || []).map(p => p.toLowerCase());
    return sentence.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const core = tok.replace(/^[^\w]+|[^\w]+$/g, '');
      if (!core) return `<span class="w">${esc(tok)}</span>`;
      const lc = core.toLowerCase();
      const isPrev = prev.includes(lc) || prev.includes(lc.replace(/s$/, '')) || prev.includes(lc.replace(/es$/, ''));
      const pre = tok.slice(0, tok.indexOf(core)), post = tok.slice(tok.indexOf(core) + core.length);
      return `${esc(pre)}<button class="tok w ${isPrev ? 'preview' : ''}" data-act="tok" data-w="${esc(core)}" data-p="${isPrev ? 1 : 0}">${esc(core)}</button>${esc(post)}`;
    }).join('');
  }
  function renderSentence(it) {
    const m = it.mission;
    const sIdx = m.text.indexOf(it.sentence);
    const earlier = m.text.slice(0, sIdx).map(t => `<p class="past">${esc(t)}</p>`).join('');
    frame(`<div class="card mission">
      <h2>${emo('🚀', 'sm')} ${esc(m.title)} <small>line ${sIdx + 1} of ${m.text.length}</small></h2>
      <div class="story">${earlier}<p class="now">${tokenize(it.sentence, m)}</p></div>
      <p class="tip">Stuck on a word? Tap it for the Decoder. <span class="preview-key">Dotted words</span> are new: you can hear those for free.</p>
      <div id="decbox"></div>
      <div class="helpers">
        <button class="btn radio" data-act="radio-sentence" data-cost="${CFG.radio.sentenceCost}">📻 Read the whole line (−${CFG.radio.sentenceCost}%)</button>
        <button class="btn primary" data-act="next-sentence" id="nextbtn">I read it ▶</button>
      </div>
    </div>`);
  }
  function renderQuestion(it) {
    const q = it.question;
    frame(`<div class="card mission">
      <h2>${emo('❓', 'sm')} Check your work</h2>
      <p class="ask big" id="q-text">${readable(q.q)}</p>
      <div class="helpers"><button class="btn radio" data-act="radio-q" data-cost="${CFG.radio.questionCost}">📻 Read the question (−${CFG.radio.questionCost}%)</button></div>
      <div class="choices defs">${q.choices.map((c, i) => `
        <button class="choice def ${R.state !== 'ask' && i === q.a ? 'is-right' : ''} ${R.state === 'wrong' && i === R.picked ? 'is-wrong' : ''}" data-act="choose" data-i="${i}" ${R.state !== 'ask' ? 'disabled' : ''}><span class="kbd">${i + 1}</span><span class="ctext">${readable(c)}</span></button>`).join('')}</div>
      ${R.state === 'ask' ? '' : fbHTML()}
    </div>`);
  }

  function choose(i) {
    if (!R || R.state !== 'ask') return;
    if (R.key === 'teach') return judge(i === 0);
    const it = R.items[R.i];
    let ok;
    if (R.key === 'letter') { R.picked = it.options[i]; ok = R.picked === it.s; }
    else if (R.key === 'spot') { R.picked = it.options[i]; ok = R.picked === it.w.w; }
    else if (R.key === 'pick') { R.picked = it.options[i]; ok = R.picked === it.w; }
    else { R.picked = i; ok = i === it.question.a; }
    if (R.picked === undefined) return;
    grade(ok, !R.usedRadio);
    R.state = ok ? 'right' : 'wrong';
    if (R.key === 'letter') {
      const s = it.s;
      if (ok) setFb('right', `Yes! ${s.key} ${rel(s)} ${s.g}.`, { pics: [[s, true]] });
      else setFb('wrong', `Not that one. That is ${R.picked.key}. ${s.key} ${rel(s)} ${s.g}.`, { pics: [[R.picked, false], [s, true]] });
    } else if (R.key === 'spot') {
      setFb(ok ? 'right' : 'wrong', ok ? `Yes! ${it.w.w}.` : `The word was ${it.w.w}.`, { extra: ok ? '' : decoderHTML(it.w) });
    } else if (R.key === 'pick') {
      const w = it.w;
      if (ok) setFb('right', R.usedRadio ? `Yes! ${w.w}.` : `Yes! You read ${w.w} all by yourself!`, { tip: R.usedRadio ? '' : '+5 XP and +2% radio battery' });
      else setFb('wrong', it.meaning ? `Not quite. ${w.w} means ${w.def}.` : `Not quite. This is ${w.w}.`, { pics: it.meaning ? null : [[w, true]], extra: decoderHTML(w) });
    } else {
      setFb(ok ? 'right' : 'wrong', ok ? 'Yes!' : 'Not quite. Look back at the story.');
    }
    renderItem();
  }

  function renderResults(pct, act, cert) {
    view = 'results';
    const passed = pct >= passFor(R.key);
    const msg = passed ? 'Job complete!' : 'Almost there. Run it again, you\'ve got this.';
    $app.innerHTML = `${topbar('level', act.name)}
      <main class="results">
        <div class="card center">
          ${emo(passed ? '🏆' : '🔧', 'xl')}
          <h1>${msg}</h1>
          <p class="score">${R.correct} of ${R.scored} correct (${Math.round(pct * 100)}%)</p>
          <div class="stats">
            <div class="stat"><b>${R.radio}</b><span>radio calls</span></div>
            ${R.key === 'teach' ? `<div class="stat"><b>${taughtCount()}</b><span>words in ${esc(droidName())}'s memory</span></div>`
              : `<div class="stat"><b>+${R.soloNew}</b><span>new words read on my own</span></div>`}
            <div class="stat"><b>${S.xp}</b><span>XP</span></div>
          </div>
          ${R.missed.length ? `<p class="missed">Practice these: ${R.missed.slice(0, 8).map(esc).join(', ')}</p>` : ''}
          <div class="helpers">
            <button class="btn" data-act="start" data-key="${R.key}">↻ Run it again</button>
            <button class="btn primary" data-act="level">Back to jobs ▶</button>
          </div>
        </div>
      </main>`;
    say(msg);
    if (cert) celebrate(cert);
  }

  function celebrate(level) {
    const p = C.projects[level.project];
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="card center celebrate">
      ${emo('🎖️', 'xl')}
      <h1>Certified: ${esc(level.cert)}</h1>
      <p>New part for your ${esc(p.name)}:</p>
      <div class="newpart">${emo(level.part.e, 'xl')}<b>${esc(level.part.name)}</b><small>${esc(level.part.note)}</small></div>
      ${levelById(level.id + 1) ? `<p>Level ${level.id + 1} is unlocked: <b>${esc(levelById(level.id + 1).name)}</b></p>` : '<p>You finished every level. You are an FTC Engineer!</p>'}
      <button class="btn primary" data-act="close-overlay">Awesome ▶</button>
    </div>`;
    document.body.appendChild(ov);
    say(`Certification earned! ${level.cert}. New part: ${level.part.name}.`);
  }

  // ---------------------------------------------------------------- name + teacher
  function renderName() {
    view = 'name';
    $app.innerHTML = `<main class="welcome"><div class="card center">
      ${emo('🛠️', 'xl')}
      <div id="welcome-text">
        <h1>${readable('Welcome to the Workshop')}</h1>
        <p class="ask">${readable('Every engineer signs in. Type your first name.')}</p>
      </div>
      ${speakBtn('Welcome to the workshop. Every engineer signs in. Type your first name.', 'Read this to me', '#welcome-text')}
      <form data-act="setname" class="typeform"><input id="answer" class="answer" autocomplete="off" maxlength="20"><button class="btn primary">Sign in</button></form>
    </div></main>`;
    document.getElementById('answer').focus();
  }

  let teacherOK = false;
  function renderTeacher() {
    view = 'teacher';
    if (!teacherOK) {
      $app.innerHTML = `${topbar('home', 'Teacher panel')}<main><div class="card center">
        <p class="ask">Teacher PIN</p>
        <form data-act="pin" class="typeform"><input id="answer" class="answer short" type="password" autocomplete="off"><button class="btn primary">Open</button></form>
      </div></main>`;
      document.getElementById('answer').focus();
      return;
    }
    const words = Object.entries(S.words).filter(([, s]) => s.seen >= 2).map(([w, s]) => ({ w, rate: s.ok / s.seen, seen: s.seen }))
      .sort((a, b) => a.rate - b.rate).slice(0, 15);
    const recent = S.history.slice(-12).reverse();
    $app.innerHTML = `${topbar('home', 'Teacher panel')}<main class="teacher">
      <div class="card">
        <h2>Overview</h2>
        <p>Engineer: <b>${esc(S.name)}</b> · XP ${S.xp} · Unlocked through level ${Math.min(S.unlocked, LEVELS.length)} · Words read on own: ${Object.keys(S.solo).length} · Radio calls: ${S.radioUses} · Droid "${esc(droidName())}" knows ${taughtCount()} · Words read aloud to droid: ${S.spoken || 0} · Time practicing: ${Math.round(S.minutes)} min</p>
        <p>${esc(syncText())}</p>
        <h3>Hardest words (lowest accuracy)</h3>
        <p>${words.length ? words.map(x => `${esc(x.w)} (${Math.round(x.rate * 100)}% of ${x.seen})`).join(', ') : 'Not enough data yet.'}</p>
        <h3>Recent jobs</h3>
        <table class="tbl"><tr><th>When</th><th>Level</th><th>Job</th><th>Score</th><th>Radio</th><th>Time</th></tr>
        ${recent.map(h => `<tr><td>${new Date(h.d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td><td>${h.level}</td><td>${esc(h.act)}</td><td>${h.correct}/${h.total}</td><td>${h.radio}</td><td>${Math.round(h.secs / 60)}m</td></tr>`).join('')}
        </table>
      </div>
      <div class="card">
        <h2>Controls</h2>
        <div class="ctl"><label>Engineer name <input id="t-name" value="${esc(S.name)}"></label><button class="btn" data-act="t-name">Save</button></div>
        <div class="ctl"><label>Unlock through level <input id="t-level" type="number" min="1" max="${LEVELS.length}" value="${Math.min(S.unlocked, LEVELS.length)}"></label><button class="btn" data-act="t-level">Set</button></div>
        <div class="ctl"><button class="btn" data-act="t-refill">Refill radio battery</button>
          <button class="btn" data-act="t-test">Send test report</button>
          <button class="btn" data-act="t-export">Download progress backup</button>
          <label class="btn">Restore backup<input type="file" id="t-import" accept=".json" hidden></label>
          <button class="btn danger" data-act="t-reset">Reset all progress</button></div>
      </div>
    </main>`;
  }

  // ---------------------------------------------------------------- events
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'FORM') return;
    const act = b.dataset.act;
    switch (act) {
      case 'home': return renderHome();
      case 'level':
        if (b.dataset.id) return renderLevel(levelById(+b.dataset.id));
        return renderLevel(curLevel || R.level);
      case 'start': return startRound(curLevel, b.dataset.key);
      case 'say': {
        const t = b.dataset.target;
        const el = t === 'self' ? b : t ? document.querySelector(t) : null;
        return el ? sayHL(el, b.dataset.text) : say(b.dataset.text);
      }
      case 'hint': return hintFor(b.dataset.k, b.dataset.kind);
      case 'exdecode': {
        const w = curLevel.words[+b.dataset.i];
        document.getElementById('exbox').innerHTML = decoderHTML(w) + speakBtn(w.say || w.w, 'Hear the whole word', '#exbox .decoder');
        return;
      }
      case 'next': return next();
      case 'listen': return listenFix();
      case 'replay': return talk(promptParts(R.items[R.i]));
      case 'droid-talk': {
        const np = nextPart();
        return droidSay(taughtCount()
          ? `Hello, Maker ${S.name}. I am ${droidName()}. I know ${taughtCount()} words and letters.${np ? ` Teach me ${np.at - taughtCount()} more and I get my ${np.name}.` : ' I am fully operational!'}`
          : `Hello, Maker. I am ${droidName()}. I cannot read yet. Please teach me.`);
      }
      case 'droid-teach': {
        const lv = levelById(Math.min(S.unlocked, LEVELS.length));
        curLevel = lv;
        return startRound(lv, 'teach');
      }
      case 'choose': return choose(+b.dataset.i);
      case 'decode': {
        R.decoder++; S.decoderUses++;
        document.getElementById('decbox').innerHTML = decoderHTML(R.items[R.i].w);
        return;
      }
      case 'radio': if (spendRadio(+b.dataset.cost)) sayHL(document.querySelector('.big-word'), R.items[R.i].w.say || R.items[R.i].w.w); return;
      case 'radio-sentence': if (spendRadio(+b.dataset.cost)) sayHL(document.querySelector('.story .now'), R.items[R.i].sentence, 0.8); return;
      case 'radio-q': {
        if (!spendRadio(+b.dataset.cost)) return;
        const q = R.items[R.i].question;
        (async () => {
          const tok = hlToken + 1;
          await sayHL(document.getElementById('q-text'), q.q);
          // read each choice in turn, unless he clicked something else meanwhile
          for (const [i, c] of q.choices.entries()) {
            if (hlToken !== tok + i) return;
            await sayHL(document.querySelector(`.choice[data-i="${i}"] .ctext`), c);
          }
        })();
        return;
      }
      case 'tok': {
        const w = b.dataset.w, isPrev = b.dataset.p === '1';
        R.decoder++; S.decoderUses++;
        document.querySelectorAll('.tok.sel').forEach(t => t.classList.remove('sel'));
        b.classList.add('sel');
        document.getElementById('decbox').innerHTML = `<div class="popdec">${/^[a-z]+$/i.test(w) && !/[A-Z].*[A-Z]/.test(w) ? decoderHTML({ w }) : `<div class="big-word sm">${esc(w)}</div>`}
          ${isPrev ? `<button class="btn" data-act="say" data-text="${esc(w)}" data-target=".tok.sel">🔊 New word: hear it free</button>`
            : `<button class="btn radio" data-act="radio-word" data-w="${esc(w)}" data-cost="${CFG.radio.wordCost}">📻 Radio HQ (−${CFG.radio.wordCost}%)</button>`}</div>`;
        return;
      }
      case 'radio-word': if (spendRadio(+b.dataset.cost)) sayHL(document.querySelector('.tok.sel'), b.dataset.w); return;
      case 'next-sentence': {
        const it = R.items[R.i];
        if (!R.usedRadio) {
          markSolo(it.sentence.split(/\s+/).map(t => t.replace(/[^\w']/g, '')).filter(t => /^[a-z']+$/i.test(t)));
          addBattery(3);
          S.xp += 5;
        }
        persist();
        return next();
      }
      case 'close-overlay': document.querySelector('.overlay')?.remove(); return renderLevel(curLevel);
      case 'teacher': return renderTeacher();
      case 't-name': S.name = document.getElementById('t-name').value.trim() || S.name; persist(); toast('Saved.'); return renderTeacher();
      case 't-level': S.unlocked = Math.max(1, Math.min(LEVELS.length, +document.getElementById('t-level').value || 1)); addBattery(0); persist(); toast('Saved.'); return renderTeacher();
      case 't-refill': S.battery = maxBattery(); persist(); toast('Battery refilled.'); return renderTeacher();
      case 't-test':
        if (!CFG.reportUrl) { toast('No reportUrl in config.js yet. See README step 2.'); return; }
        report({ event: 'test', activity: 'Test from teacher panel' });
        toast('Test report sent. Check the Log tab of your Google Sheet.');
        return;
      case 't-export': {
        const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `workshop-reader-${(S.name || 'student').toLowerCase()}-${today()}.json`;
        a.click();
        return;
      }
      case 't-reset':
        if (confirm('Erase ALL progress on this computer? Download a backup first if you might want it.')) {
          S = Object.assign({}, DEFAULTS, { name: S.name });
          dailyRecharge(); persist(); teacherOK = false; renderHome();
        }
        return;
    }
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, val = (document.getElementById('answer') || {}).value || '';
    const act = f.dataset.act;
    if (act === 'setname') {
      if (!val.trim()) return;
      S.name = val.trim().slice(0, 20);
      persist();
      say('Welcome, engineer ' + S.name + '!');
      return renderHome();
    }
    if (act === 'pin') {
      if (val === String(CFG.teacherPin)) { teacherOK = true; return renderTeacher(); }
      toast('Wrong PIN.');
      return;
    }
    if (act === 'droidname') {
      if (!val.trim()) return;
      S.droidName = val.trim().slice(0, 16);
      persist();
      droidSay(`Hello, Maker. I am ${S.droidName}. I am ready to learn.`);
      return startRound(curLevel, 'teach');
    }
    if (!R || !val.trim()) return;
    if (R.key === 'teach' && R.state === 'fix') {
      if (norm(val) === norm(R.items[R.i].w.w)) return fixDone(false);
      beep(false);
      toast('Not quite. Check each letter against the word.');
      return;
    }
    if (R.key === 'sound') return checkSound(val);
    if (R.key === 'type') return checkType(val);
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'answer' && R && R.key === 'type') { R.typed = e.target.value; updateBlanks(); }
  });

  document.addEventListener('change', e => {
    if (e.target.id !== 't-import' || !e.target.files[0]) return;
    const rd = new FileReader();
    rd.onload = () => {
      try { S = Object.assign({}, DEFAULTS, JSON.parse(rd.result)); persist(); toast('Backup restored.'); renderTeacher(); }
      catch (err) { toast('That file is not a Workshop Reader backup.'); }
    };
    rd.readAsText(e.target.files[0]);
  });

  // Number keys pick choices; Enter or Space presses Next.
  document.addEventListener('keydown', e => {
    if (!R || e.target.tagName === 'INPUT') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) {
      const btn = document.querySelector(`.choice[data-i="${n - 1}"]:not([disabled])`);
      if (btn) { e.preventDefault(); btn.click(); }
    } else if (e.key === 'Enter' || e.key === ' ') {
      const nb = document.getElementById('nextbtn');
      if (nb) { e.preventDefault(); nb.click(); }
    }
  });

  // ---------------------------------------------------------------- boot
  dailyRecharge();
  flush();
  if (!S.name) renderName(); else renderHome();
})();
