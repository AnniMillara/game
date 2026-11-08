(function() {
  function boot() {
    try {
      initAudio(); initScreamers(); initHorrorEffects(); initSettings(); initNavigation();
      var log = document.getElementById('boot-log');
      if (log) {
        Nav.goTo('boot');
        IU.boot(log).then(function() { Nav.goTo('menu'); Nav.renderMenu(); });
      } else { Nav.goTo('menu'); Nav.renderMenu(); }
    } catch (e) { console.error('BOOT ERROR', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();