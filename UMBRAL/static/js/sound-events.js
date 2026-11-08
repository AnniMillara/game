window.SFX = {
  interface: { beep: 'static/audio/interface/beep.mp3', key: 'static/audio/interface/key.mp3' },
  gato: { block: 'static/audio/games/gato/block.mp3', move: 'static/audio/games/gato/move.mp3', win: 'static/audio/games/gato/win.mp3', lose: 'static/audio/games/gato/lose.mp3' },
  solitario: { flip: 'static/audio/games/solitario/flip.mp3', move: 'static/audio/games/solitario/move.mp3', deal: 'static/audio/games/solitario/deal.mp3', invalid: 'static/audio/games/solitario/invalid.mp3', found: 'static/audio/games/solitario/foundation.mp3', win: 'static/audio/games/solitario/win.mp3' },
  memoria: { flip: 'static/audio/games/memoria/flip.mp3', match: 'static/audio/games/memoria/match.mp3', miss: 'static/audio/games/memoria/miss.mp3', level: 'static/audio/games/memoria/level.mp3' },
  observador: { click: 'static/audio/games/observador/click.mp3', found: 'static/audio/games/observador/found.mp3', error: 'static/audio/games/observador/error.mp3', level: 'static/audio/games/observador/level.mp3' },
  codigo: { key: 'static/audio/games/codigo/key.mp3', correct: 'static/audio/games/codigo/correct.mp3', wrong: 'static/audio/games/codigo/wrong.mp3', level: 'static/audio/games/codigo/level.mp3' },
  laberinto: { move: 'static/audio/games/laberinto/move.mp3', side: 'static/audio/games/laberinto/side.mp3', wall: 'static/audio/games/laberinto/wall.mp3', exit: 'static/audio/games/laberinto/exit.mp3' }
};
window.playSfx = function(game, name) { var g = SFX[game]; if (!g) return; var p = g[name]; if (p) AudioMgr.sfx(p); };
window.playInterface = function(name) { var p = SFX.interface[name]; if (p) AudioMgr.sfx(p); };