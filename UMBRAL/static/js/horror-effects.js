window.Horror = {
  screen: null, iv: null,
  init: function() {
    this.screen = document.getElementById('screen');
    this.apply();
    var self = this;
    if (this.iv) clearInterval(this.iv);
    this.iv = setInterval(function() {
      var s = Storage_.get('settings', {}) || {};
      if (s.reduceMotion || s.interferences === false) return;
      if (Math.random() < .25) self.glitch(320);
      else if (Math.random() < .15) self.flicker();
    }, 18000);
  },
  glitch: function(d) { if (!this.screen) return; var self = this; this.screen.classList.add('glitch'); setTimeout(function() { self.screen.classList.remove('glitch'); }, d || 340); },
  flicker: function() { if (!this.screen) return; var self = this; this.screen.classList.add('flicker'); setTimeout(function() { self.screen.classList.remove('flicker'); }, 520); },
  turnOff: function() { var self = this; return new Promise(function(r) { self.screen.classList.add('turnoff'); setTimeout(function() { self.screen.classList.remove('turnoff'); r(); }, 620); }); },
  turnOn: function() { var self = this; return new Promise(function(r) { self.screen.classList.add('turnon'); setTimeout(function() { self.screen.classList.remove('turnon'); r(); }, 720); }); },
  apply: function() {
    var s = Storage_.get('settings', {}) || {};
    var b = typeof s.brightness === 'number' ? s.brightness : 1;
    var c = typeof s.crtIntensity === 'number' ? s.crtIntensity : 1;
    var scan = s.scanlines === false ? 0 : 1;
    document.documentElement.style.setProperty('--brightness', b);
    document.documentElement.style.setProperty('--crt-intensity', c);
    document.documentElement.style.setProperty('--scanline-opacity', .18 * scan);
    document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
  }
};
window.initHorrorEffects = function() { Horror.init(); };