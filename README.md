# Tambu Game

Juego 2D pixel-art de comedia social, pensado para navegador y basado en el lore interno del grupo de amigos de Tambu.

## Stack

- Phaser 4.2.1
- Vite 8.2.2
- JavaScript (ES modules)
- Arcade Physics

## Objetivo actual

Construir primero una experiencia desktop sólida y simple. Mobile queda previsto desde la arquitectura (canvas escalable, input desacoplado), pero los controles táctiles se implementarán más adelante.

## Primer prototipo

La primera escena es **Fiesta en el patio**:

- entrada de Tambu;
- patio nocturno con piscina;
- barra;
- DJ;
- baño;
- NPCs de relleno;
- grupo de amigos;
- 3 mujeres interactuables;
- HUD y sistema de conversaciones.

## Desarrollo local

Requiere Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

## Documentación

Antes de diseñar, producir assets o modificar el juego, empezar por:

1. [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) — estado y prioridades vigentes.
2. [`docs/README.md`](docs/README.md) — mapa de fuentes de verdad y resolución de conflictos.
3. El documento especializado de la tarea.

Los documentos de fase antiguos no describen necesariamente el runtime actual.

## Estado

`v0.1` — vertical slice jugable de la fiesta en el patio.

La base técnica, el sistema social, Sofi/Mili/Cami, El Consejo y el evento del baño están implementados. El escenario combina sectores con assets de producción y una capa todavía provisional, especialmente personajes, props ambientales y UI. Ver el inventario completo en [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md).
