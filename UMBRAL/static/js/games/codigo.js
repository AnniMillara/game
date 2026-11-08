(function() {
  var LEVELS = [
    { puzzles: [
      { p:'2, 4, 6, 8, ?', a:'10' }, { p:'1, 3, 5, 7, ?', a:'9' },
      { p:'5, 10, 20, 40, ?', a:'80' }, { p:'100, 90, 80, ?', a:'70' }
    ], time:90 },
    { puzzles: [
      { p:'1, 1, 2, 3, 5, 8, ?', a:'13' }, { p:'2, 3, 5, 7, 11, ?', a:'13' },
      { p:'1, 4, 9, 16, ?', a:'25' }, { p:'3, 6, 12, 24, ?', a:'48' }
    ], time:90 },
    { puzzles: [
      { p:'A B A B A B ?', a:'A' }, { p:'X X Y X X Y X X ?', a:'Y' },
      { p:'1 2 1 2 1 2 ?', a:'1' }, { p:'Z Y Z Y Z ?', a:'Y' }
    ], time:75 },
    { puzzles: [
      { p:'Suma=6, todos iguales. Código:', a:'222' },
      { p:'Producto=24. Dos dígitos: 2 y 3. Código 3 dígitos:', a:'234' },
      { p:'Capicúa 4 dígitos, suma=8, empieza 1:', a:'1001' },
      { p:'Suma=7, ambos primos. Código 2 dígitos:', a:'25' }
    ], time:75 },
    { puzzles: [
      { p:'1, 2, 4, 7, 11, ?', a:'16' }, { p:'100, 50, 25, ?', a:'12.5' },
      { p:'A A B A A B A ?', a:'A' },
      { p:'Suma=6, producto=8, dos iguales. Código 3 dígitos:', a:'114' }
    ], time:60 }
  ];
  var root = null, state = null, tick = null;

  function start(lvl) {
    var c = LEVELS[lvl-1];
    state = { level: lvl, puzzles: c.puzzles.slice(), idx: 0, attempts: 2, timeLeft: c.time, correct: 0, finished: false };
    Levels.recordAttempt('codigo'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function update() {
    var s = document.getElementById('c-st'); if (!s) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'PISTA ', IU.el('span', { class: 'val' }, (state.idx + 1) + '/' + state.puzzles.length)));
    s.appendChild(IU.el('span', {}, 'INTENTOS ', IU.el('span', { class: 'val' }, String(state.attempts))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div', { class: 'cod-root' });
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 'c-st' })); update();
    var puzzle = state.puzzles[state.idx];
    wrap.appendChild(IU.el('div', { class: 'cod-prompt' }, puzzle.p));
    var input = IU.el('input', { class: 'cod-input', type: 'text', autocomplete: 'off' });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') submit(input.value);
      else playSfx('codigo', 'key');
    });
    var row = IU.el('div', { class: 'cod-input-row' }); row.appendChild(input); wrap.appendChild(row);
    wrap.appendChild(IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
      IU.el('button', { class: 'btn', onclick: function() { submit(input.value); } }, '[ ENVIAR ]')));
    wrap.appendChild(IU.el('div', { class: 'game-message', id: 'c-msg' }, ' '));
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'codigo', start); } }, '[ NIVELES ]'));
    wrap.appendChild(a);
    root.appendChild(wrap);
    setTimeout(function() { input.focus(); }, 30);
  }
  function submit(raw) {
    if (!state || state.finished) return;
    var v = String(raw || '').trim().toUpperCase();
    if (!v) return;
    var p = state.puzzles[state.idx], m = document.getElementById('c-msg');
    if (v === p.a.toUpperCase()) {
      playSfx('codigo', 'correct');
      state.idx++; state.attempts = 2; state.correct++;
      if (state.idx >= state.puzzles.length) { finish(true, 'SECUENCIA COMPLETADA'); return; }
      if (m) m.textContent = 'VERIFICADO';
      draw();
    } else {
      playSfx('codigo', 'wrong'); state.attempts--;
      if (m) m.textContent = 'RECHAZADO';
      update();
      if (state.attempts <= 0) finish(false, 'ACCESO DENEGADO');
    }
  }
  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();

    var lvl = state.level, isLast = lvl >= LEVELS.length;
    var nextLevel = (won && !isLast) ? lvl + 1 : null;
    var elapsed = LEVELS[lvl-1].time - state.timeLeft;
    var score = won ? Math.max(10, 400 - elapsed * 2) : 0;
    var isRecord = won && Levels.isRecord('codigo', lvl, score);
    var unlockedNew = false;

    if (won) {
      playSfx('codigo', 'level');
      if (Levels.tryComplete && Levels.tryComplete('codigo', lvl, { score: score, time: elapsed })) return;
      unlockedNew = nextLevel !== null;
    }

    var stats = [
      { label: 'NIVEL', value: String(lvl) },
      { label: 'TIEMPO', value: elapsed + 's' },
      { label: 'ACIERTOS', value: state.correct + '/' + state.puzzles.length }
    ];
    if (won) stats.push({ label: 'PUNTOS', value: String(score) });

    IU.showResult({
      won: won, message: msg, level: lvl,
      unlocked: unlockedNew, newRecord: isRecord,
      stats: stats,
      onNext: nextLevel ? function() { start(nextLevel); } : null,
      onRetry: function() { start(lvl); },
      onLevels: function() { IU.levelSelect(root, 'codigo', start); }
    });
  }
  window.CodigoGame = {
    render: function(r) { root = r; IU.levelSelect(r, 'codigo', start); },
    destroy: function() { stop(); state = null; root = null; }
  };
})();