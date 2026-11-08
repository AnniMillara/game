(function() {
  var LEVELS = [{ pairs:4, time:90 }, { pairs:6, time:90 }, { pairs:8, time:80 }, { pairs:12, time:75 }, { pairs:18, time:70 }];
  var SYM = ['◉','✦','✚','◆','▲','■','●','✧','★','☾','☀','⚑','⚔','⚖','⚙','⚡','⚓','⚗'];
  var root = null, state = null, tick = null;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function start(lvl) {
    var c = LEVELS[lvl-1];
    var picked = shuffle(SYM.slice()).slice(0, c.pairs), deck = [];
    picked.forEach(function(s, i) { deck.push({ id: i, s: s }); deck.push({ id: i, s: s }); });
    shuffle(deck);
    state = { level: lvl, cards: deck, flipped: [], matched: 0, total: c.pairs, moves: 0, timeLeft: c.time, lock: false, finished: false };
    Levels.recordAttempt('memoria'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function update() {
    var s = document.getElementById('m-st'); if (!s) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'MOVS ', IU.el('span', { class: 'val' }, String(state.moves))));
    s.appendChild(IU.el('span', {}, 'PAREJAS ', IU.el('span', { class: 'val' }, state.matched + '/' + state.total)));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div');
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 'm-st' })); update();
    var total = state.cards.length, cols = total <= 8 ? 4 : total <= 12 ? 4 : total <= 16 ? 4 : 6;
    var g = IU.el('div', { class: 'mem-grid' }); g.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    state.cards.forEach(function(c, i) {
      var flip = state.flipped.indexOf(i) !== -1 || c._m;
      var node = IU.el('div', {
        class: 'mem-card' + (flip ? ' flipped' : '') + (c._m ? ' matched' : ''),
        onclick: function() { flipCard(i); }
      },
        IU.el('div', { class: 'mem-inner' },
          IU.el('div', { class: 'mem-face mem-front' }),
          IU.el('div', { class: 'mem-face mem-back' }, c.s)
        ));
      g.appendChild(node);
    });
    wrap.appendChild(g);
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'memoria', start); } }, '[ NIVELES ]'));
    wrap.appendChild(a);
    root.appendChild(wrap);
  }
  function flipCard(i) {
    if (!state || state.finished || state.lock) return;
    if (state.flipped.indexOf(i) !== -1 || state.cards[i]._m) return;
    state.flipped.push(i);
    playSfx('memoria', 'flip');
    var nodes = document.querySelectorAll('.mem-card'); if (nodes[i]) nodes[i].classList.add('flipped');
    if (state.flipped.length === 2) {
      var a = state.flipped[0], b = state.flipped[1];
      state.moves++;
      if (state.cards[a].id === state.cards[b].id) {
        state.cards[a]._m = state.cards[b]._m = true;
        state.matched++; state.flipped = [];
        playSfx('memoria', 'match'); update(); draw();
        if (state.matched === state.total) finish(true, 'PAREJAS COMPLETAS');
      } else {
        state.lock = true; playSfx('memoria', 'miss');
        setTimeout(function() { state.flipped = []; state.lock = false; draw(); }, 800);
      }
    }
  }
  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();

    var lvl = state.level, isLast = lvl >= LEVELS.length;
    var nextLevel = (won && !isLast) ? lvl + 1 : null;
    var elapsed = LEVELS[lvl-1].time - state.timeLeft;
    var score = won ? Math.max(10, 200 - state.moves * 3) : 0;
    var isRecord = won && Levels.isRecord('memoria', lvl, score);
    var unlockedNew = false;

    if (won) {
      playSfx('memoria', 'level');
      if (Levels.tryComplete && Levels.tryComplete('memoria', lvl, { score: score, time: elapsed })) return;
      unlockedNew = nextLevel !== null;
    }

    var stats = [
      { label: 'NIVEL', value: String(lvl) },
      { label: 'TIEMPO', value: elapsed + 's' },
      { label: 'MOVS', value: String(state.moves) },
      { label: 'PAREJAS', value: state.matched + '/' + state.total }
    ];
    if (won) stats.push({ label: 'PUNTOS', value: String(score) });

    IU.showResult({
      won: won, message: msg, level: lvl,
      unlocked: unlockedNew, newRecord: isRecord,
      stats: stats,
      onNext: nextLevel ? function() { start(nextLevel); } : null,
      onRetry: function() { start(lvl); },
      onLevels: function() { IU.levelSelect(root, 'memoria', start); }
    });
  }
  window.MemoriaGame = {
    render: function(r) { root = r; IU.levelSelect(r, 'memoria', start); },
    destroy: function() { stop(); state = null; root = null; }
  };
})();