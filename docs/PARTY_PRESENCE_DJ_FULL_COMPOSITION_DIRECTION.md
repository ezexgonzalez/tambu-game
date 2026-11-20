# TAMBU GAME — DJ Environment Full Controlled Composition Pass

**Fecha:** 2026-11-19  
**Estado:** DIRECTION APPROVED / ENGINEERING PENDING / FINAL MANUAL VISUAL QA REQUIRED  
**Scope:** composición final **de objetos ambientales**, no NPCs ni nueva arquitectura.

## Resultado aprobado y decisión

Dirección inspeccionó captura real del prototipo `?djEnvPreview=1`: **sofá, mesa, bebidas, alfombra, lámpara y arquitectura general con escala aceptada para continuar**. Un único defecto relevante: V02A tropical wide tenía hojas demasiado finas frente a las plantas gruesas de las ventanas del juego. Dirección recibió nueva V02A y **la aprobó sin más microcorrecciones**. No volver a producir ni pulir ese sprite. Esto cierra la escala general como **BASELINE MANUAL APPROVED FOR CONTINUATION**, no declara colliders/lights/whole zone runtime cerrados.

Asset aprobado V02A: `dj_plant_tropical_wide_v1.png`, **80×67 RGBA**, alpha {0,255}, SHA-256 `99d1f76301cf4396fd34ef7b7e0fb4ee751ca4c949f71997baf68d441782c6aa`. Se entrega al Engineer como `TAMBU_DJ_V02A_APPROVED_REPLACEMENT.zip` con ruta interna `public/assets/props/dj_environment/vegetation/dj_plant_tropical_wide_v1.png`. El paquete externo debe adjuntarse; **no está todavía en main**. Reemplazar bytes solo V02A, actualizar SHA del registro `djEnvironmentAssets.js`, conservar escala/origin/contact, sockets y todo el resto del kit. No modificar Pack B completo, V02B ni maceteros.

## Próxima tarea: composición real de decoración por sectores

No crear otra imagen IA ni recrear el mockup como suelo. Utilizar los **PNG reales ya integrados** en main, referencia ambiental final de **1087×1447** como target de relación/ambientación (no coordenadas), y geometría vigente de `PATIO_LAYOUT` (mundo 1680×960, DJ, piscina, casa, bar, rutas).

**Entregable de esta pasada:** un layout declarativo de placements de entorno, renderizado detrás de un **flag opt-in** para validación de la composición completa. El flag actual de scale prototype `?djEnvPreview=1` debe reemplazarse o reutilizarse para mostrar la nueva composición SIN dejar el prototipo de calibración duplicado. Documentar exactamente cómo habilitarla. **Default OFF** hasta QA visual de Dirección.

### Zonas y relación compositiva

1. **Borde izquierdo superior junto al DJ**: árbol ornamental en esquina o zona lateral si la geometría real lo permite, vegetación y guirnalda con anclajes físicos existentes; mesa alta F05 con botellas/vasos. No alterar DJ/booth.
2. **Borde izquierdo medio**: lounge compacto con sofá F01, mesa F03, F06 pouf, cojines F02, macetero(s) V06 + V02 y luces L01/L04. 
3. **Borde izquierdo inferior**: lounge más amplio F01, mesa baja F04, alfombra F07, props C01/C02, V08 y vegetación de transición. 
4. **Borde inferior de sector**: tres agrupaciones paisajísticas de V07 modular + V04/V05/V09 y L02, con **pausas**, siluetas diferentes y sin barrera continua/cerca/collider lineal. Tomar el borde de la ZONA, no pintar una pared uniforme por todo el mapa.
5. **Lateral de piscina/derecha de este sector**: vegetación/maceteros y faroles puntuales que NO cubran agua ni borde, ni bloqueen caminos e interacciones.
6. **Centro / dance core futuro**: mantener libre para Social Population Pass. **No agregar NPCs** y no usar muebles para llenar negative space.

La referencia ilustra intención y densidades, no dicta cantidades obligatorias. Todos los props se colocan con criterio por tramo, respetando espacios y rutas. L05 deck lantern **EXCLUIDO** de nuevas colocaciones DJ hasta revisión posterior, puede omitirse.

### Ingeniería prevista

- Un `src/world/dj/djEnvironmentLayout.js` declarativo con IDs por instancia, sector, assetId(s), world x/y, origin, scale, relationship/depth y role (ground/structure/surface/foliage/light).
- Un renderer/preloader pequeño reutiliza `djEnvironmentAssets.js` y su metadata, mantiene módulos y soportes reales, agrupa lounge y maceteros cuando corresponda y respeta front lip/soil. Sin duplicar keys/cambiar bits de assets.
- Reusar o refactorizar lo mínimo de `djEnvironmentPreview.js`, **sin tener dos composiciones superpuestas**. El prototipo anterior puede conservarse en código como calibración solo si activarlo es distinto y documentado, pero la ruta común de preview muestra el layout nuevo.
- Scale base **1.0 nativa** salvo motivo local claramente justificado, no `1.65` ilustrativo ni conversión directa de pixeles de captura.
- Profundidad por pies/contactos para sofá, faroles/macetas/árbol; arbustos y copas pueden usar reglas host/foreground adecuadas. Alfombra siempre suelo; bebidas/lámparas sobre mesas según contactos y depth relativo a superficie. Evitar rectángulos colliders por tamaño total de sprite.
- **NO colisiones definitivas ni iluminación ambiental completa en esta pasada:** prioridad a placement visual total y evitar regresiones. Guardar candidatos de footprints/emission anchors como datos; luego en fase de activación se harán físicos/lighting después del QA de composición.
- Guirnaldas a partir de cables/bombillas reales del Pack C; sin inventar truss/soportes y sin cables flotantes. Si no existe punto de fijación sensato en patio real, omitir esa instancia temporalmente y reportarlo.
- No refactorizar HUD, audio, caracteres, Bathroom Event/Resistance, Player, camera/world bounds ni UI.
- No redistribuir Uriel, Santy, Sofi, Thiago, Tobi; preserve interacciones visibles, camino entre DJ/piscina y rutas. No introducir NPC fillers.
- No editor drag/drop, no Playwright, no browser/screenshot por Engineer.
- Crear tests de IDs y paths, bounds/constraints, composición modular, ausencia de solapes incompatibles comprobables con geometría, orden de depth y cleanup. `npm test`, `npm run build`.
- Commit + push directo a main con estado **DJ FULL ENVIRONMENT COMPOSITION — INTEGRATED / MANUAL VISUAL QA REQUIRED**, flag preview default OFF. Reportar coordenadas/sectores, omitidos y SHA.

## QA de Dirección

Dirección activará el flag, observará zona completa en captura real y dará APPROVED o una **correction pass de coordenadas/oclusiones/escala**. No reabrir arte completo por detalles mínimos. Tras aprobar composición: siguiente encargo focalizado para **colliders + luces runtime + activación definitiva**, y luego **Social Zone NPC Pass**. No declarar entorno cerrado en esta pasada.

## Regla de eficiencia

Alcance único, una implementación completa de layout y una ronda de QA visual global: no multiplicar micro-passes. Respeto a las piezas ya aprobadas y la decisión del creador de priorizar avanzar.
