window.Nav = (function() {
  var MODULES = {};
  var current = null;
  function goTo(v) {
    var all = document.querySelectorAll('.view');
    for (var i = 0; i < all.length; i++) all[i].classList.add('hidden');
    var t = document.getElementById('view-' + v);
    if (t) t.classList.remove('hidden');
  }
  function renderMenu() {
    var grid = document.getElementById('game-grid'); if (!grid) return;
    grid.innerHTML = '';
    var idx = 0;
    for (var id in GAMES) {
      idx++;
      var meta = GAMES[id], p = Levels.get(id);
      (function(gid){
        var card = IU.el('article', { class: 'game-card' },
          IU.el('div', { class: 'game-card-num' }, 'MODULE 0' + idx),
          IU.el('div', { class: 'game-card-icon' }, meta.icon),
          IU.el('h3', { class: 'game-card-title' }, meta.name),
          IU.el('p', { class: 'game-card-desc' }, meta.desc),
          IU.el('div', { class: 'game-card-meta' },
            IU.el('span', {}, 'NIVEL ', IU.el('span', { class: 'val' }, String(p.unlocked))),
            IU.el('span', {}, p.completed.length + '/' + meta.levels)),
          IU.el('button', { class: 'btn', onclick: function(e) { e.stopPropagation(); launch(gid); } }, '[ EJECUTAR ]')
        );
        grid.appendChild(card);
      })(id);
    }
    var pct = Levels.globalPercent();
    var fill = document.getElementById('global-progress'); if (fill) fill.style.width = pct + '%';
    var txt = document.getElementById('global-progress-text'); if (txt) txt.textContent = pct + '%';
    var st = document.getElementById('sys-status'); if (st) st.textContent = 'READY';
  }
  function launch(id) {
    var mod = MODULES[id]; if (!mod) return;
    close();
    current = mod;
    playInterface('beep'); goTo('game');
    document.getElementById('game-title').textContent = GAMES[id].name;
    document.getElementById('game-status').textContent = 'RUNNING';
    var root = document.getElementById('game-root'); root.innerHTML = '';
    try { mod.render(root); } catch (err) { console.error(err); root.innerHTML = '<p class="game-message">ERROR: MODULE FAILED</p>'; }
  }
  function close() { if (current && current.destroy) { try { current.destroy(); } catch (e) {} } current = null; var r = document.getElementById('game-root'); if (r) r.innerHTML = ''; }
  function bind() {
    document.getElementById('game-back').addEventListener('click', function() { close(); goTo('menu'); renderMenu(); });
    var power = document.getElementById('btn-power');
    if (power) power.addEventListener('click', function() {
      playInterface('beep'); close(); AudioMgr.stopMusic();
      Horror.turnOff().then(function() {
        var led = document.getElementById('power-led'); if (led) led.classList.add('off');
        setTimeout(function() {
          if (led) led.classList.remove('off');
          Horror.turnOn().then(function() { IU.toast('SYSTEM RESTART'); goTo('menu'); renderMenu(); });
        }, 900);
      });
    });
    var navs = document.querySelectorAll('[data-nav]');
    for (var i = 0; i < navs.length; i++) {
      (function(b){
        b.addEventListener('click', function() {
          playInterface('beep'); goTo(b.dataset.nav);
          if (b.dataset.nav === 'menu') renderMenu();
        });
      })(navs[i]);
    }
  }
  function init() {
    MODULES.gato = GatoGame; MODULES.solitario = SolitarioGame; MODULES.memoria = MemoriaGame;
    MODULES.observador = ObservadorGame; MODULES.codigo = CodigoGame; MODULES.laberinto = LaberintoGame;
    IU.clock(); renderMenu(); bind();
    AudioMgr.whenUnlocked(function() {
      AudioMgr.music('static/audio/music/theme.mp3');
      AudioMgr.ambient('static/audio/ambient/hum.mp3');
    });
  }
  return { init: init, goTo: goTo, renderMenu: renderMenu, launch: launch };
})();
window.initNavigation = function() { Nav.init(); };