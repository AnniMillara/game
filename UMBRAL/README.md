# UMBRAL SYSTEM v1.0

Plataforma de minijuegos retro con ambientacion CRT verde.

## Como abrir

1. Abrir la carpeta `UMBRAL/` en Visual Studio Code.
2. Instalar la extension **Live Server**.
3. Click derecho en `index.html` -> **Open with Live Server**.

Tambien puedes abrir `index.html` haciendo doble clic (los scripts son clasicos, no modulos).

## Estructura

- `index.html` - entrada principal
- `pages/` - paginas secundarias
- `static/css/` - estilos generales y por juego
- `static/js/` - sistemas y logica por juego
- `static/img/screamers/` - imagenes de screamers (opcional)
- `static/audio/` - musica, ambiente, efectos y screamers (opcional)

## Anadir imagenes y sonidos

Coloca tus archivos en las rutas indicadas. El sistema los ignora silenciosamente si no existen:

- Screamers: `static/img/screamers/screamer-01.png`, `-02.png`, `-03.png`
- Sonidos screamers: `static/audio/screamers/scream-01.mp3`, `-02.mp3`, `-03.mp3`
- Musica: `static/audio/music/theme.mp3`
- Ambiente: `static/audio/ambient/hum.mp3`

## Anadir niveles

Edita el array `LEVELS` en cada archivo dentro de `static/js/games/`.
Actualiza tambien `GAMES[id].levels` en `static/js/levels.js`.

## Reiniciar progreso

En la consola del navegador:

    Object.keys(localStorage).filter(function(k){return k.indexOf('umbral:')===0;}).forEach(function(k){localStorage.removeItem(k);});
    location.reload();