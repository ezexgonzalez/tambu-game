# Tambu Sprite v0.1.1

Corrección de estabilización del protagonista.

- Escala en juego: `1.24`.
- Frame fuente: `32x48 px`.
- Envolvente nominal en runtime: `39.68x59.52 world px` con cámara `zoom = 1`.
- Spritesheet total: `96x192 px`.
- Se normalizaron los tres frames frontales para evitar cambios bruscos de tamaño.
- La caminata izquierda usa frames orientados consistentemente hacia la izquierda.
- La vista trasera muestra cuerpo, hombros y piernas; el pelo rizado sigue siendo el rasgo principal sin ocupar todo el frame.

## Regla de escala

Tambu es la **unidad humana oficial de Tambu Game**. El resto de personajes, mobiliario, arquitectura y props deben calibrarse contra su tamaño real en runtime. No se debe reescalar a Tambu para adaptar assets nuevos.

La especificación completa está en `docs/HUMAN_SCALE.md`.
