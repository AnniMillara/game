window.GAMES = {
  gato:       { name: 'EL GATO ENCERRADO', icon: '◈', desc: 'Encierra al gato antes de que escape.', levels: 5 },
  solitario:  { name: 'SOLITARIO',         icon: '♠', desc: 'Klondike clásico contra el reloj.',    levels: 5 },
  memoria:    { name: 'MEMORIA',           icon: '◉', desc: 'Encuentra todas las parejas.',         levels: 5 },
  observador: { name: 'OBSERVADOR',        icon: '◎', desc: 'Detecta anomalías en la escena.',      levels: 5 },
  codigo:     { name: 'CÓDIGO MUERTO',     icon: '⌘', desc: 'Resuelve patrones y secuencias.',      levels: 5 },
  laberinto:  { name: 'LABERINTO',         icon: '⊞', desc: 'Encuentra la salida en la oscuridad.', levels: 5 }
};
window.Levels = {
  def: function() { return { unlocked: 1, completed: [], bestScore: {}, bestTime: {}, attempts: 0, wins: 0 }; },
  get: function(id) { var s = Storage_.get('progress:' + id, null); var d = this.def(); if (!s) return d; for (var k in d) if (!(k in s)) s[k] = d[k]; return s; },
  save: function(id, p) { Storage_.set('progress:' + id, p); },
  unlocked: function(id, lvl) { return lvl >= 1 && lvl <= this.get(id).unlocked; },
  recordAttempt: function(id) { var p = this.get(id); p.attempts += 1; this.save(id, p); },
  complete: function(id, lvl, opts) {
    opts = opts || {};
    var p = this.get(id);
    if (p.completed.indexOf(lvl) === -1) p.completed.push(lvl);
    p.completed.sort(function(a,b){return a-b;});
    var total = GAMES[id].levels;
    if (lvl >= p.unlocked && lvl < total) p.unlocked = lvl + 1;
    if ((opts.score||0) > (p.bestScore[lvl] || 0)) p.bestScore[lvl] = opts.score || 0;
    if (opts.time > 0 && (!p.bestTime[lvl] || opts.time < p.bestTime[lvl])) p.bestTime[lvl] = opts.time;
    p.wins += 1; this.save(id, p); return p;
  },
  // Halt ahora es MUY raro: 5% solo en nivel 3+. Preserva la mecánica pero
  // hace que la mayoría de las partidas nunca lo vean.
  tryComplete: function(id, lvl, opts) {
    if (lvl >= 3 && Math.random() < 0.05) {
      if (typeof Horror !== 'undefined' && Horror.systemHalt) {
        Horror.systemHalt();
        return true;
      }
    }
    this.complete(id, lvl, opts);
    return false;
  },
  globalPercent: function() {
    var done = 0, total = 0;
    for (var id in GAMES) { total += GAMES[id].levels; done += this.get(id).completed.length; }
    return total ? Math.round(done / total * 100) : 0;
  },
  isRecord: function(id, lvl, score) {
    var p = this.get(id);
    return score > (p.bestScore[lvl] || 0);
  }
};