window.AudioMgr = {
  s: { master: .7, music: .5, sfx: .7, ambient: .5, enabled: true, randomEvents: true },
  musicEl: null, ambEl: null, current: null, unlocked: false, _cb: null,
  randomIv: null, eventTimers: [],
  currentMusicBase: null,

  init: function() {
    var saved = Storage_.get('audio', null);
    if (saved) for (var k in saved) this.s[k] = saved[k];
    var self = this;
    var unlock = function() {
      self.unlocked = true;
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      if (self._cb) self._cb();
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  },

  whenUnlocked: function(cb) { if (this.unlocked) cb(); else this._cb = cb; },
  save: function() { Storage_.set('audio', this.s); },
  set: function(k, v) { if (k in this.s) { this.s[k] = v; this.save(); this.apply(); } },

  apply: function() {
    var vol = function(chan) {
      return Math.max(0, Math.min(1, AudioMgr.s.enabled ? AudioMgr.s.master * chan : 0));
    };
    if (this.musicEl) this.musicEl.volume = vol(this.s.music);
    if (this.ambEl) this.ambEl.volume = vol(this.s.ambient);
  },

  sfx: function(path) {
    if (!path || !this.s.enabled) return;
    try {
      var a = new Audio(path);
      a.volume = Math.max(0, Math.min(1, this.s.master * this.s.sfx));
      a.addEventListener('error', function(){});
      a.play().catch(function(){});
    } catch (e) {}
  },

  music: function(path) {
    if (!path) return;
    if (this.current === path && this.musicEl && !this.musicEl.paused) return;
    this.stopMusic();
    this.current = path;
    this.currentMusicBase = path;
    try {
      var a = new Audio(path);
      a.loop = true;
      a.volume = 0;
      a.addEventListener('error', function(){});
      this.musicEl = a;
      a.play().then((function(self){ return function(){ self.apply(); }; })(this)).catch(function(){});
      this.fadeIn(a, Math.min(1, this.s.master * this.s.music), 1200);
    } catch (e) {}
  },

  stopMusic: function() {
    if (this.musicEl) { try { this.musicEl.pause(); } catch (e) {} this.musicEl = null; this.current = null; }
  },

  ambient: function(path) {
    if (this.ambEl) { try { this.ambEl.pause(); } catch (e) {} this.ambEl = null; }
    if (!path) return;
    try {
      var a = new Audio(path);
      a.loop = true;
      a.volume = 0;
      a.addEventListener('error', function(){});
      this.ambEl = a;
      a.play().then((function(self){ return function(){ self.apply(); }; })(this)).catch(function(){});
      this.fadeIn(a, Math.min(1, this.s.master * this.s.ambient), 1800);
    } catch (e) {}
  },

  fadeIn: function(el, target, ms) {
    var start = el.volume;
    var steps = 20, step = (target - start) / steps, i = 0;
    var iv = setInterval(function() {
      i++;
      if (i >= steps) { el.volume = target; clearInterval(iv); return; }
      el.volume = Math.max(0, Math.min(1, start + step * i));
    }, ms / steps);
  },

  // Eventos dinámicos de música
  startRandomEvents: function() {
    if (this.randomIv) return;
    var self = this;
    this.randomIv = setInterval(function() {
      if (!self.s.enabled || !self.s.randomEvents) return;
      if (Math.random() > 0.35) return;
      var kind = Math.floor(Math.random() * 5);
      if (kind === 0) self._momentarySilence(1200);
      else if (kind === 1) self._momentaryVolume(1.5, 900);
      else if (kind === 2) self._momentarySilence(2800);
      else if (kind === 3) self._momentaryVolume(0.3, 1600);
      else self._cutAndResume();
    }, 24000);
  },

  _momentarySilence: function(ms) {
    var el = this.musicEl; if (!el) return;
    var prev = el.volume;
    el.volume = 0;
    var t = setTimeout(function() { if (el && !el.paused) el.volume = prev; }, ms);
    this.eventTimers.push(t);
  },

  _momentaryVolume: function(mult, ms) {
    var el = this.musicEl; if (!el) return;
    var prev = el.volume;
    el.volume = Math.max(0, Math.min(1, prev * mult));
    var t = setTimeout(function() { if (el && !el.paused) el.volume = prev; }, ms);
    this.eventTimers.push(t);
  },

  _cutAndResume: function() {
    var el = this.musicEl; if (!el) return;
    var prev = el.volume;
    el.pause();
    var t = setTimeout(function() {
      if (el) {
        el.play().catch(function(){});
        el.volume = 0;
        AudioMgr.fadeIn(el, prev, 800);
      }
    }, 1500);
    this.eventTimers.push(t);
  }
};
window.initAudio = function() { AudioMgr.init(); };