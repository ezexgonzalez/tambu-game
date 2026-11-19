# Tambu Game — DJ Environment Pack D v1 — Direction QA

**Fecha:** 2026-11-19  
**Entrega inspeccionada:** `Tambu_DJ_Pack_D_v1(1).zip` (archivo en la conversación, **NO subido a main**)  
**Veredicto:** **ART APPROVED / STATIC COMPOSITION PASS; RUNTIME NOT YET APPROVED**  
**Alcance:** botellas y vasos para las tres mesas aprobadas. No NPCs, no nuevas mecánicas, no edición de packs A/B/C.

## 1. Verificaciones objetivas

- ZIP contiene 11 archivos: **1 PNG nuevo** (`assets/dj_cup_red_v1.png`), 5 vistas QA y 5 documentos de handoff. El contenedor pasa prueba de CRC completa.
- C01 es **REUSE** de `public/assets/props/deck/bottle.png` en main (ruta verificada); no está copiado en el ZIP. Dimensiones documentadas 12×29, contacto (6,27), escala propuesta 1.0. No se modificó el original del deck.
- C02 es **REFINE** local a partir de `public/assets/props/dj/dj_cup_red_01.png` (ruta verificada en main), con nuevo PNG `dj_cup_red_v1.png` 14×20. Bbox opaca [1,1,13,16), alpha exactamente {0,255} y contenido no vacío. SHA-256 del PNG `24082cfdf9ee9497d8b57528dff052f94664bcc0628d6c6b592343c9ac034857` coincide con manifest. Origen de apoyo (7,15); escala propuesta 1.0.
- La tapa/boca del vaso nuevo se lee como **plástico rojo**, con anillo crema fino e interior granate, y sin banda transparente entre boca y cuerpo. Se conservó la silueta vertical estrecha, sin exagerar material ni detalle.
- Handoff entregado: README, asset_manifest.json, reuse_audit.md, validation.json y production_prompt.md.
- QA: comparativa REUSE, contact sheet, escala humana, **tres montajes de mesa F03/F04/F05 con PNG auténticos A/C/B**, cotejo con la referencia decorada de 1087×1447. No se detectaron props C03 innecesarios.
- Captura objetivo identificada como `image(4).png` 1087×1447, SHA-256 `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418`, mismo objetivo de los packs anteriores; el ZIP contiene sólo cotejo gráfico, no PNG fuente original.
- Las mesas se muestran a escala nativa con apoyos locales medidos (tapa F05: vaso izquierda/lámpara centro/botella derecha; F03: vaso, lámpara, planta V08; F04: lámpara, botella y vaso). Es prueba de composición artística, NO de runtime.

## 2. Veredicto por componente

- **C01 — Botella verde: REUSE / APPROVED FOR ART**. Ruta vigente en deck, buen reconocimiento de cuello y etiqueta. Los matices históricos más finos no bloquean uso por ahora; revisar nuevamente a 1x en el juego, sin alterar el asset original.
- **C02 — Vaso rojo: REFINE / APPROVED FOR ART**. Boca y material corregidos de manera localizada; sin renders extra ni variantes arbitrarias.
- **C03 — Microprops opcionales: OMIT / APPROVED DECISION**. La referencia funciona con botella, vaso, lámparas y V08; más piezas serían ruido.

## 3. Decisiones y límites

**Pack D queda CERRADO ARTÍSTICAMENTE.** No necesita nueva generación ni correction pass. C01 se referencia desde path existente; C02 será el único PNG nuevo que habrá que añadir a main durante integración. No sobrescribir ningún PNG de deck o DJ.

**No confundir ART APPROVED con runtime QA**: world coordinates, scale real, depth/occlusion, colliders, posiciones sobre mesas, efecto de luces, layout final y circulación no fueron probados en Phaser. Los tres ensamblajes locales no validan toda la zona.

Los ZIPs de A/B/C/D siguen siendo archivos adjuntos de conversación, no assets de main. El Integration Engineer debe recibir el kit físico de los cuatro packs y los manifests finales, y comprobar que realmente tiene todos los PNG; no se le permite inventar piezas faltantes ni fabricar una escena distinta.

## 4. Siguiente fase autorizada: DJ CONTROLLED COMPOSITION PASS

**Objetivo:** reconstruir el ambiente elegido con PNGs originales aprobados A/B/C/D y la **captura limpia real** de la zona DJ. No partir de la imagen ya ambientada porque duplicaría objetos.

Entregables antes de integrar:
1. composición editable por capas o mapa de colocación identificando cada ID de asset, orientación, escala y orden de depth;
2. preview de imagen original limpia + compositing PNGs reales, sin regenerar fondo, césped, DJ, piscina, personas ni labels;
3. inventario de instancias exacto, notas de collar/depth/occlusion, light emitters y circulación alrededor de Sofi, Uriel, Santy, Thiago y Tobi;
4. distinción técnica entre referencias de pantalla y world coordinates que el Engineer validará en Phaser;
5. QA/aprobación expresa de Dirección antes del código.

No introducir NPCs nuevos durante esta fase. El Pass de Social Population llega solamente después del ambiente aprobado/integrado.

## 5. Estado consolidado

- **Pack A:** ART APPROVED (12 PNG).
- **Pack B:** ART APPROVED (18 PNG).
- **Pack C:** ART APPROVED (9 PNG, L05 reutilizado en observación y no aprobado para nueva colocación DJ).
- **Pack D:** ART APPROVED (1 PNG refinado + 1 reutilización mediante path).
- **Total registrado:** 40 PNG entregados en ZIP A+B+C+D (12+18+9+1) y 1 dependencia reutilizada por path; **no significa 40 assets colocados o integrados**.
- **Siguiente:** controlled composition, integración, QA manual, y luego Social Population Pass.

**No declarar PARTY PRESENCE ni zona DJ CLOSED todavía.**
