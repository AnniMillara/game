window.Storage_ = {
  get: function(k, fb) { try { var r = localStorage.getItem('umbral:' + k); return r === null ? (fb === undefined ? null : fb) : JSON.parse(r); } catch (e) { return fb === undefined ? null : fb; } },
  set: function(k, v) { try { localStorage.setItem('umbral:' + k, JSON.stringify(v)); } catch (e) {} },
  remove: function(k) { try { localStorage.removeItem('umbral:' + k); } catch (e) {} }
};