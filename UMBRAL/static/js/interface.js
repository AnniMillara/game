window.IU = {
  el: function(tag, attrs) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v = attrs[k];
      if (v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'style' && typeof v === 'object') { for (var sk in v) node.style[sk] = v[sk]; }
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') { for (var dk in v) node.dataset[dk] = v[dk]; }
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'disabled' || k === 'checked' || k === 'readonly' || k === 'selected' || k === 'hidden' || k === 'required') {
        if (v) node.setAttribute(k, k);
      }
      else node.setAttribute(k, String(v));
    }
    for (var i = 2; i < arguments.length; i++) {
      var ch = arguments[i];
      if (ch == null) continue;
      if (ch.nodeType) node.appendChild(ch);
      else node.appendChild(document.createTextNode(String(ch)));
    }
    return node;
  },
  clock: function() {
    var el = document.getElementById('sys-clock'); if (!el) return;
    function pad(n){return String(n).padStart(2,'0');}
    function tick() {
      var d = new Date();
      el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    tick(); setInterval(tick, 1000);
  },
  toast: function(msg, ttl) {
    var layer = document.getElementById('toast-layer'); if (!layer) return;
    var n = IU.el('div', { class: 'toast' }, msg);
    layer.appendChild(n);
    setTimeout(function() { n.remove(); }, ttl || 2400);
  },
  levelSelect: function(root, id, onPick) {
    var total = GAMES[id].levels, p = Levels.get(id);
    root.innerHTML = '';
    root.appendChild(IU.el('div', { class: 'game-status' }, 'SELECCIONAR NIVEL'));
    var wrap = IU.el('div', { class: 'level-select' });
    for (var i = 1; i <= total; i++) {
      var unlocked = i <= p.unlocked;
      var comp = p.completed.indexOf(i) !== -1;
      var cls = 'level-btn' + (!unlocked ? ' locked' : comp ? ' completed' : '');
      (function(lvl, u){
        wrap.appendChild(IU.el('button', {
          class: cls, disabled: !u,
          onclick: function() { if (u) onPick(lvl); }
        }, String(lvl)));
      })(i, unlocked);
    }
    root.appendChild(wrap);
    // Botón volver al menú
    var actions = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' } });
    actions.appendChild(IU.el('button', {
      class: 'btn',
      onclick: function() { if (window.Nav) { Nav.goTo('menu'); Nav.renderMenu(); } }
    }, '[ VOLVER AL MENÚ ]'));
    root.appendChild(actions);
  },
  // Sistema UNIFICADO de resultados. Todos los juegos deben usarlo.
  showResult: function(opts) {
    var root = document.getElementById('game-root');
    if (!root) return;
    root.innerHTML = '';

    var wrap = IU.el('div', { class: 'result-screen' });

    // Header
    wrap.appendChild(IU.el('div', { class: 'result-header ' + (opts.won ? 'win' : 'lose') },
      opts.won ? 'PROGRAMA COMPLETADO' : 'PROGRAMA FALLIDO'));

    // Mensaje
    if (opts.message) wrap.appendChild(IU.el('div', { class: 'result-message' }, opts.message));

    // Nuevo nivel
    if (opts.unlocked) wrap.appendChild(IU.el('div', { class: 'result-unlocked' },
      '▶ NIVEL ' + (opts.level + 1) + ' DESBLOQUEADO'));

    // Nuevo récord
    if (opts.newRecord) wrap.appendChild(IU.el('div', { class: 'result-record' },
      '★ NUEVO RÉCORD'));

    // Stats
    if (opts.stats && opts.stats.length) {
      var stats = IU.el('div', { class: 'result-stats' });
      for (var i = 0; i < opts.stats.length; i++) {
        var s = opts.stats[i];
        stats.appendChild(IU.el('div', { class: 'result-stat' },
          IU.el('div', { class: 'lbl' }, s.label),
          IU.el('div', { class: 'val' }, s.value)
        ));
      }
      wrap.appendChild(stats);
    }

    // Botones
    var btns = IU.el('div', { class: 'result-buttons' });
    if (opts.onNext) btns.appendChild(IU.el('button', { class: 'btn btn-primary', onclick: opts.onNext }, '[ SIGUIENTE ]'));
    if (opts.onRetry) btns.appendChild(IU.el('button', { class: 'btn', onclick: opts.onRetry }, '[ REINTENTAR ]'));
    if (opts.onLevels) btns.appendChild(IU.el('button', { class: 'btn', onclick: opts.onLevels }, '[ NIVELES ]'));
    wrap.appendChild(btns);

    root.appendChild(wrap);
  },
  boot: function(logEl) {
    var lines = ['UMBRAL SYSTEM v1.0','','BOOT SEQUENCE...','VIDEO MEMORY: OK','AUDIO CHANNEL: OK','GAME MODULES: 06','SYSTEM STATUS: READY','','PRESS ENTER TO CONTINUE'];
    return new Promise(function(resolve) {
      logEl.textContent = '';
      var i = 0, cancelled = false;
      var skipBtn = document.getElementById('boot-skip');
      function finish() {
        if (skipBtn) skipBtn.removeEventListener('click', onSkip);
        document.removeEventListener('keydown', onKey);
        resolve();
      }
      function onSkip() { cancelled = true; logEl.textContent = lines.join('\n'); finish(); }
      function onKey(e) { if (e.key === 'Enter' || e.key === ' ') onSkip(); }
      if (skipBtn) skipBtn.addEventListener('click', onSkip);
      document.addEventListener('keydown', onKey);
      function tick() {
        if (cancelled) return;
        if (i >= lines.length) { finish(); return; }
        logEl.textContent += lines[i] + '\n';
        i++;
        setTimeout(tick, i === 1 ? 260 : 200);
      }
      tick();
    });
  }
};