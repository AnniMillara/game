(function() {
  var LEVELS = [{ cells:8, time:120, vis:4 }, { cells:10, time:120, vis:3 }, { cells:12, time:100, vis:3 }, { cells:14, time:90, vis:2 }, { cells:16, time:80, vis:2 }];
  var root = null, state = null, tick = null, keyH = null;
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gen(cells) {
    var size = cells * 2 + 1, g = [], vis = [], i, j;
    for (i = 0; i < size; i++) { g.push([]); vis.push([]); for (j = 0; j < size; j++) { g[i].push(1); vis[i].push(false); } }
    var st = [[0,0]]; vis[0][0] = true; g[1][1] = 0;
    while (st.length) {
      var c = st[st.length-1], dirs = shuffle([[0,1],[1,0],[0,-1],[-1,0]]), moved = false;
      for (var d = 0; d < 4; d++) {
        var nx = c[0]+dirs[d][0], ny = c[1]+dirs[d][1];
        if (nx<0||ny<0||nx>=cells||ny>=cells||vis[ny][nx]) continue;
        vis[ny][nx] = true;
        g[c[1]*2+1+dirs[d][1]][c[0]*2+1+dirs[d][0]] = 0;
        g[ny*2+1][nx*2+1] = 0;
        st.push([nx,ny]); moved = true; break;
      }
      if (!moved) st.pop();
    }
    return g;
  }
  function start(lvl) {
    var c = LEVELS[lvl-1], g = gen(c.cells), size = g.length;
    state = { level: lvl, grid: g, size: size, player: { x:1, y:1 }, exit: { x: size-2, y: size-2 }, vis: c.vis, timeLeft: c.time, finished: false, startMs: Date.now() };
    Levels.recordAttempt('laberinto'); draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      state.timeLeft--; update();
      if (state.timeLeft <= 0) { stop(); finish(false, 'SIN TIEMPO'); }
    }, 1000);
    if (keyH) document.removeEventListener('keydown', keyH);
    keyH = function(e) {
      var k = e.key.toLowerCase(), dx = 0, dy = 0;
      if (k === 'arrowup' || k === 'w') dy = -1;
      else if (k === 'arrowdown' || k === 's') dy = 1;
      else if (k === 'arrowleft' || k === 'a') dx = -1;
      else if (k === 'arrowright' || k === 'd') dx = 1;
      else return;
      e.preventDefault(); move(dx, dy);
    };
    document.addEventListener('keydown', keyH);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; } }
  function update() {
    var s = document.getElementById('l-st'); if (!s) return;
    s.innerHTML = '';
    s.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    s.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val' }, state.timeLeft + 's')));
    s.appendChild(IU.el('span', {}, 'POS ', IU.el('span', { class: 'val' }, state.player.x + ',' + state.player.y)));
  }
  function move(dx, dy) {
    if (!state || state.finished) return;
    var nx = state.player.x + dx, ny = state.player.y + dy;
    if (nx<0||ny<0||nx>=state.size||ny>=state.size) { playSfx('laberinto', 'wall'); return; }
    if (state.grid[ny][nx] === 1) { playSfx('laberinto', 'wall'); return; }
    state.player = { x: nx, y: ny };
    playSfx('laberinto', dx !== 0 ? 'side' : 'move');
    if (nx === state.exit.x && ny === state.exit.y) { finish(true, 'SALIDA'); return; }
    draw(); Screamer.maybeTrigger(.6);
  }
  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var wrap = IU.el('div', { class: 'lab-root' });
    wrap.appendChild(IU.el('div', { class: 'game-status', id: 'l-st' })); update();
    var g = IU.el('div', { class: 'lab-grid' }); g.style.gridTemplateColumns = 'repeat(' + state.size + ',1fr)';
    for (var y = 0; y < state.size; y++) for (var x = 0; x < state.size; x++) {
      var dx = x - state.player.x, dy = y - state.player.y;
      var dist = Math.sqrt(dx*dx + dy*dy), visible = dist <= state.vis;
      var wall = state.grid[y][x] === 1, isP = x === state.player.x && y === state.player.y;
      var isE = x === state.exit.x && y === state.exit.y;
      var cls = 'lab-cell';
      if (isP) cls += ' player';
      else if (isE && visible) cls += ' exit';
      else if (visible) { cls += ' visible'; if (wall) cls += ' wall'; }
      else if (wall) cls += ' wall';
      g.appendChild(IU.el('div', { class: cls }));
    }
    wrap.appendChild(g);
    wrap.appendChild(IU.el('div', { class: 'lab-help' }, 'WASD / FLECHAS - ENCUENTRA LA SALIDA'));
    wrap.appendChild(IU.el('div', { class: 'game-message', id: 'l-msg' }, ' '));
    var a = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    a.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'laberinto', start); } }, '[ NIVELES ]'));
    wrap.appendChild(a);
    root.appendChild(wrap);
  }
  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true; stop();
    var m = document.getElementById('l-msg'); if (m) m.textContent = msg;
    if (won) { playSfx('laberinto', 'exit'); var t = Math.floor((Date.now() - state.startMs) / 1000); Levels.complete('laberinto', state.level, { score: Math.max(10, 500 - t * 2), time: t }); }
  }
  window.LaberintoGame = { render: function(r) { root = r; IU.levelSelect(r, 'laberinto', start); }, destroy: function() { stop(); state = null; root = null; } };
})();