window.Settings = {
  def: { musicEnabled:true, sfxEnabled:true, ambientEnabled:true, masterVol:70, musicVol:50, sfxVol:70, ambientVol:50, randomEvents:true, screamersEnabled:true, screamerFrequency:40, screamerDuration:700, interferences:true, scanlines:true, brightness:1.0, crtIntensity:1.0, reduceMotion:false },
  get: function() { var s = Storage_.get('settings', null) || {}; var r = {}; for (var k in this.def) r[k] = (k in s) ? s[k] : this.def[k]; return r; },
  save: function(patch) { var n = this.get(); for (var k in patch) n[k] = patch[k]; Storage_.set('settings', n); return n; },
  apply: function() {
    var s = this.get();
    AudioMgr.set('enabled', s.musicEnabled || s.sfxEnabled || s.ambientEnabled);
    AudioMgr.set('master', s.masterVol / 100);
    AudioMgr.set('music', s.musicVol / 100);
    AudioMgr.set('sfx', s.sfxVol / 100);
    AudioMgr.set('ambient', s.ambientVol / 100);
    AudioMgr.set('randomEvents', s.randomEvents);
    Screamer.set('enabled', s.screamersEnabled);
    Screamer.set('frequency', s.screamerFrequency / 100);
    Screamer.set('duration', s.screamerDuration);
    Horror.apply();
  },
  init: function() { this.apply(); this.render(); },
  render: function() {
    var root = document.getElementById('settings-root'); if (!root) return;
    var s = this.get(); root.innerHTML = '';
    var self = this;
    function toggle(label, key, val) {
      var w = IU.el('label', { class: 'setting' }, label);
      var i = IU.el('input', { type: 'checkbox' }); i.checked = !!val;
      i.addEventListener('change', function() { self.save({ [key]: i.checked }); self.apply(); });
      w.appendChild(i); return w;
    }
    function slider(label, key, val, min, max, div) {
      min = min === undefined ? 0 : min; max = max === undefined ? 100 : max; div = div || 1;
      var w = IU.el('label', { class: 'setting' }, label);
      var i = IU.el('input', { type: 'range', min: min, max: max, step: div }); i.value = val;
      var v = IU.el('span', { class: 'val' }, String(val));
      i.addEventListener('input', function() {
        v.textContent = i.value;
        var patch = {}; patch[key] = Number(i.value);
        if (key === 'brightness' || key === 'crtIntensity') patch[key] = Number(i.value) / 100;
        self.save(patch); self.apply();
      });
      w.appendChild(i); w.appendChild(v); return w;
    }
    function group(title, kids) {
      var g = IU.el('div', { class: 'settings-group' }); g.appendChild(IU.el('h3', {}, title));
      kids.forEach(function(k){ g.appendChild(k); }); return g;
    }
    root.appendChild(group('AUDIO', [
      toggle('Musica','musicEnabled',s.musicEnabled),
      slider('Vol. maestro','masterVol',s.masterVol),
      slider('Vol. musica','musicVol',s.musicVol),
      slider('Vol. efectos','sfxVol',s.sfxVol),
      slider('Vol. ambiente','ambientVol',s.ambientVol),
      toggle('Eventos aleatorios','randomEvents',s.randomEvents)
    ]));
    root.appendChild(group('TERROR', [
      toggle('Screamers','screamersEnabled',s.screamersEnabled),
      slider('Frecuencia','screamerFrequency',s.screamerFrequency),
      slider('Duracion ms','screamerDuration',s.screamerDuration,200,2000,50),
      toggle('Interferencias','interferences',s.interferences)
    ]));
    root.appendChild(group('INTERFAZ', [
      toggle('Scanlines','scanlines',s.scanlines),
      slider('Brillo','brightness',Math.round(s.brightness*100),60,130,1),
      slider('Efecto CRT','crtIntensity',Math.round(s.crtIntensity*100),0,150,1),
      toggle('Reducir animaciones','reduceMotion',s.reduceMotion)
    ]));
  }
};
window.initSettings = function() { Settings.init(); };