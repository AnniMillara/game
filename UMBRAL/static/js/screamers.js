window.Screamer = {
  list: [
    { image: 'static/img/screamers/screamer-01.png', sound: 'static/audio/screamers/scream-01.mp3', duration: 700 },
    { image: 'static/img/screamers/screamer-02.png', sound: 'static/audio/screamers/scream-02.mp3', duration: 800 },
    { image: 'static/img/screamers/screamer-03.png', sound: 'static/audio/screamers/scream-03.mp3', duration: 650 }
  ],
  s: { enabled: true, frequency: .4, duration: 700, minIntervalMs: 45000 },
  layer: null, last: 0, timer: null,
  init: function() {
    var saved = Storage_.get('screamers', null);
    if (saved) for (var k in saved) this.s[k] = saved[k];
    this.layer = document.getElementById('screamer-layer');
  },
  set: function(k, v) { if (k in this.s) { this.s[k] = v; Storage_.set('screamers', this.s); } },
  trigger: function(force) {
    if (!this.s.enabled && !force) return;
    if (!this.layer) return;
    var now = Date.now();
    if (!force && now - this.last < this.s.minIntervalMs) return;
    if (!force && Math.random() > this.s.frequency) return;
    this.last = now;
    var s = this.list[Math.floor(Math.random() * this.list.length)];
    var img = document.createElement('img'); img.src = s.image; img.alt = '';
    img.addEventListener('error', function(){});
    try { var a = new Audio(s.sound); a.volume = .85; a.addEventListener('error', function(){}); a.play().catch(function(){}); } catch (e) {}
    this.layer.innerHTML = ''; this.layer.appendChild(img); this.layer.classList.add('active');
    var self = this, dur = this.s.duration || s.duration || 700;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(function() { self.layer.classList.remove('active'); self.layer.innerHTML = ''; }, dur);
  },
  maybeTrigger: function(mult) {
    if (!this.s.enabled) return;
    var p = this.s.frequency * (mult || 1) * .12;
    if (Math.random() < p) this.trigger(false);
  }
};
window.initScreamers = function() { Screamer.init(); };