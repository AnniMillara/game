(function() {
  // NUEVA MECÁNICA: memorizar escena → detectar anomalías
  // El jugador ve la habitación limpia, la memoriza, la escena "cambia",
  // y debe hacer clic sobre los objetos que hayan cambiado.
  var SCENES = {
    hab: {
      items: [
        { id:'w',     x:0,  y:0,  w:100,h:100,bg:'rgba(48,66,56,.15)' },
        { id:'win',   x:8,  y:10, w:22, h:22, bg:'rgba(109,255,139,.10)', bd:1, label:'ventana' },
        { id:'bed',   x:5,  y:60, w:35, h:25, bg:'rgba(48,66,56,.4)',    bd:1, label:'cama' },
        { id:'lamp',  x:62, y:8,  w:8,  h:18, bg:'rgba(109,255,139,.2)', bd:1, label:'lámpara' },
        { id:'table', x:45, y:50, w:22, h:15, bg:'rgba(48,66,56,.35)',   bd:1, label:'mesa' },
        { id:'chair', x:72, y:55, w:10, h:18, bg:'rgba(48,66,56,.4)',    bd:1, label:'silla' },
        { id:'pic',   x:38, y:15, w:14, h:14, bg:'rgba(155,216,166,.15)',bd:1, label:'cuadro' },
        { id:'clock', x:78, y:30, w:8,  h:8,  bg:'rgba(109,255,139,.2)', bd:1, label:'reloj' },
        { id:'plant', x:88, y:62, w:8,  h:30, bg:'rgba(48,66,56,.5)',    bd:1, label:'planta' },
        { id:'rug',   x:20, y:82, w:45, h:8,  bg:'rgba(109,255,139,.08)',label:'alfombra' }
      ],
      diffs: [
        { id:'win',   bg:'rgba(109,255,139,.3)' },
        { id:'lamp',  h:30 },
        { id:'pic',   w:22 },
        { id:'clock', bg:'rgba(109,255,139,.5)' },
        { id:'plant', h:45 },
        { id:'chair', x:60 },
        { id:'table', y:40 }
      ]
    },
    ofi: {
      items: [
        { id:'w',     x:0,  y:0,  w:100,h:100,bg:'rgba(48,66,56,.15)' },
        { id:'desk',  x:10, y:55, w:70, h:25, bg:'rgba(48,66,56,.4)',   bd:1, label:'escritorio' },
        { id:'mon',   x:30, y:35, w:22, h:18, bg:'rgba(109,255,139,.15)',bd:1,label:'monitor' },
        { id:'kb',    x:32, y:54, w:18, h:4,  bg:'rgba(155,216,166,.15)',bd:1,label:'teclado' },
        { id:'shelf', x:85, y:15, w:12, h:55, bg:'rgba(48,66,56,.3)',   bd:1, label:'estante' },
        { id:'paper', x:60, y:50, w:8,  h:6,  bg:'rgba(155,216,166,.15)',bd:1,label:'papel' },
        { id:'lamp2', x:8,  y:42, w:8,  h:14, bg:'rgba(109,255,139,.2)',bd:1, label:'lámpara' },
        { id:'door',  x:0,  y:20, w:4,  h:40, bg:'rgba(48,66,56,.3)',   bd:1, label:'puerta' },
        { id:'cl2',   x:45, y:10, w:8,  h:8,  bg:'rgba(109,255,139,.15)',bd:1,label:'reloj' },
        { id:'pl2',   x:78, y:70, w:8,  h:25, bg:'rgba(48,66,56,.4)',   bd:1, label:'planta' }
      ],
      diffs: [
        { id:'mon',   bg:'rgba(155,216,166,.25)' },
        { id:'kb',    w:26 },
        { id:'shelf', h:40 },
        { id:'paper', w:14 },
        { id:'lamp2', h:22 },
        { id:'pl2',   h:40 },
        { id:'door',  y:25 }
      ]
    },
    pas: {
      items: [
        { id:'floor', x:0,  y:65, w:100,h:35,bg:'rgba(48,66,56,.2)' },
        { id:'d1',    x:8,  y:30, w:14, h:35, bg:'rgba(48,66,56,.35)',bd:1, label:'puerta' },
        { id:'d2',    x:30, y:30, w:14, h:35, bg:'rgba(48,66,56,.35)',bd:1, label:'puerta' },
        { id:'d3',    x:52, y:30, w:14, h:35, bg:'rgba(48,66,56,.35)',bd:1, label:'puerta' },
        { id:'d4',    x:74, y:30, w:14, h:35, bg:'rgba(48,66,56,.35)',bd:1, label:'puerta' },
        { id:'exit',  x:92, y:30, w:8,  h:35, bg:'rgba(109,255,139,.2)',bd:1,label:'salida' },
        { id:'light', x:40, y:8,  w:20, h:5,  bg:'rgba(109,255,139,.25)',label:'luz' },
        { id:'sign',  x:50, y:20, w:8,  h:5,  bg:'rgba(155,216,166,.15)',bd:1,label:'letrero' },
        { id:'box',   x:24, y:78, w:10, h:10, bg:'rgba(48,66,56,.4)',   bd:1, label:'caja' }
      ],
      diffs: [
        { id:'d1',    bg:'rgba(109,255,139,.35)' },
        { id:'d3',    w:20 },
        { id:'exit',  bg:'rgba(109,255,139,.55)' },
        { id:'light', w:30 },
        { id:'sign',  h:10 },
        { id:'box',   w:16 },
        { id:'d2',    y:20 }
      ]
    }
  };

  var LEVELS = [
    { scene:'hab', diffs:3, memorize:8, time:60 },
    { scene:'ofi', diffs:4, memorize:7, time:55 },
    { scene:'pas', diffs:5, memorize:6, time:50 },
    { scene:'hab', diffs:6, memorize:5, time:45 },
    { scene:'ofi', diffs:7, memorize:5, time:40 }
  ];

  var root = null, state = null, tick = null;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function start(lvl) {
    var c = LEVELS[lvl-1], sc = SCENES[c.scene];
    var diffs = shuffle(sc.diffs.slice()).slice(0, c.diffs);
    state = {
      level: lvl,
      items: sc.items,
      diffs: diffs,
      found: {},
      errors: 0,
      phase: 'memorize',
      memorizeLeft: c.memorize,
      playLeft: c.time,
      finished: false
    };
    Levels.recordAttempt('observador');
    draw();
    if (tick) clearInterval(tick);
    tick = setInterval(function() {
      if (!state || state.finished) return;
      if (state.phase === 'memorize') {
        state.memorizeLeft--;
        updateHUD();
        if (state.memorizeLeft <= 0) {
          state.phase = 'play';
          Horror.glitch(220);
          draw();
        }
      } else if (state.phase === 'play') {
        state.playLeft--;
        updateHUD();
        if (state.playLeft <= 0) finish(false, 'TIEMPO AGOTADO');
      }
    }, 1000);
  }

  function stop() { if (tick) { clearInterval(tick); tick = null; } }

  function updateHUD() {
    var phaseEl = document.getElementById('o-phase');
    var timeEl = document.getElementById('o-time');
    var timerEl = document.getElementById('o-timer');
    if (!state) return;
    if (phaseEl) {
      phaseEl.textContent = state.phase === 'memorize' ? 'MEMORIZA' : 'DETECTA ANOMALÍAS';
    }
    if (timeEl) {
      timeEl.textContent = (state.phase === 'memorize' ? state.memorizeLeft : state.playLeft) + 's';
    }
    if (timerEl) {
      var total = state.phase === 'memorize' ? state.memorizeLeft : state.playLeft;
      var maxTime = state.phase === 'memorize' ? LEVELS[state.level-1].memorize : LEVELS[state.level-1].time;
      var pct = Math.max(0, (total / maxTime) * 100);
      timerEl.style.width = pct + '%';
      timerEl.classList.toggle('warn', pct < 30);
    }
  }

  function buildScene() {
    var wrap = document.createElement('div');
    wrap.className = 'obs-scene';
    if (state.phase === 'memorize') wrap.classList.add('phase-memorize');
    if (state.phase === 'play') wrap.classList.add('play');

    var overrides = state.phase === 'play' ? state.diffs : [];

    for (var i = 0; i < state.items.length; i++) {
      (function(item) {
        var ov = null;
        for (var k = 0; k < overrides.length; k++) {
          if (overrides[k].id === item.id) { ov = overrides[k]; break; }
        }
        var n = document.createElement('div');
        n.className = 'obs-item';
        n.dataset.id = item.id;
        n.title = item.label || '';
        n.style.left = item.x + '%';
        n.style.top = item.y + '%';
        n.style.width = item.w + '%';
        n.style.height = item.h + '%';
        n.style.background = item.bg || 'transparent';
        if (item.bd) n.style.border = '1px solid var(--terminal-mid)';
        if (ov) {
          if (ov.bg) n.style.background = ov.bg;
          if (ov.w != null) n.style.width = ov.w + '%';
          if (ov.h != null) n.style.height = ov.h + '%';
          if (ov.x != null) n.style.left = ov.x + '%';
          if (ov.y != null) n.style.top = ov.y + '%';
        }
        if (state.found[item.id]) n.classList.add('found');
        if (state.phase === 'play') {
          n.classList.add('clickable');
          n.addEventListener('click', function(e) {
            e.stopPropagation();
            handleClick(item.id);
          });
        }
        wrap.appendChild(n);
      })(state.items[i]);
    }
    return wrap;
  }

  function draw() {
    if (!root) return;
    root.innerHTML = '';

    var stage = IU.el('div', { class: 'obs-stage' });

    // HUD
    var hud = IU.el('div', { class: 'obs-hud' });
    hud.appendChild(IU.el('span', { class: 'obs-phase', id: 'o-phase' },
      state.phase === 'memorize' ? 'MEMORIZA' : 'DETECTA ANOMALÍAS'));
    hud.appendChild(IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(state.level))));
    hud.appendChild(IU.el('span', {}, 'ENCONTRADAS ',
      IU.el('span', { class: 'val' }, Object.keys(state.found).length + '/' + state.diffs.length)));
    hud.appendChild(IU.el('span', {}, 'TIEMPO ', IU.el('span', { class: 'val', id: 'o-time' }, '--')));
    stage.appendChild(hud);

    // Escena
    var sceneWrap = IU.el('div', { class: 'obs-scene-wrap' });
    sceneWrap.appendChild(buildScene());
    stage.appendChild(sceneWrap);

    // Timer bar
    var bar = IU.el('div', { class: 'obs-timer-bar' });
    bar.appendChild(IU.el('span', { class: 'obs-timer-fill', id: 'o-timer' }));
    stage.appendChild(bar);

    // Mensaje de ayuda
    var helpText = state.phase === 'memorize'
      ? 'Memoriza la escena. Después se alterará y deberás encontrar los objetos que cambiaron.'
      : 'Haz clic sobre los objetos que hayan cambiado.';
    stage.appendChild(IU.el('div', { class: 'obs-message' }, helpText));

    // Botones
    var actions = IU.el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' } });
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { start(state.level); } }, '[ REINICIAR ]'));
    actions.appendChild(IU.el('button', { class: 'btn', onclick: function() { stop(); IU.levelSelect(root, 'observador', start); } }, '[ NIVELES ]'));
    stage.appendChild(actions);

    root.appendChild(stage);
    updateHUD();
  }

  function handleClick(itemId) {
    if (!state || state.phase !== 'play' || state.finished) return;
    if (state.found[itemId]) return;

    var isDiff = false;
    for (var i = 0; i < state.diffs.length; i++) {
      if (state.diffs[i].id === itemId) { isDiff = true; break; }
    }

    if (!isDiff) {
      // Error: no es una diferencia
      state.errors++;
      playSfx('observador', 'error');
      Horror.flicker();
      var el = document.querySelector('.obs-item[data-id="' + itemId + '"]');
      if (el) {
        el.style.filter = 'brightness(2) hue-rotate(90deg)';
        setTimeout(function() {
          if (el) el.style.filter = '';
        }, 300);
      }
      return;
    }

    state.found[itemId] = true;
    playSfx('observador', 'found');
    var el = document.querySelector('.obs-item[data-id="' + itemId + '"]');
    if (el) el.classList.add('found');

    if (Object.keys(state.found).length === state.diffs.length) {
      finish(true, 'TODAS LAS ANOMALÍAS DETECTADAS');
    }
  }

  function finish(won, msg) {
    if (!state || state.finished) return;
    state.finished = true;
    stop();

    var lvl = state.level;
    var isLast = lvl >= LEVELS.length;
    var nextLevel = (won && !isLast) ? lvl + 1 : null;
    var elapsed = LEVELS[lvl-1].memorize + LEVELS[lvl-1].time - state.memorizeLeft - state.playLeft;
    var score = won ? Math.max(10, 300 - elapsed * 2 - state.errors * 20) : 0;
    var isRecord = won && Levels.isRecord('observador', lvl, score);
    var unlockedNew = false;

    if (won) {
      playSfx('observador', 'level');
      if (Levels.tryComplete && Levels.tryComplete('observador', lvl, { score: score, time: elapsed })) return;
      // tryComplete ya llamó a complete
      unlockedNew = nextLevel !== null;
    }

    var stats = [
      { label: 'NIVEL', value: String(lvl) },
      { label: 'TIEMPO', value: elapsed + 's' },
      { label: 'ANOMALÍAS', value: Object.keys(state.found).length + '/' + state.diffs.length },
      { label: 'ERRORES', value: String(state.errors) }
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
      onLevels: function() { IU.levelSelect(root, 'observador', start); }
    });
  }

  window.ObservadorGame = {
    render: function(r) { root = r; IU.levelSelect(r, 'observador', start); },
    destroy: function() { stop(); state = null; root = null; }
  };
})();