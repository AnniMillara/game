(function() {
  var SUITS = ['S','H','D','C'];
  var SUIT_GLYPH = { S:'♠', H:'♥', D:'♦', C:'♣' };
  var RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var isRed = function(s){return s==='H'||s==='D';};
  var rv = function(r){return RANKS.indexOf(r)+1;};
  var LEVELS = [
    {time:300,draw:1}, {time:260,draw:1}, {time:220,draw:1},
    {time:200,draw:3}, {time:180,draw:3}
  ];
  var root = null, state = null, tick = null;
  var CW = 62, CH = 87, UP = 24, DOWN = 13;

  function computeSizes() {
    var w = window.innerWidth;
    var cw;
    if (w < 500) cw = 34;
    else if (w < 700) cw = 42;
    else if (w < 1000) cw = 54;
    else if (w < 1300) cw = 66;
    else cw = 76;
    CW = cw;
    CH = Math.round(cw * 7 / 5);
    UP = Math.round(CH * 0.28);
    DOWN = Math.round(CH * 0.15);
    document.documentElement.style.setProperty('--card-w', CW + 'px');
    document.documentElement.style.setProperty('--card-h', CH + 'px');
  }

  function buildDeck() {
    var d = [], i, j;
    for (i = 0; i < SUITS.length; i++) for (j = 0; j < RANKS.length; j++) d.push({ suit: SUITS[i], rank: RANKS[j], up: false });
    for (i = d.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = d[i]; d[i] = d[k]; d[k] = t; }
    return d;
  }

  function start(lvl) {
    computeSizes();
    var c = LEVELS[lvl-1], d = buildDeck(), tab = [], i, j;
    for (i = 0; i < 7; i++) {
      tab.push([]);
      for (j = 0; j <= i; j++) { var card = d.pop(); card.up = (j === i); tab[i].push(card); }
    }
    state = {
      level: lvl, tab: tab, fnd: [[],[],[],[]],
      stock: d, waste: [], sel: null,
      moves: 0, timeLeft: c.time, draw: c.draw, finished: false
    };
    Levels.recordAttempt('solitario');
    draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }

  function stop() { if (tick) { clearInterval(tick); tick = null; } }

  function update() {
    var s = document.getElementById('s-st'); if (!s || !state) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'MOVS ', IU.el('span', { class: 'val' }, String(state.moves))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }

  function cardEl(c, opts) {
    opts = opts || {};
    if (!c) return IU.el('div', { class: 'sol-card empty' }, '·');
    var cls = 'sol-card ' + (isRed(c.suit) ? 'red' : 'black');
    if (!c.up) cls += ' face-down';
    if (opts.sel) cls += ' selected';
    if (opts.valid) cls += ' valid-target';
    if (opts.invalid) cls += ' invalid-flash';
    var node = IU.el('div', { class: cls, onclick: opts.onClick || function(){} });
    if (c.up) {
      var g = SUIT_GLYPH[c.suit];
      node.appendChild(IU.el('div', { class: 'card-corner top-left' },
        IU.el('div', { class: 'card-rank' }, c.rank),
        IU.el('div', { class: 'card-suit' }, g)));
      node.appendChild(IU.el('div', { class: 'card-center-suit' }, g));
      node.appendChild(IU.el('div', { class: 'card-corner bottom-right' },
        IU.el('div', { class: 'card-rank' }, c.rank),
        IU.el('div', { class: 'card-suit' }, g)));
    }
    return node;
  }

  // Comprueba si la carta "moving" puede ponerse encima de "target" en tableau
  function canStackOn(moving, target) {
    if (!target || !target.up) return false;
    return rv(moving.rank) + 1 === rv(target.rank) && isRed(moving.suit) !== isRed(target.suit);
  }

  function layoutColumn(col, pile, colIndex) {
    var y = 0;
    for (var i = 0; i < pile.length; i++) {
      var card = pile[i];
      var isSel = state.sel && state.sel.from === 'tab' && state.sel.pile === colIndex && state.sel.start === i;
      var isValidTarget = false;
      // Highlight de destino válido para la carta superior de la selección actual
      if (state.sel && i === pile.length - 1 && card.up) {
        var moving;
        if (state.sel.from === 'waste') moving = state.waste[state.waste.length - 1];
        else moving = state.tab[state.sel.pile][state.sel.start];
        if (moving && !(state.sel.from === 'tab' && state.sel.pile === colIndex) && canStackOn(moving, card)) {
          isValidTarget = true;
        }
      }
      var node = cardEl(card, {
        sel: isSel,
        valid: isValidTarget,
        onClick: (function(idx){ return function(e) { e.stopPropagation(); clickTab(colIndex, idx); }; })(i)
      });
      node.style.top = y + 'px';
      node.style.zIndex = String(i + 1 + (isSel ? 200 : 0));
      col.appendChild(node);
      if (i < pile.length - 1) y += card.up ? UP : DOWN;
    }
    col.style.height = (pile.length === 0 ? CH : y + CH) + 'px';
  }

  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div', { class: 'sol-wrap' });
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 's-st' }));
    update();

    var top = IU.el('div', { class: 'sol-top' });

    var sp = IU.el('div', { class: 'sol-pile' }, IU.el('div', { class: 'sol-pile-label' }, 'MAZO'));
    var stockCard = IU.el('div', {
      class: 'sol-card' + (state.stock.length ? ' face-down' : ' empty'),
      onclick: drawFromStock
    });
    if (!state.stock.length) stockCard.textContent = '×';
    sp.appendChild(stockCard);
    top.appendChild(sp);

    var wp = IU.el('div', { class: 'sol-pile' }, IU.el('div', { class: 'sol-pile-label' }, 'WASTE'));
    var tw = state.waste[state.waste.length - 1];
    var wasteEl;
    if (tw) {
      var wSel = state.sel && state.sel.from === 'waste';
      wasteEl = cardEl(tw, { sel: wSel, onClick: clickWaste });
    } else {
      wasteEl = IU.el('div', { class: 'sol-card empty' }, '.');
    }
    wp.appendChild(wasteEl);
    top.appendChild(wp);

    var fnd = IU.el('div', { class: 'sol-foundations' });
    for (var i = 0; i < 4; i++) {
      (function(idx){
        var p = state.fnd[idx], t = p[p.length-1];
        var n = IU.el('div', {
          class: 'sol-foundation' + (t ? ' filled' + (isRed(t.suit) ? ' red' : '') : ''),
          onclick: function() { clickFnd(idx); }
        });
        if (t) {
          n.appendChild(IU.el('div', { class: 'card-corner top-left' },
            IU.el('div', { class: 'card-rank' }, t.rank),
            IU.el('div', { class: 'card-suit' }, SUIT_GLYPH[t.suit])));
          n.appendChild(IU.el('div', { class: 'card-center-suit' }, SUIT_GLYPH[t.suit]));
        } else {
          n.textContent = SUIT_GLYPH[SUITS[idx]];
        }
        fnd.appendChild(n);
      })(i);
    }
    top.appendChild(fnd);
    wrap.appendChild(top);

    var row = IU.el('div', { class: 'sol-row' });
    for (var i = 0; i < 7; i++) {
      (function(idx) {
        var col = IU.el('div', { class: 'sol-col' });
        layoutColumn(col, state.tab[idx], idx);
        col.addEventListener('click', function(e) {
          if (e.target === col) clickEmptyCol(idx);
        });
        row.appendChild(col);
      })(i);
    }
    wrap.appendChild(row);

    var actions = IU.el('div', { class: 'sol-actions' });
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'solitario', start); } }, '[ NIVELES ]'));
    wrap.appendChild(actions);
    root.appendChild(wrap);
  }

  function drawFromStock() {
    if (!state || state.finished) return;
    state.sel = null;
    if (!state.stock.length) {
      if (!state.waste.length) return;
      state.stock = state.waste.reverse();
      state.waste = [];
      for (var i = 0; i < state.stock.length; i++) state.stock[i].up = false;
      playSfx('solitario', 'deal');
    } else {
      for (var i = 0; i < state.draw && state.stock.length; i++) {
        var c = state.stock.pop(); c.up = true; state.waste.push(c);
      }
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
    // Si ya estaba seleccionada la waste, deseleccionar
    if (state.sel && state.sel.from === 'waste') {
      state.sel = null; draw(); return;
    }
    // Si hay otra selección, deseleccionar (no se puede apilar sobre waste)
    if (state.sel) {
      state.sel = null; draw(); return;
    }
    state.sel = { from: 'waste', pile: -1, start: state.waste.length - 1 };
    draw();
  }

  function clickTab(pi, ci) {
    if (!state || state.finished) return;
    var card = state.tab[pi][ci];
    if (!card) return;

    // Deseleccionar si se hace clic sobre la misma carta que ya está seleccionada
    if (state.sel && state.sel.from === 'tab' && state.sel.pile === pi && state.sel.start === ci) {
      state.sel = null; draw(); return;
    }

    // Si hay una carta seleccionada, intentar mover a este destino
    if (state.sel) {
      // Movimiento dentro de la misma columna NO es válido
      if (state.sel.from === 'tab' && state.sel.pile === pi) {
        playSfx('solitario', 'invalid');
        state.sel = null; draw(); return;
      }
      // Solo se puede apilar sobre la carta superior
      if (ci !== state.tab[pi].length - 1) {
        playSfx('solitario', 'invalid');
        state.sel = null; draw(); return;
      }
      var moving;
      if (state.sel.from === 'waste') moving = state.waste[state.waste.length - 1];
      else moving = state.tab[state.sel.pile][state.sel.start];
      if (!canStackOn(moving, card)) {
        playSfx('solitario', 'invalid');
        state.sel = null; draw(); return;
      }
      // Ejecutar el movimiento
      executeMove(state.tab[pi]);
      return;
    }

    // Seleccionar (solo si es boca arriba y forma una secuencia válida)
    if (!card.up) return;
    if (!validSeq(state.tab[pi].slice(ci))) return;
    state.sel = { from: 'tab', pile: pi, start: ci };
    draw();
  }

  function clickEmptyCol(pi) {
    if (!state || !state.sel) return;
    if (state.tab[pi].length) { state.sel = null; draw(); return; }
    // Solo reyes pueden ir a columna vacía (sin importar origen)
    var moving;
    if (state.sel.from === 'waste') moving = state.waste[state.waste.length - 1];
    else moving = state.tab[state.sel.pile][state.sel.start];
    if (!moving || moving.rank !== 'K') {
      playSfx('solitario', 'invalid');
      state.sel = null; draw(); return;
    }
    executeMove(state.tab[pi]);
  }

  function clickFnd(idx) {
    if (!state || !state.sel) return;
    var moving;
    if (state.sel.from === 'waste') moving = state.waste[state.waste.length - 1];
    else moving = state.tab[state.sel.pile][state.sel.start];
    if (!moving) { state.sel = null; draw(); return; }
    // Solo una carta puede ir a fundación
    var group;
    if (state.sel.from === 'waste') group = [moving];
    else group = state.tab[state.sel.pile].slice(state.sel.start);
    if (group.length !== 1) { playSfx('solitario', 'invalid'); state.sel = null; draw(); return; }
    var si = SUITS.indexOf(moving.suit), pile = state.fnd[si];
    if (rv(moving.rank) !== pile.length + 1) { playSfx('solitario', 'invalid'); state.sel = null; draw(); return; }
    removeSelected();
    pile.push(moving);
    state.sel = null;
    state.moves++;
    playSfx('solitario', 'found');
    draw();
    if (state.fnd.every(function(p){ return p.length === 13; })) finish(true, '¡PARTIDA COMPLETADA!');
  }

  function executeMove(destPile) {
    var moving;
    if (state.sel.from === 'waste') moving = [state.waste[state.waste.length - 1]];
    else moving = state.tab[state.sel.pile].slice(state.sel.start);
    if (!moving.length) { state.sel = null; draw(); return; }
    removeSelected();
    for (var i = 0; i < moving.length; i++) destPile.push(moving[i]);
    state.sel = null;
    state.moves++;
    playSfx('solitario', 'move');
    draw();
  }

  function removeSelected() {
    if (state.sel.from === 'waste') { state.waste.pop(); return; }
    var p = state.tab[state.sel.pile];
    p.splice(state.sel.start);
    if (p.length && !p[p.length-1].up) { p[p.length-1].up = true; playSfx('solitario', 'flip'); }
  }

  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();
    var lvl = state.level, isLast = lvl >= LEVELS.length;
    var nextLevel = (won && !isLast) ? lvl + 1 : null;
    var score = won ? Math.max(10, 500 - state.moves * 2) : 0;
    if (won) {
      playSfx('solitario', 'win');
      if (Levels.tryComplete && Levels.tryComplete('solitario', lvl, { score: score })) return;
      Levels.complete('solitario', lvl, { score: score });
    }
    var stats = [
      { label: 'NIVEL', value: String(lvl) },
      { label: 'MOVS', value: String(state.moves) },
      { label: 'TIEMPO', value: state.timeLeft + 's' }
    ];
    if (won) stats.push({ label: 'PUNTOS', value: String(score) });
    IU.showResult({
      won: won, message: msg, stats: stats,
      onNext: nextLevel ? function() { start(nextLevel); } : null,
      onRetry: function() { start(lvl); },
      onLevels: function() { IU.levelSelect(root, 'solitario', start); }
    });
  }

  window.SolitarioGame = {
    render: function(r) { root = r; computeSizes(); IU.levelSelect(r, 'solitario', start); },
    destroy: function() { stop(); state = null; root = null; }
  };
})();