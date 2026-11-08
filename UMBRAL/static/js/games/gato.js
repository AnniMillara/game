(function() {
  var LEVELS = [
    { size: 9,  obs: 0, blocks: 22, time: 120 },
    { size: 11, obs: 0, blocks: 24, time: 110 },
    { size: 11, obs: 3, blocks: 26, time: 100 },
    { size: 13, obs: 3, blocks: 28, time: 90 },
    { size: 13, obs: 6, blocks: 30, time: 80 }
  ];
  var CAT_SYMBOL = '𑄝';
  var root = null, state = null, tick = null;

  function hexSizeFor(n) {
    var avail = window.innerWidth < 600 ? window.innerWidth - 80 : 520;
    var maxByWidth = Math.floor(avail / (n + 0.5));
    var ideal = n <= 9 ? 44 : n <= 11 ? 36 : 30;
    return Math.max(16, Math.min(ideal, maxByWidth));
  }

  function neighbors(r, c, R, C) {
    var nb;
    if (r % 2 === 0) nb = [[c+1,r],[c-1,r],[c-1,r-1],[c,r-1],[c-1,r+1],[c,r+1]];
    else nb = [[c+1,r],[c-1,r],[c,r-1],[c+1,r-1],[c,r+1],[c+1,r+1]];
    var out = [];
    for (var i = 0; i < nb.length; i++) {
      var nc = nb[i][0], nr = nb[i][1];
      if (nc >= 0 && nc < C && nr >= 0 && nr < R) out.push([nc, nr]);
    }
    return out;
  }

  function isEdge(r, c, R, C) { return r === 0 || r === R-1 || c === 0 || c === C-1; }

  function bfsEscape(grid, R, C, sx, sy) {
    var vis = [], par = [], i, j;
    for (i = 0; i < R; i++) { vis.push([]); par.push([]); for (j = 0; j < C; j++) { vis[i].push(false); par[i].push(null); } }
    var q = [[sx, sy]];
    vis[sy][sx] = true;
    while (q.length) {
      var cur = q.shift(), cx = cur[0], cy = cur[1];
      if (isEdge(cy, cx, R, C)) {
        var path = [], node = [cx, cy];
        while (node) { path.unshift({ x: node[0], y: node[1] }); node = par[node[1]][node[0]]; }
        return path;
      }
      var nb = neighbors(cy, cx, R, C);
      for (var k = 0; k < nb.length; k++) {
        var nx = nb[k][0], ny = nb[k][1];
        if (vis[ny][nx] || grid[ny][nx] === 1) continue;
        vis[ny][nx] = true;
        par[ny][nx] = [cx, cy];
        q.push([nx, ny]);
      }
    }
    return null;
  }

  function start(lvl) {
    var cfg = LEVELS[lvl-1], n = cfg.size, g = [], i, j;
    for (i = 0; i < n; i++) { g.push([]); for (j = 0; j < n; j++) g[i].push(0); }
    var catX = Math.floor(n/2), catY = Math.floor(n/2);
    var placed = 0, guard = 0;
    while (placed < cfg.obs && guard++ < 500) {
      var ox = 1 + Math.floor(Math.random() * (n-2));
      var oy = 1 + Math.floor(Math.random() * (n-2));
      if (g[oy][ox] !== 0) continue;
      if (Math.abs(ox-catX) <= 2 && Math.abs(oy-catY) <= 2) continue;
      g[oy][ox] = 2; placed++;
    }
    state = {
      level: lvl, size: n, grid: g,
      cat: { x: catX, y: catY },
      blocksLeft: cfg.blocks, moves: 0,
      timeLeft: cfg.time, finished: false, awaitingCat: false
    };
    Levels.recordAttempt('gato');
    draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; updateStatus();
      if (state.timeLeft <= 0) { stopTimer(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }

  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }

  function updateStatus() {
    var s = document.getElementById('g-st'); if (!s || !state) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'BLOQUEOS ', IU.el('span', { class: 'val' }, String(state.blocksLeft))));
    s.appendChild(IU.el('span', {}, 'TURNO ', IU.el('span', { class: 'val' }, String(state.moves))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }

  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var stage = IU.el('div', { class: 'gato-stage' });
    stage.appendChild(IU.el('div', { class: 'game-status', id: 'g-st' }));
    updateStatus();
    try {
      stage.appendChild(buildBoard());
    } catch (err) {
      stage.appendChild(IU.el('div', {
        style: { color: '#ff6a6a', padding: '20px', textAlign: 'center', fontFamily: 'monospace' }
      }, 'ERROR: ' + (err && err.message ? err.message : String(err))));
    }
    var actions = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' } });
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { stopTimer(); IU.levelSelect(root, 'gato', start); } }, '[ NIVELES ]'));
    stage.appendChild(actions);
    root.appendChild(stage);
  }

  function buildBoard() {
    var n = state.size;
    var sizeW = hexSizeFor(n);
    var sizeH = Math.round(sizeW * 1.1547);
    var rowGap = Math.round(sizeH * 0.75);
    var GAP = 3;
    var boardW = n * sizeW + Math.ceil(sizeW / 2) + GAP * 2;
    var boardH = (n - 1) * rowGap + sizeH + GAP * 2;

    var container = document.createElement('div');
    container.className = 'gato-board';
    container.style.position = 'relative';
    container.style.width = boardW + 'px';
    container.style.height = boardH + 'px';
    container.style.margin = '12px auto';

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        (function(rr, cc) {
          var isCat = state.cat.x === cc && state.cat.y === rr;
          var val = state.grid[rr][cc];

          var cell = document.createElement('div');
          cell.style.position = 'absolute';
          cell.style.left = (cc * sizeW + (rr % 2) * Math.floor(sizeW / 2) + GAP) + 'px';
          cell.style.top = (rr * rowGap + GAP) + 'px';
          cell.style.width = (sizeW - GAP) + 'px';
          cell.style.height = (sizeH - GAP) + 'px';
          cell.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontFamily = '"Noto Sans Chakma", "Segoe UI Historic", "Arial Unicode MS", monospace';
          cell.style.fontWeight = 'bold';
          cell.style.fontSize = Math.round((sizeW - GAP) * 0.55) + 'px';
          cell.style.userSelect = 'none';
          cell.style.transition = 'background .12s';

          if (isCat) {
            cell.style.background = 'var(--game-accent-bright, #f0c878)';
            cell.style.color = '#000';
            cell.textContent = CAT_SYMBOL;
          } else if (val === 1) {
            cell.style.background = 'var(--game-accent, #d4a04a)';
            cell.style.color = '#000';
            cell.textContent = '×';
          } else if (val === 2) {
            cell.style.background = 'rgba(120,120,120,0.4)';
            cell.style.color = 'rgba(255,255,255,0.4)';
            cell.textContent = '▒';
          } else {
            cell.style.background = 'rgba(74,58,26,0.5)';
            cell.style.color = 'var(--game-accent-bright, #f0c878)';
            cell.style.cursor = 'pointer';
            cell.addEventListener('mouseenter', function() { this.style.background = 'rgba(212,160,74,0.5)'; });
            cell.addEventListener('mouseleave', function() { this.style.background = 'rgba(74,58,26,0.5)'; });
          }

          cell.addEventListener('click', function() {
            onCellClick(cc, rr);
          });

          container.appendChild(cell);
        })(r, c);
      }
    }
    return container;
  }

  function onCellClick(c, r) {
    if (!state || state.finished || state.awaitingCat) return;
    if (state.cat.x === c && state.cat.y === r) return;
    if (state.grid[r][c] !== 0) return;
    if (state.blocksLeft <= 0) return;

    state.grid[r][c] = 1;
    state.blocksLeft--; state.moves++;
    playSfx('gato', 'block');
    updateStatus();

    var path = bfsEscape(state.grid, state.size, state.size, state.cat.x, state.cat.y);
    if (!path) {
      state.finished = true;
      draw();
      setTimeout(function() { finish(true, 'GATO ENCERRADO'); }, 300);
      return;
    }

    state.awaitingCat = true;
    draw();
    setTimeout(function() {
      if (!state || state.finished) return;
      if (path.length >= 2) {
        state.cat = { x: path[1].x, y: path[1].y };
        playSfx('gato', 'move');
        if (isEdge(state.cat.y, state.cat.x, state.size, state.size)) {
          state.finished = true;
          draw();
          setTimeout(function() { finish(false, 'EL GATO ESCAPÓ'); }, 300);
          return;
        }
      }
      state.awaitingCat = false;
      draw();
      if (typeof Screamer !== 'undefined' && Screamer.maybeTrigger) Screamer.maybeTrigger(1);
      if (state.blocksLeft <= 0) {
        var check = bfsEscape(state.grid, state.size, state.size, state.cat.x, state.cat.y);
        state.finished = true;
        if (!check) finish(true, 'GATO ENCERRADO');
        else finish(false, 'SIN BLOQUEOS');
      }
    }, 260);
  }

  function finish(won, msg) {
    stopTimer();
    var lvl = state.level;
    var isLast = lvl >= LEVELS.length;
    var nextLevel = (won && !isLast) ? lvl + 1 : null;
    var score = won ? Math.max(10, 200 * lvl - state.moves * 4 + state.timeLeft) : 0;
    var isRecord = won && Levels.isRecord('gato', lvl, score);
    var unlockedNew = false;

    if (won) {
      playSfx('gato', 'win');
      if (typeof Horror !== 'undefined' && Horror.glitch) Horror.glitch(320);
      if (Levels.tryComplete && Levels.tryComplete('gato', lvl, { score: score })) return;
      unlockedNew = nextLevel !== null;
    } else {
      playSfx('gato', 'lose');
    }

    var stats = [
      { label: 'NIVEL', value: String(lvl) },
      { label: 'TURNO', value: String(state.moves) },
      { label: 'TIEMPO', value: state.timeLeft + 's' }
    ];
    if (won) stats.push({ label: 'PUNTOS', value: String(score) });

    IU.showResult({
      won: won,
      message: msg,
      level: lvl,
      unlocked: unlockedNew,
      newRecord: isRecord,
      stats: stats,
      onNext: nextLevel ? function() { start(nextLevel); } : null,
      onRetry: function() { start(lvl); },
      onLevels: function() { IU.levelSelect(root, 'gato', start); }
    });
  }

  window.GatoGame = {
    render: function(r) { root = r; IU.levelSelect(r, 'gato', start); },
    destroy: function() { stopTimer(); state = null; root = null; }
  };
})();