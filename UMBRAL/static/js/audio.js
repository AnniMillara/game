window.AudioMgr = {
  s: { master: .7, music: .5, sfx: .7, ambient: .5, enabled: true, randomEvents: true },
  musicEl: null, ambEl: null, current: null, unlocked: false, _cb: null,
  init: function() {
    var saved = Storage_.get('audio', null);
    if (saved) for (var k in saved) this.s[k] = saved[k];
    var self = this;
    var unlock = function() { self.unlocked = true; document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock); if (self._cb) self._cb(); };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  },
  whenUnlocked: function(cb) { if (this.unlocked) cb(); else this._cb = cb; },
  save: function() { Storage_.set('audio', this.s); },
  set: function(k, v) { if (k in this.s) { this.s[k] = v; this.save(); this.apply(); } },
  apply: function() {
    if (this.musicEl) this.musicEl.volume = Math.max(0, Math.min(1, this.s.enabled ? this.s.master * this.s.music : 0));
    if (this.ambEl) this.ambEl.volume = Math.max(0, Math.min(1, this.s.enabled ? this.s.master * this.s.ambient : 0));
  },
  sfx: function(path) { if (!path || !this.s.enabled) return; try { var a = new Audio(path); a.volume = Math.max(0, Math.min(1, this.s.master * this.s.sfx)); a.addEventListener('error', function(){}); a.play().catch(function(){}); } catch (e) {} },
  music: function(path) {
    if (!path) return;
    if (this.current === path && this.musicEl && !this.musicEl.paused) return;
    this.stopMusic();
    this.current = path;
    try { var a = new Audio(path); a.loop = true; a.volume = Math.max(0, Math.min(1, this.s.enabled ? this.s.master * this.s.music : 0)); a.addEventListener('error', function(){}); this.musicEl = a; a.play().catch(function(){}); } catch (e) {}
  },
  stopMusic: function() { if (this.musicEl) { try { this.musicEl.pause(); } catch(e) {} this.musicEl = null; this.current = null; } },
  ambient: function(path) {
    if (this.ambEl) { try { this.ambEl.pause(); } catch(e) {} this.ambEl = null; }
    if (!path) return;
    try { var a = new Audio(path); a.loop = true; a.volume = Math.max(0, Math.min(1, this.s.enabled ? this.s.master * this.s.ambient : 0)); a.addEventListener('error', function(){}); this.ambEl = a; a.play().catch(function(){}); } catch (e) {}
  }
};
window.initAudio = function() { AudioMgr.init(); };