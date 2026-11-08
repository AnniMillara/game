(function() {
  var SCENES = {
    hab: { items: [
      { id:'w', x:0,y:0,w:100,h:100,bg:'rgba(0,143,57,.06)' },
      { id:'win', x:8,y:10,w:22,h:22,bg:'rgba(57,255,20,.12)',bd:1 },
      { id:'bed', x:5,y:60,w:35,h:25,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'lamp', x:62,y:8,w:8,h:18,bg:'rgba(57,255,20,.25)',bd:1 },
      { id:'table', x:45,y:50,w:22,h:15,bg:'rgba(0,143,57,.15)',bd:1 },
      { id:'chair', x:72,y:55,w:10,h:18,bg:'rgba(0,143,57,.2)',bd:1 },
      { id:'pic', x:38,y:15,w:14,h:14,bg:'rgba(0,255,102,.15)',bd:1 },
      { id:'clock', x:78,y:30,w:8,h:8,bg:'rgba(57,255,20,.2)',bd:1 },
      { id:'plant', x:88,y:62,w:8,h:30,bg:'rgba(0,143,57,.3)',bd:1 },
      { id:'rug', x:20,y:82,w:45,h:8,bg:'rgba(57,255,20,.1)' }
    ], diffs: [
      { id:'win', bg:'rgba(255,90,90,.15)' },
      { id:'lamp', h:30 },
      { id:'pic', w:22 },
      { id:'clock', bg:'rgba(57,255,20,.5)' },
      { id:'plant', h:45 },
      { id:'rug', w:60 },
      { id:'chair', x:60 }
    ]},
    ofi: { items: [
      { id:'w', x:0,y:0,w:100,h:100,bg:'rgba(0,143,57,.05)' },
      { id:'desk', x:10,y:55,w:70,h:25,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'mon', x:30,y:35,w:22,h:18,bg:'rgba(57,255,20,.2)',bd:1 },
      { id:'kb', x:32,y:54,w:18,h:4,bg:'rgba(0,255,102,.15)',bd:1 },
      { id:'shelf', x:85,y:15,w:12,h:55,bg:'rgba(0,143,57,.15)',bd:1 },
      { id:'paper', x:60,y:50,w:8,h:6,bg:'rgba(57,255,20,.15)',bd:1 },
      { id:'lamp2', x:8,y:42,w:8,h:14,bg:'rgba(57,255,20,.3)',bd:1 },
      { id:'door', x:0,y:20,w:4,h:40,bg:'rgba(0,143,57,.2)',bd:1 },
      { id:'cl2', x:45,y:10,w:8,h:8,bg:'rgba(57,255,20,.2)',bd:1 },
      { id:'pl2', x:78,y:70,w:8,h:25,bg:'rgba(0,143,57,.3)',bd:1 }
    ], diffs: [
      { id:'mon', bg:'rgba(255,90,90,.2)' },
      { id:'kb', w:26 },
      { id:'shelf', h:40 },
      { id:'paper', w:14 },
      { id:'lamp2', h:22 },
      { id:'pl2', h:40 },
      { id:'cl2', bg:'rgba(255,90,90,.3)' }
    ]},
    pas: { items: [
      { id:'floor', x:0,y:65,w:100,h:35,bg:'rgba(0,143,57,.08)' },
      { id:'d1', x:8,y:30,w:14,h:35,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'d2', x:30,y:30,w:14,h:35,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'d3', x:52,y:30,w:14,h:35,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'d4', x:74,y:30,w:14,h:35,bg:'rgba(0,143,57,.18)',bd:1 },
      { id:'exit', x:92,y:30,w:8,h:35,bg:'rgba(57,255,20,.2)',bd:1 },
      { id:'light', x:40,y:8,w:20,h:5,bg:'rgba(57,255,20,.3)' },
      { id:'sign', x:50,y:20,w:8,h:5,bg:'rgba(0,255,102,.15)',bd:1 },
      { id:'box', x:24,y:78,w:10,h:10,bg:'rgba(0,143,57,.3)',bd:1 }
    ], diffs: [
      { id:'d1', bg:'rgba(255,90,90,.2)' },
      { id:'d3', w:20 },
      { id:'exit', bg:'rgba(57,255,20,.5)' },
      { id:'light', w:30 },
      { id:'sign', h:10 },
      { id:'box', w:16 },
      { id:'d2', y:20 }
    ]}
  };
  var LEVELS = [
    { scene:'hab', diffs:3, time:90 }, { scene:'ofi', diffs:4, time:90 },
    { scene:'pas', diffs:5, time:75 }, { scene:'hab', diffs:6, time:75 },
    { scene:'ofi', diffs:7, time:60 }
  ];
  var root = null, state = null, tick = null;
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function start(lvl) {
    var c = LEVELS[lvl-1], sc = SCENES[c.scene];
    var diffs = shuffle(sc.diffs.slice()).slice(0, c.diffs);
    state = { level: lvl, items: sc.items, diffs: diffs, found: {}, timeLeft: c.time, finished: false };
    Levels.recordAttempt('observador'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function update() {
    var s = document.getElementById('o-st'); if (!s) return;
    s.innerHTML = '';
    var found = Object.keys(state.found).length;
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'DIFS ', IU.el('span', { class: 'val' }, found + '/' + state.diffs.length)));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }
  function buildScene(items, overrides, isRight) {
    var sc = IU.el('div', { class: 'obs-scene' + (isRight ? ' right' : '') });
    items.forEach(function(item) {
      var ov = null;
      for (var i = 0; i < overrides.length; i++) if (overrides[i].id === item.id) { ov = overrides[i]; break; }
      var n = IU.el('div', { class: 'obs-item', dataset: { id: item.id } });
      n.style.left = item.x + '%'; n.style.top = item.y + '%';
      n.style.width = item.w + '%'; n.style.height = item.h + '%';
      n.style.background = item.bg || 'transparent';
      if (item.bd) n.style.border = '1px solid var(--green-dark)';
      if (ov) {
        if (ov.bg) n.style.background = ov.bg;
        if (ov.w != null) n.style.width = ov.w + '%';
        if (ov.h != null) n.style.height = ov.h + '%';
        if (ov.x != null) n.style.left = ov.x + '%';
        if (ov.y != null) n.style.top = ov.y + '%';
      }
      if (isRight && state.found[item.id]) n.classList.add('found');
      sc.appendChild(n);
    });
    return sc;
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div');
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 'o-st' })); update();
    var sw = IU.el('div', { class: 'obs-wrap' });
    sw.appendChild(buildScene(state.items, [], false));
    var right = buildScene(state.items, state.diffs, true);
    right.addEventListener('click', clickRight);
    sw.appendChild(right);
    wrap.appendChild(sw);
    wrap.appendChild(IU.el('div', { class: 'game-message', id: 'o-msg' }, ' '));
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'observador', start); } }, '[ NIVELES ]'));
    wrap.appendChild(a);
    root.appendChild(wrap);
  }
  function clickRight(e) {
    if (!state || state.finished) return;
    var t = e.target.closest('[data-id]');
    if (!t) { playSfx('observador', 'click'); return; }
    var id = t.dataset.id;
    var isDiff = state.diffs.some(function(d) { return d.id === id; });
    if (!isDiff) { playSfx('observador', 'error'); return; }
    if (state.found[id]) return;
    state.found[id] = true;
    t.classList.add('found');
    playSfx('observador', 'found');
    update();
    if (Object.keys(state.found).length === state.diffs.length) finish(true, 'COMPLETADO');
  }
  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();
    var m = document.getElementById('o-msg'); if (m) m.textContent = msg;
    if (won) { playSfx('observador', 'level'); Levels.complete('observador', state.level, { score: Math.max(10, 300 - (LEVELS[state.level-1].time - state.timeLeft)) }); }
  }
  window.ObservadorGame = { render: function(r) { root = r; IU.levelSelect(r, 'observador', start); }, destroy: function() { stop(); state = null; root = null; } };
})();