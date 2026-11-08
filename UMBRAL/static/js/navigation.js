window.Nav = (function() {
  var MODULES = {};
  var current = null;
  var currentId = null;
  var activeView = 'menu';
  var selectedIcon = null;

  var GAME_MUSIC = {
    gato:       'static/audio/gato.mp3',
    solitario:  'static/audio/solitario.mp3',
    memoria:    'static/audio/memoria.mp3',
    observador: 'static/audio/observador.mp3',
    codigo:     'static/audio/codigo.mp3',
    laberinto:  'static/audio/laberinto.mp3'
  };
  var MENU_MUSIC = 'static/audio/theme.mp3';

  function goTo(target) {
    var bootOverlay = document.getElementById('boot-overlay');
    if (bootOverlay) {
      if (target === 'boot') bootOverlay.classList.remove('hidden');
      else bootOverlay.classList.add('hidden');
    }

    var windows = document.querySelectorAll('.window');
    for (var i = 0; i < windows.length; i++) windows[i].classList.add('hidden');

    activeView = target;

    if (target !== 'menu' && target !== 'boot') {
      var w = document.getElementById('window-' + target);
      if (w) w.classList.remove('hidden');
    }

    updateTaskbar();

    var center = document.getElementById('mobile-center');
    if (center) {
      if (target === 'game' && currentId && GAMES[currentId]) center.textContent = GAMES[currentId].name;
      else if (target === 'settings') center.textContent = 'CONFIG';
      else center.textContent = 'ESCRITORIO';
    }

    var backBtn = document.getElementById('mobile-back');
    if (backBtn) backBtn.style.opacity = (target === 'menu') ? '0.4' : '1';
  }

  function updateTaskbar() {
    var tasksEl = document.getElementById('taskbar-tasks');
    if (!tasksEl) return;
    tasksEl.innerHTML = '';

    if (currentId && GAMES[currentId] && activeView === 'game') {
      tasksEl.appendChild(IU.el('button', {
        class: 'task-btn active',
        onclick: function() { goTo('game'); }
      }, GAMES[currentId].name + '.EXE'));
    }
    if (activeView === 'settings') {
      tasksEl.appendChild(IU.el('button', {
        class: 'task-btn active',
        onclick: function() { goTo('settings'); }
      }, 'CONFIG.SYS'));
    }
  }

  function handleNav(target) {
    try { playInterface('beep'); } catch (e) {}
    if (target !== 'game' && target !== 'settings') {
      close();
      if (target === 'menu') {
        try { AudioMgr.music(MENU_MUSIC); } catch (e) {}
      }
    }
    goTo(target);
    if (target === 'menu') renderMenu();
  }

  function selectIcon(node) {
    if (selectedIcon) selectedIcon.classList.remove('selected');
    selectedIcon = node;
    if (node) node.classList.add('selected');
  }

  function renderMenu() {
    var grid = document.getElementById('game-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (var id in GAMES) {
      (function(gid){
        var meta = GAMES[gid], p = Levels.get(gid);
        var icon = IU.el('div', {
          class: 'desktop-icon program',
          onclick: function(e) {
            e.stopPropagation();
            if (selectedIcon === icon) launch(gid);
            else selectIcon(icon);
          },
          ondblclick: function(e) {
            e.stopPropagation();
            launch(gid);
          }
        },
          IU.el('div', { class: 'desktop-icon-img' }, meta.icon),
          IU.el('div', { class: 'desktop-icon-label' }, meta.name),
          IU.el('div', { class: 'desktop-icon-sub' },
            gid.toUpperCase() + '.EXE · LVL ' + p.unlocked + ' (' + p.completed.length + '/' + meta.levels + ')')
        );
        grid.appendChild(icon);
      })(id);
    }

    var sys = [
      { icon: '⚙', label: 'CONFIGURACIÓN', sub: 'CONFIG.SYS', action: function() { handleNav('settings'); } },
      { icon: '?', label: 'INSTRUCCIONES', sub: 'AYUDA.TXT', action: function() { window.open('pages/instructions.html', '_blank'); } },
      { icon: '©', label: 'CRÉDITOS', sub: 'CREDITOS.TXT', action: function() { window.open('pages/credits.html', '_blank'); } },
      { icon: '⏻', label: 'APAGAR', sub: 'SHUTDOWN.BAT', action: function() {
          var p = document.getElementById('btn-power');
          if (p) p.click();
      } }
    ];
    for (var i = 0; i < sys.length; i++) {
      (function(si){
        var icon = IU.el('div', {
          class: 'desktop-icon system',
          onclick: function(e) {
            e.stopPropagation();
            if (selectedIcon === icon) si.action();
            else selectIcon(icon);
          },
          ondblclick: function(e) {
            e.stopPropagation();
            si.action();
          }
        },
          IU.el('div', { class: 'desktop-icon-img' }, si.icon),
          IU.el('div', { class: 'desktop-icon-label' }, si.label),
          IU.el('div', { class: 'desktop-icon-sub' }, si.sub)
        );
        grid.appendChild(icon);
      })(sys[i]);
    }

    var desktop = document.getElementById('desktop');
    if (desktop && !desktop.__hasClickHandler) {
      desktop.addEventListener('click', function(e) {
        if (e.target === desktop || e.target === grid) selectIcon(null);
      });
      desktop.__hasClickHandler = true;
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
    currentId = id;
    try { playInterface('beep'); } catch (e) {}
    goTo('game');

    var titleEl = document.getElementById('game-title');
    if (titleEl) titleEl.textContent = GAMES[id].name + '.EXE';
    var stEl = document.getElementById('game-status');
    if (stEl) stEl.textContent = 'RUNNING';

    var root = document.getElementById('game-root');
    root.innerHTML = '';
    root.dataset.game = id;

    try { AudioMgr.music(GAME_MUSIC[id] || MENU_MUSIC); } catch (e) {}

    try { mod.render(root); }
    catch (err) {
      console.error(err);
      root.innerHTML = '<p class="game-message">ERROR: MODULE FAILED — ' + (err && err.message ? err.message : err) + '</p>';
    }
  }

  function close() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) {} }
    current = null;
    currentId = null;
    var r = document.getElementById('game-root'); if (r) r.innerHTML = '';
  }

  function powerOff() {
    try { playInterface('beep'); } catch (e) {}
    close();
    try { AudioMgr.stopMusic(); } catch (e) {}
    Horror.turnOff().then(function() {
      var led = document.getElementById('power-led');
      if (led) led.classList.add('off');
      setTimeout(function() {
        if (led) led.classList.remove('off');
        Horror.turnOn().then(function() {
          IU.toast('SYSTEM RESTART');
          goTo('menu');
          renderMenu();
          try { AudioMgr.music(MENU_MUSIC); } catch (e) {}
        });
      }, 900);
    });
  }

  function bindGlobalDelegation() {
    document.addEventListener('click', function(e) {
      var t = e.target;
      if (t.closest('#game-back')) { e.preventDefault(); handleNav('menu'); return; }
      if (t.closest('#mobile-back')) { e.preventDefault(); if (activeView !== 'menu') handleNav('menu'); return; }
      if (t.closest('#start-btn')) { e.preventDefault(); if (activeView !== 'menu') handleNav('menu'); return; }
      if (t.closest('#btn-power')) { e.preventDefault(); powerOff(); return; }
      if (t.closest('#boot-skip')) return;
      var navBtn = t.closest('[data-nav]');
      if (navBtn) { e.preventDefault(); handleNav(navBtn.dataset.nav); return; }
    }, false);
  }

  function init() {
    MODULES.gato = window.GatoGame;
    MODULES.solitario = window.SolitarioGame;
    MODULES.memoria = window.MemoriaGame;
    MODULES.observador = window.ObservadorGame;
    MODULES.codigo = window.CodigoGame;
    MODULES.laberinto = window.LaberintoGame;

    IU.clock();
    renderMenu();
    bindGlobalDelegation();
    goTo('menu');

    try {
      AudioMgr.whenUnlocked(function() {
        AudioMgr.music(MENU_MUSIC);
        AudioMgr.ambient('static/audio/ambient.mp3');
      });
    } catch (e) {}
  }

  return { init: init, goTo: goTo, renderMenu: renderMenu, launch: launch };
})();
window.initNavigation = function() { Nav.init(); };