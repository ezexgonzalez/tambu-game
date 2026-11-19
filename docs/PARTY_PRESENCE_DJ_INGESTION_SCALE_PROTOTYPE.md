# Tambu Game — DJ Environment — Asset Ingestion + Scale Prototype

**Direction:** 2026-11-19  
**Estado:** DIRECTION APPROVED / PENDING ENGINEERING / MANUAL SCALE QA REQUIRED  
**Branch:** `main`  
**Owner:** Integration Engineer  
**Gate:** Prototipo técnico y óptico, NO integración ambiental definitiva.

## 1. Objetivo

Integrar los **PNG de arte aprobados** de los cuatro packs DJ en el repositorio y desplegar un **pequeño prototipo de escala real dentro de Phaser**, que Dirección inspeccionará manualmente. El próximo bloque posterior será la COMPOSICIÓN TOTAL de la zona, pero todavía **NO está autorizado**.

Se eligió usar Phaser como compositor definitivo porque `PATIO_LAYOUT` define el mundo en 1680×960, DJ en (116,202) y piscina desde (512,432), mientras la captura ambiental aprobada es una **ilustración de 1087×1447** y no permite derivar coordenadas de mundo ni tamaños de colisión. La captura limpia original es 521×717. No convertir ingenuamente entre píxeles de captura y coordenadas del mundo.

## 2. Source of truth / archivos

- Repo `ezexgonzalez/tambu-game`, `main`.
- `docs/CURRENT_STATE.md`, `docs/README.md`, `docs/GAME_DESIGN.md`, `docs/PARTY_PRESENCE.md`, `docs/PARTY_PRESENCE_DJ_ASSET_MANIFEST.md`.
- `docs/PARTY_PRESENCE_DJ_PACK_A_QA.md`, `...PACK_B_QA.md`, `...PACK_C_QA.md`, `...PACK_D_QA.md`.
- `docs/ART_DIRECTION.md`, `docs/PIXEL_ART_STYLE_GUIDE.md`, `docs/HUMAN_SCALE.md`, `docs/ASSET_PRODUCTION.md`.
- Código: `src/world/createPatioWorld.js`, `src/world/createPatioCollisions.js`, `src/world/patioLayout.js`, `src/world/dj/djBooth.js`, `src/scenes/PatioScene.js`; friend/woman/player depth helpers; tests relevantes.
- **Bundle externo** `TAMBU_DJ_ENGINEER_HANDOFF_2026-11-19.zip` que Eze debe adjuntar/proveer explícitamente al Engineer: contiene los ZIPs definitivos A/B/C/D, 39 PNGs art-approved activos, 1 candidato L05 separado, la botella como referencia de path del repo, manifiesto SHA-256 y dos imágenes de referencia. **El bundle NO está en main** por el mero hecho de existir en un chat.
- Asset source: Pack A correction01 12 PNG, Pack B correction01 18 PNG, Pack C correction01 9 PNG **pero L05 deck lantern no aprobado para colocación DJ nueva**, Pack D 1 PNG rojo más botella existente `public/assets/props/deck/bottle.png`.
- **39 PNG activos aprobados** a importar (12+18+8+1), **1 L05 excluido**; 40 PNG presentes en los ZIP fuente si se cuenta L05. No importar versiones antiguas ni sustituir assets históricos.
- Target visual aprobado 1087×1447; SHA-256 `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418`; no tratarlo como spritesheet.

## 3. Ingesta y catalogación

1. Validar presencia real del bundle y verificar que contiene 4 paquetes, 39 PNGs activos e inventario hash. **Si falta un ZIP, una pieza, un manifiesto o hay checksum discrepante: DETENER la ingesta y reportarlo; no dibujar sustitutos ni inventar assets.**
2. Copiar por bytes los PNG aprobados a ruta semántica en `public/assets/props/dj_environment/` separada por familias `furniture/`, `vegetation/`, `lighting/`, `drinks/` (o convención real equivalente confirmada). No renombrar piezas sin actualizar cada key/manifest/índice. No guardar las previews QA ni el screenshot de ambiente como assets del mundo.
3. Dejar `public/assets/props/deck/bottle.png` como dependencia reutilizada, sin duplicar ni sobrescribir. No copiar `L05 lantern.png` como nuevo asset DJ. No sobrescribir `public/assets/props/dj/dj_cup_red_01.png` con el vaso refinado: usar nuevo nombre de Pack D.
4. Crear registro simple `djEnvironmentAssets.js` o equivalente: key,path,width,height,family,origin/contact,optional emission offset y reusos. Separar datos de assets y datos de colocación.
5. Preload condicionado/adecuado al módulo para no afectar bootstrap de escenas innecesarias; evitar keys duplicadas y global managers sobredimensionados.
6. Opcional: producir checksum report/manifest liviano en repo, sin almacenar ZIPs originales de QA en la distribución del juego.

## 4. Prototipo de escala: sólo una muestra

Un único cluster temporal y claramente reversible en área despejada de césped cercana al DJ, SIN tocar NPCs o interactuables. Se necesitan cinco verificaciones concretas:

- **SOFÁ**: subgrupo de módulos F01 que pruebe costuras, escala y profundidad; no generar un sofá grande desde cero.
- **MESA + BEBIDAS**: usar F03 o F04/F05 con **C02 vaso refinado** y **C01 botella reutilizada**; bases apoyadas de verdad sobre superficie, no flotando.
- **PLANTA**: una composición V06 macetón + V02 tropical, con tierra/sustrato y tallo insertado detrás del labio delantero. Probar occlusion y assembly.
- **FAROL**: L01 real con emisión física local; **sin halo ni iluminación runtime todavía**. L05 excluido.
- **SUELO OPCIONAL**: F07 alfombra bajo el conjunto para validar ground-layer/depth, sin collider.

Puede incluirse sólo lo necesario para validar esas relaciones, no una recreación de la imagen entera. Mantener la cantidad de instancias baja. El cluster es calibración, NO composición final. No autoriza reubicar amigos/chicas ni remodelar caminos.

### Opt-in reversible

Idealmente configurar un flag de preview explícito, **apagado por defecto**. Si el sistema existente permite una query de depuración sencilla, usar `?djEnvPreview=1`; en ese caso documentar exactamente el paso para activarlo y verificar por inspección de código que no se filtra al gameplay normal. Si no conviene query param, usar un boolean de configuración aislado, documentando la forma reversible de habilitarlo. NO desarrollar editor visual UI ni inventar un sistema de herramientas de debug grande.

**No usar coordenadas de screenshot ni convertir el mockup mediante factor 1.65.** Seleccionar un rectángulo temporal libre usando límites del mundo, DJ, piscina, posiciones reales de Uriel/Santy/Sofi/Thiago/Tobi y recorridos de baño, y documentar los anchors world de muestra para inspección. No colocarlo encima del spawn o del recorrido de jugador.

### Capa y profundidad

- Personajes depth por pies; amigos conocidos usan y+offset del contrato vigente. El suelo (alfombra) siempre bajo muebles y personajes.
- Los sprites verticales de muebles/plantas/sillón deben poder dibujarse detrás/delante de Tambu de acuerdo con pies/contacto; si para modularidad hay que separar front/back de un objeto, hacerlo de forma localizada y documentada.
- Un vaso sobre mesa usa depth relativo a la superficie, no su `y` individual de mundo de forma ingenua; evitar que la mesa tape el vaso o viceversa.
- Macetero y V02: el tallo debe parecer plantado en tierra, el borde frontal ocluye base como en Pack B QA. Mantener tree trunk/canopy separados para futuro uso, sin colocar árbol completo en este prototipo si no hace falta.
- Preview sin colliders definitivos para evitar alterar gameplay mientras se valida escala; no afirmar walkability/occlusion completos hasta QA real.

## 5. No tocar / fuera de alcance

- NO hacer composición total DJ, borde inferior completo, plantas por todo el lado izquierdo, guirnalda en mapa o luces físicas de todos los faroles.
- NO generar NPCs, fillers, microclusters, música, bebidas adicionales, mesa de picnic ni suelo nuevo.
- NO inventar luces/glow con Phaser Graphics, no crear físicas definitivas ni luces de runtime en esta pasada.
- NO modificar player, amigos, Sofi/Mili/Cami, cámara, DJ booth, piscina, posiciones de Spawn, rutas Bathroom Event, gameplay o UI.
- NO crear editor drag/drop ni tool de diseño permanente.
- NO usar la captura 1087×1447 para world coords. No aplicar factor 1.65 a los PNG aprobados.
- NO regenerar ni retocar pixel art; cualquier defecto verdadero de asset se informa a Dirección y Art Director.

## 6. Validación técnica obligatoria

- Validar todos los path/imports/keys; missing bytes fail-fast. No silencios ni placeholders.
- Tests del catálogo (cantidad, no duplicate keys, ruta esperada, dimensiones/contact dentro del PNG, exclusión L05 y reuse C01).
- Tests de flag y safe defaults; profundidad/offsets por funciones puras donde sea razonable; orden de creación y cleanup del cluster.
- `npm test` y `npm run build` verdes, sin bajar cobertura ni modificar tests para tapar regresiones.
- **NO browser testing, Playwright, DevTools, screenshots automáticos, ni abrir el juego para QA visual** por Integration Engineer. La inspección del prototipo se hará con captura del juego real proporcionada por Eze.
- Si se crea recurso temporal de escena, definir su cleanup al shutdown/retry; evitar duplicados al reiniciar.

## 7. Entrega, commit y siguiente gate

- Ingesta + módulo de catálogo + layout de prototipo opt-in + preload + render sample; docs actualizados y pruebas automáticas.
- Commit + push directamente a `main` cuando tests/build sean verdes, con SHA, paths, cantidades, dependencies, procedimiento de activación del prototipo, posiciones world temporales y resumen.
- Registrar estado **DJ ASSET INGESTION + SCALE PROTOTYPE INTEGRATED / AWAITING MANUAL VISUAL QA**, NO `PARTY PRESENCE CLOSED`.
- Dirección Eze habilita prototipo y captura el juego junto a Tambu, valida tamaño/contacto, consistencia y convivencia con personajes, y recién entonces autoriza **DJ CONTROLLED COMPOSITION PASS** para ubicar todas las familias en su layout final.
- En el siguiente bloque se resolverán instancias finales, depth, colliders físicos apropiados, emisiones/iluminación local y circulación. No adelantar esa etapa.

**STOP tras entregar el prototipo.**
