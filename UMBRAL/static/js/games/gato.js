(function() {
  var LEVELS = [
    { size:5, obs:0, time:90 }, { size:7, obs:0, time:90 },
    { size:7, obs:2, time:75 }, { size:9, obs:2, time:75 },
    { size:9, obs:4, time:60 }
  ];
  var root = null, state = null, tick = null;
  function bfs(grid, sx, sy) {
    var n = grid.length;
    var vis = [], par = [], i, j;
    for (i = 0; i < n; i++) { vis.push([]); par.push([]); for (j = 0; j < n; j++) { vis[i].push(false); par[i].push(null); } }
    var q = [{ x: sx, y: sy }]; vis[sy][sx] = true;
    var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    while (q.length) {
      var c = q.shift();
      if (c.x === 0 || c.y === 0 || c.x === n-1 || c.y === n-1) {
        var path = [], cur = { x: c.x, y: c.y };
        while (cur) { path.unshift(cur); cur = par[cur.y][cur.x]; }
        return path;
      }
      for (var d = 0; d < 4; d++) {
        var nx = c.x + dirs[d][0], ny = c.y + dirs[d][1];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        if (vis[ny][nx] || grid[ny][nx] === 1) continue;
        vis[ny][nx] = true; par[ny][nx] = { x: c.x, y: c.y };
        q.push({ x: nx, y: ny });
      }
    }
    return null;
  }
  function start(lvl) {
    var c = LEVELS[lvl-1], n = c.size, g = [], i, j;
    for (i = 0; i < n; i++) { g.push([]); for (j = 0; j < n; j++) g[i].push(0); }
    var placed = 0;
    while (placed < c.obs) {
      var ox = 1 + Math.floor(Math.random() * (n-2)), oy = 1 + Math.floor(Math.random() * (n-2));
      if (g[oy][ox] === 0 && !(ox === (n>>1) && oy === (n>>1))) { g[oy][ox] = 2; placed++; }
    }
    state = { level: lvl, size: n, grid: g, cat: { x: n>>1, y: n>>1 }, moves: 0, blocks: 0, timeLeft: c.time, finished: false };
    Levels.recordAttempt('gato'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'TIEMPO AGOTADO'); }
    }, 1000);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function update() {
    var s = document.getElementById('g-st');
    if (!s) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'MOVS ', IU.el('span', { class: 'val' }, String(state.moves))));
    s.appendChild(IU.el('span', {}, 'BLOQ ', IU.el('span', { class: 'val' }, String(state.blocks))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(IU.el('div', { class: 'game-status', id: 'g-st' }));
    update();
    var b = IU.el('div', { class: 'gato-board' });
    b.style.gridTemplateColumns = 'repeat(' + state.size + ',1fr)';
    for (var y = 0; y < state.size; y++) for (var x = 0; x < state.size; x++) {
      var isCat = state.cat.x === x && state.cat.y === y;
      var v = state.grid[y][x], cls = 'gato-cell', txt = '';
      if (isCat) { cls += ' cat'; txt = 'Ψ'; }
      else if (v === 1) { cls += ' blocked'; txt = '×'; }
      else if (v === 2) { cls += ' obstacle'; txt = '▒'; }
      (function(cx, cy){ b.appendChild(IU.el('div', { class: cls, onclick: function() { block(cx, cy); } }, txt)); })(x, y);
    }
    root.appendChild(b);
    root.appendChild(IU.el('div', { class: 'game-message', id: 'g-msg' }, ' '));
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'gato', start); } }, '[ NIVELES ]'));
    root.appendChild(a);
  }
  function block(x, y) {
    if (!state || state.finished) return;
    if (state.cat.x === x && state.cat.y === y) return;
    if (state.grid[y][x] !== 0) return;
    state.grid[y][x] = 1; state.blocks++; state.moves++;
    playSfx('gato', 'block');
    var path = bfs(state.grid, state.cat.x, state.cat.y);
    if (!path) { state.finished = true; draw(); finish(true, 'GATO ENCERRADO'); return; }
    if (path.length >= 2) {
      state.cat = { x: path[1].x, y: path[1].y };
      playSfx('gato', 'move');
      if (state.cat.x === 0 || state.cat.y === 0 || state.cat.x === state.size-1 || state.cat.y === state.size-1) {
        state.finished = true; draw(); finish(false, 'GATO ESCAPO'); return;
      }
    }
    draw(); Screamer.maybeTrigger(1);
  }
  function finish(won, msg) {
    stop();
    var m = document.getElementById('g-msg'); if (m) m.textContent = msg;
    if (won) { playSfx('gato', 'win'); Levels.complete('gato', state.level, { score: Math.max(10, 100 * state.level - state.moves * 2) }); Horror.glitch(300); if (state.level < 5) setTimeout(function() { IU.toast('NIVEL ' + (state.level+1) + ' DESBLOQUEADO'); }, 400); }
    else playSfx('gato', 'lose');
    if (m) {
      var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
      a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINTENTAR ]'));
      a.appendChild(IU.el('button', { class: 'btn', onclick: function() { IU.levelSelect(root, 'gato', start); } }, '[ NIVELES ]'));
      m.appendChild(a);
    }
  }
  window.GatoGame = { render: function(r) { root = r; IU.levelSelect(r, 'gato', start); }, destroy: function() { stop(); state = null; root = null; } };
})();