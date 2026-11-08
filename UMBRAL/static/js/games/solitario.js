(function() {
  var SUITS = ['S','H','D','C'], RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var isRed = function(s) { return s === 'H' || s === 'D'; };
  var rv = function(r) { return RANKS.indexOf(r) + 1; };
  var LEVELS = [{ time: 300, draw: 1 }, { time: 260, draw: 1 }, { time: 220, draw: 1 }, { time: 200, draw: 3 }, { time: 180, draw: 3 }];
  var root = null, state = null, tick = null;
  function deck() {
    var d = [], i, j;
    for (i = 0; i < SUITS.length; i++) for (j = 0; j < RANKS.length; j++) d.push({ suit: SUITS[i], rank: RANKS[j], up: false });
    for (i = d.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = d[i]; d[i] = d[k]; d[k] = t; }
    return d;
  }
  function start(lvl) {
    var c = LEVELS[lvl-1], d = deck(), tab = [], i, j;
    for (i = 0; i < 7; i++) {
      tab.push([]);
      for (j = 0; j <= i; j++) { var card = d.pop(); card.up = (j === i); tab[i].push(card); }
    }
    state = { level: lvl, tab: tab, fnd: [[],[],[],[]], stock: d, waste: [], sel: null, moves: 0, timeLeft: c.time, draw: c.draw, finished: false };
    Levels.recordAttempt('solitario'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function update() {
    var s = document.getElementById('s-st'); if (!s) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'MOVS ', IU.el('span', { class: 'val' }, String(state.moves))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }
  function label(c) { return c.rank + c.suit; }
  function cardEl(c, sel, onClick) {
    if (!c) return IU.el('div', { class: 'sol-card empty' }, '.');
    var cls = 'sol-card ' + (isRed(c.suit) ? 'red' : 'black');
    if (!c.up) cls += ' face-down';
    if (sel) cls += ' selected';
    var n = IU.el('div', { class: cls, onclick: onClick || function(){} }, c.up ? label(c) : '?');
    return n;
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div', { class: 'sol-wrap' });
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 's-st' })); update();
    var top = IU.el('div', { class: 'sol-top' });
    var sp = IU.el('div', { class: 'sol-pile' }, IU.el('div', { style: { fontSize: '10px', color: 'var(--green-dim)' } }, 'MAZO'));
    var sc = IU.el('div', { class: 'sol-card face-down', onclick: drawFromStock }, state.stock.length ? '?' : 'X');
    sp.appendChild(sc);
    var wp = IU.el('div', { class: 'sol-pile' }, IU.el('div', { style: { fontSize: '10px', color: 'var(--green-dim)' } }, 'WASTE'));
    var tw = state.waste[state.waste.length - 1];
    wp.appendChild(tw ? cardEl(tw, false, function() { clickWaste(); }) : IU.el('div', { class: 'sol-card empty' }, '.'));
    top.appendChild(sp); top.appendChild(wp);
    var fnd = IU.el('div', { class: 'sol-foundations' });
    for (var i = 0; i < 4; i++) {
      (function(idx){
        var p = state.fnd[idx], t = p[p.length-1];
        var n = IU.el('div', { class: 'sol-foundation', onclick: function() { clickFnd(idx); } }, t ? label(t) : SUITS[idx]);
        if (t) n.style.color = isRed(t.suit) ? '#ff5a5a' : 'var(--green-bright)';
        fnd.appendChild(n);
      })(i);
    }
    top.appendChild(fnd); wrap.appendChild(top);
    var row = IU.el('div', { class: 'sol-row' });
    for (var i = 0; i < 7; i++) {
      (function(idx){
        var col = IU.el('div', { class: 'sol-col' });
        var pile = state.tab[idx];
        pile.forEach(function(c, ci) {
          var sel = state.sel && state.sel.from === 'tab' && state.sel.pile === idx && state.sel.start === ci;
          var n = cardEl(c, sel, function() { clickTab(idx, ci); });
          n.style.position = ci === 0 ? 'relative' : 'absolute';
          if (ci > 0) n.style.top = (ci * 22) + 'px';
          col.appendChild(n);
        });
        col.addEventListener('click', function(e) { if (e.target === col) clickEmptyCol(idx); });
        row.appendChild(col);
      })(i);
    }
    wrap.appendChild(row);
    wrap.appendChild(IU.el('div', { class: 'game-message', id: 's-msg' }, ' '));
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'solitario', start); } }, '[ NIVELES ]'));
    wrap.appendChild(a);
    root.appendChild(wrap);
  }
  function drawFromStock() {
    if (!state || state.finished) return;
    if (!state.stock.length) {
      if (!state.waste.length) return;
      state.stock = state.waste.reverse(); state.waste = [];
      state.stock.forEach(function(c) { c.up = false; });
      playSfx('solitario', 'deal');
    } else {
      for (var i = 0; i < state.draw && state.stock.length; i++) { var c = state.stock.pop(); c.up = true; state.waste.push(c); }
      playSfx('solitario', 'flip');
    }
    state.moves++; draw();
  }
  function validSeq(cs) {
    for (var i = 0; i < cs.length - 1; i++) {
      if (rv(cs[i].rank) !== rv(cs[i+1].rank) + 1) return false;
      if (isRed(cs[i].suit) === isRed(cs[i+1].suit)) return false;
    }
    return true;
  }
  function clickWaste() {
    if (!state || !state.waste.length || state.finished) return;
    if (state.sel) { tryMove('tab', -1, -1); return; }
    state.sel = { from: 'waste', pile: -1, start: state.waste.length - 1 }; draw();
  }
  function clickTab(pi, ci) {
    if (!state || state.finished) return;
    if (state.sel) { tryMove('tab', pi, ci); return; }
    var c = state.tab[pi][ci];
    if (!c.up) return;
    var slice = state.tab[pi].slice(ci);
    if (!validSeq(slice)) return;
    state.sel = { from: 'tab', pile: pi, start: ci }; draw();
  }
  function clickEmptyCol(pi) {
    if (!state || !state.sel) return;
    if (state.tab[pi].length) return;
    var moving;
    if (state.sel.from === 'waste') moving = [state.waste[state.waste.length-1]];
    else moving = state.tab[state.sel.pile].slice(state.sel.start);
    if (!moving.length) return;
    if (state.sel.from === 'tab' && moving[0].rank !== 'K') { playSfx('solitario', 'invalid'); return; }
    removeSel(state.sel); moving.forEach(function(c) { state.tab[pi].push(c); });
    state.sel = null; after(); draw();
  }
  function clickFnd(idx) {
    if (!state || !state.sel) return;
    tryMove('fnd', idx, -1); draw();
  }
  function tryMove(tf, pi, ci) {
    var moving;
    if (state.sel.from === 'waste') moving = [state.waste[state.waste.length-1]];
    else moving = state.tab[state.sel.pile].slice(state.sel.start);
    if (!moving.length) return;
    if (tf === 'fnd') {
      if (moving.length !== 1) return;
      var c = moving[0], si = SUITS.indexOf(c.suit), pile = state.fnd[si];
      if (rv(c.rank) !== pile.length + 1) { playSfx('solitario', 'invalid'); return; }
      removeSel(state.sel); pile.push(c); state.sel = null;
      playSfx('solitario', 'found'); after(); draw();
      if (state.fnd.every(function(p){return p.length===13;})) finish(true, 'COMPLETADO');
      return;
    }
    if (tf === 'tab') {
      var tp = state.tab[pi], tc = tp[ci];
      if (!tc || !tc.up) return;
      var a = moving[0];
      if (rv(a.rank) + 1 !== rv(tc.rank) || isRed(a.suit) === isRed(tc.suit)) { playSfx('solitario', 'invalid'); return; }
      removeSel(state.sel); moving.forEach(function(c) { tp.push(c); });
      state.sel = null; after(); draw();
    }
  }
  function removeSel(sel) {
    if (sel.from === 'waste') { state.waste.pop(); return; }
    var p = state.tab[sel.pile];
    p.splice(sel.start);
    if (p.length && !p[p.length-1].up) { p[p.length-1].up = true; playSfx('solitario', 'flip'); }
  }
  function after() { state.moves++; playSfx('solitario', 'move'); update(); }
  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();
    var m = document.getElementById('s-msg'); if (m) m.textContent = msg;
    if (won) { playSfx('solitario', 'win'); Levels.complete('solitario', state.level, { score: Math.max(10, 500 - state.moves * 2) }); }
  }
  window.SolitarioGame = { render: function(r) { root = r; IU.levelSelect(r, 'solitario', start); }, destroy: function() { stop(); state = null; root = null; } };
})();