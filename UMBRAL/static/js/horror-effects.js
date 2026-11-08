/* Efectos visuales sutiles. SIN schedulers de terror.
   Solo utilidades: encendido, apagado, estática. */
window.Horror = {
  screen: null,

  init: function() {
    this.screen = document.getElementById('screen');
    this.apply();
  },

  glitch: function(d) {
    if (!this.screen) return;
    var self = this;
    this.screen.classList.add('glitch');
    setTimeout(function() { self.screen.classList.remove('glitch'); }, d || 220);
  },

  flicker: function() {
    if (!this.screen) return;
    var self = this;
    this.screen.classList.add('flicker');
    setTimeout(function() { self.screen.classList.remove('flicker'); }, 400);
  },

  turnOff: function() {
    var self = this;
    return new Promise(function(r) {
      self.screen.classList.add('turnoff');
      setTimeout(function() { self.screen.classList.remove('turnoff'); r(); }, 620);
    });
  },
  turnOn: function() {
    var self = this;
    return new Promise(function(r) {
      self.screen.classList.add('turnon');
      setTimeout(function() { self.screen.classList.remove('turnon'); r(); }, 720);
    });
  },

  static: function(duration) {
    var layer = document.getElementById('static-overlay');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'static-overlay';
      layer.className = 'static-overlay';
      document.body.appendChild(layer);
    }
    layer.classList.remove('active');
    void layer.offsetWidth;
    layer.classList.add('active');
    setTimeout(function() { layer.classList.remove('active'); }, duration || 800);
  },

  /* Nunca se llama por defecto, pero se deja por si el usuario lo activa */
  systemHalt: function() {
    var self = this;
    if (!self.screen) return;
    self.screen.classList.add('turnoff');
    setTimeout(function() {
      self.screen.classList.remove('turnoff');
      self.screen.classList.add('halt');
      var allViews = document.querySelectorAll('.view');
      for (var i = 0; i < allViews.length; i++) allViews[i].classList.add('hidden');
      var haltScreen = document.getElementById('view-halt');
      if (!haltScreen) {
        haltScreen = document.createElement('section');
        haltScreen.id = 'view-halt';
        haltScreen.className = 'view halt-screen';
        haltScreen.innerHTML = '<pre class="halt-text">SIGNAL LOST\n\nSYSTEM HALT</pre>';
        document.getElementById('screen-content').appendChild(haltScreen);
      }
      haltScreen.classList.remove('hidden');
      setTimeout(function() {
        haltScreen.classList.add('hidden');
        self.screen.classList.remove('halt');
        if (window.Nav) { Nav.goTo('menu'); Nav.renderMenu(); }
      }, 3000);
    }, 700);
  },

  apply: function() {
    var s = Storage_.get('settings', {}) || {};
    var b = typeof s.brightness === 'number' ? s.brightness : 1;
    var c = typeof s.crtIntensity === 'number' ? s.crtIntensity : 0.3;
    var scan = s.scanlines === false ? 0 : 1;
    document.documentElement.style.setProperty('--brightness', b);
    document.documentElement.style.setProperty('--crt-intensity', c);
    document.documentElement.style.setProperty('--scanline-opacity', 0.05 * scan);
    document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
  }
};
window.initHorrorEffects = function() { Horror.init(); };