# Tambu Game — Mapa de documentación

Este directorio contiene decisiones de producto, arte, narrativa y producción. No todos los documentos tienen la misma función ni la misma vigencia.

## Lectura obligatoria para cualquier agente

1. [`CURRENT_STATE.md`](./CURRENT_STATE.md) — autoridad sobre el estado actual: qué está integrado, congelado, en validación, provisional o pendiente.
2. El documento especializado de la tarea.
3. El código y los assets involucrados antes de modificar el runtime.

Ningún agente debe reconstruir el estado del proyecto a partir de prompts antiguos, commits aislados o documentos de fase sin consultar primero `CURRENT_STATE.md`.

## Autoridad por dominio

| Documento | Decide | No decide |
|---|---|---|
| [`CURRENT_STATE.md`](./CURRENT_STATE.md) | Estado, vigencia, prioridades y límites actuales | Detalle técnico completo de cada sistema |
| [`GAME_DESIGN.md`](./GAME_DESIGN.md) | Alcance y loop de la V1 | Estado de implementación |
| [`ART_DIRECTION.md`](./ART_DIRECTION.md) | Intención, jerarquía y atmósfera visual | Paletas técnicas estrictas ni backlog |
| [`PIXEL_ART_STYLE_GUIDE.md`](./PIXEL_ART_STYLE_GUIDE.md) | Reglas técnicas de pixel art y paletas vigentes | Prioridad de producción |
| [`HUMAN_SCALE.md`](./HUMAN_SCALE.md) | Escala humana y proporciones | Diseño narrativo |
| [`ASSET_PRODUCTION.md`](./ASSET_PRODUCTION.md) | Roadmap y contrato de producción visual | Estado global del juego |
| [`SOCIAL_DIALOGUE_DESIGN.md`](./SOCIAL_DIALOGUE_DESIGN.md) | Reglas sociales, narrativa y voces | Presentación visual final |
| [`CHARACTERS.md`](./CHARACTERS.md) | Canon de personajes | Estado técnico de sus sprites |
| [`PHASE_1_GRASS.md`](./PHASE_1_GRASS.md) | Implementación vigente del césped aprobado | Dirección general del resto del patio |
| [`TAMBU_SPRITE_V011.md`](./TAMBU_SPRITE_V011.md) | Especificación del spritesheet actual de Tambu | Escala general de objetos |

## Documentos históricos

[`PHASE_1_CALIBRATION.md`](./PHASE_1_CALIBRATION.md) registra la calibración visual inicial. Esa etapa ya fue superada y el documento puede contener nombres, paletas o entregables anteriores. Sirve para entender decisiones, no para iniciar producción nueva.

`PHASE_1_GRASS.md` no es histórico: describe el sistema de césped que sigue activo.

## Resolución de conflictos

1. `CURRENT_STATE.md` determina si una decisión o documento sigue vigente.
2. Para detalle técnico, prevalece la fuente especializada indicada en la tabla.
3. Para comportamiento ya integrado, el código y los assets de `main` describen lo que realmente corre.
4. Una contradicción no autoriza a elegir la opción preferida ni a improvisar una tercera. Se detiene la tarea y se reporta el conflicto.
5. Un documento histórico nunca puede anular una regla activa.

## Regla de mantenimiento

Toda tarea que cambie de forma material el estado del juego debe actualizar `CURRENT_STATE.md` en el mismo cambio. Si también cambia una regla de dominio, se actualiza el documento especializado correspondiente.
