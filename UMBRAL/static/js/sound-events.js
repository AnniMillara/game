window.SFX = {
  interface: {
    beep: 'static/audio/sounds/interface/beep.mp3',
    key:  'static/audio/sounds/interface/key.mp3'
  },
  gato: {
    block: 'static/audio/sounds/gato/block.mp3',
    move:  'static/audio/sounds/gato/move.mp3',
    win:   'static/audio/sounds/gato/win.mp3',
    lose:  'static/audio/sounds/gato/lose.mp3'
  },
  solitario: {
    flip:    'static/audio/sounds/solitario/flip.mp3',
    move:    'static/audio/sounds/solitario/move.mp3',
    deal:    'static/audio/sounds/solitario/deal.mp3',
    invalid: 'static/audio/sounds/solitario/invalid.mp3',
    found:   'static/audio/sounds/solitario/found.mp3',
    win:     'static/audio/sounds/solitario/win.mp3'
  },
  memoria: {
    flip:  'static/audio/sounds/memoria/flip.mp3',
    match: 'static/audio/sounds/memoria/match.mp3',
    miss:  'static/audio/sounds/memoria/miss.mp3',
    level: 'static/audio/sounds/memoria/level.mp3'
  },
  observador: {
    click: 'static/audio/sounds/observador/click.mp3',
    found: 'static/audio/sounds/observador/found.mp3',
    error: 'static/audio/sounds/observador/error.mp3',
    level: 'static/audio/sounds/observador/level.mp3'
  },
  codigo: {
    key:     'static/audio/sounds/codigo/key.mp3',
    correct: 'static/audio/sounds/codigo/correct.mp3',
    wrong:   'static/audio/sounds/codigo/wrong.mp3',
    level:   'static/audio/sounds/codigo/level.mp3'
  },
  laberinto: {
    move: 'static/audio/sounds/laberinto/move.mp3',
    side: 'static/audio/sounds/laberinto/side.mp3',
    wall: 'static/audio/sounds/laberinto/wall.mp3',
    exit: 'static/audio/sounds/laberinto/exit.mp3'
  }
};
window.playSfx = function(game, name) { var g = SFX[game]; if (!g) return; var p = g[name]; if (p) AudioMgr.sfx(p); };
window.playInterface = function(name) { var p = SFX.interface[name]; if (p) AudioMgr.sfx(p); };