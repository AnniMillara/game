(function() {
  // ====== ERRORES VISIBLES EN PANTALLA (sin necesidad de consola) ======
  function showError(msg) {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(60,0,0,0.95);color:#ff8080;padding:12px 16px;font-family:monospace;font-size:12px;z-index:99999;border-top:2px solid #ff3030;white-space:pre-wrap;word-break:break-all;';
    div.textContent = 'ERROR: ' + msg;
    document.body.appendChild(div);
    setTimeout(function() { div.remove(); }, 20000);
  }
  window.addEventListener('error', function(e) {
    showError((e.message || 'unknown') + (e.filename ? ' @ ' + e.filename.split('/').pop() + ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function(e) {
    showError('promise: ' + (e.reason && e.reason.message || e.reason));
  });

  function boot() {
    try {
      initAudio();
      initScreamers();
      initHorrorEffects();
      initSettings();
      initNavigation();
      var log = document.getElementById('boot-log');
      if (log) {
        Nav.goTo('boot');
        IU.boot(log).then(function() { Nav.goTo('menu'); Nav.renderMenu(); });
      } else {
        Nav.goTo('menu'); Nav.renderMenu();
      }
    } catch (e) {
      console.error('BOOT ERROR', e);
      showError('BOOT: ' + (e && e.message ? e.message : e));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();