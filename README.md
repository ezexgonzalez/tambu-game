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
- 2–3 mujeres interactuables;
- HUD y sistema de conversaciones en fases posteriores.

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

## Estado

`v0.1` — base técnica + bloque visual inicial del mapa Patio.
