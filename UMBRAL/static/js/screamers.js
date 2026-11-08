(function(){
  var SCREAMERS = [
    { id:'s1', image:'static/img/screamers/screamer-01.png', sound:'static/audio/sounds/screamers/scream-01.mp3', duration:900 },
    { id:'s2', image:'static/img/screamers/screamer-02.png', sound:null, duration:2500 },
    { id:'s3', image:'static/img/screamers/screamer-03.png', sound:null, duration:500 }
  ];

  var S = {
    enabled: false,
    frequency: 0.1,
    minGlobalInterval: 600000,
    layer: null,
    lastGlobal: 0,
    activeTimer: null,
    busy: false
  };

  function pickScreamer() {
    return SCREAMERS[Math.floor(Math.random() * SCREAMERS.length)];
  }

  function showLayer(s) {
    if (!S.layer) return;
    S.layer.innerHTML = '';
    S.layer.className = 'screamer-layer';
    var img = document.createElement('img');
    img.src = s.image;
    img.alt = '';
    img.addEventListener('error', function(){});
    S.layer.appendChild(img);
    S.layer.classList.add('active', 'fade-in');
  }

  function hideLayer() {
    if (!S.layer) return;
    S.layer.classList.add('fade-out');
    setTimeout(function() {
      S.layer.classList.remove('active', 'fade-in', 'fade-out');
      S.layer.innerHTML = '';
    }, 520);
  }

  function playSound(s) {
    if (!s.sound) return;
    try {
      var a = new Audio(s.sound);
      a.volume = 0.7;
      a.addEventListener('error', function(){});
      a.play().catch(function(){});
    } catch (e) {}
  }

  function execute(s) {
    if (S.busy) return;
    S.busy = true;
    S.lastGlobal = Date.now();
    showLayer(s);
    playSound(s);
    var dur = s.duration || 800;
    S.activeTimer = setTimeout(function() {
      hideLayer();
      setTimeout(function() { S.busy = false; }, 520);
    }, dur);
  }

  window.Screamer = {
    init: function() {
      var saved = Storage_.get('screamers', null);
      if (saved) {
        if (typeof saved.enabled === 'boolean') S.enabled = saved.enabled;
      }
      S.layer = document.getElementById('screamer-layer');
    },
    set: function(k, v) {
      if (k in S) {
        S[k] = v;
        Storage_.set('screamers', { enabled: S.enabled });
      }
    },
    trigger: function(force) {
      if (!S.enabled && !force) return;
      if (!S.layer) return;
      if (!force && Date.now() - S.lastGlobal < S.minGlobalInterval) return;
      execute(pickScreamer());
    },
    maybeTrigger: function() {},
    showBg: function() {},
    restoreBg: function() {}
  };
  window.initScreamers = function() { Screamer.init(); };
})();