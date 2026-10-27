# Tambu Game — DJ Environment Pack A — Direction QA

**Fecha:** 2026-10-26  
**Entrega inspeccionada:** `tambu_dj_environment_pack_a_v1(1).zip` (archivo de conversación, NO integrado ni alojado en repo)  
**Veredicto:** **CORRECTION PASS — NOT APPROVED FOR RUNTIME**  
**Scope:** PACK A mobiliario únicamente. No vegetación, luces, bebidas, NPCs ni Phaser.

## 1. Verificación objetiva

- ZIP contiene **12 PNG individuales** RGBA, con transparencia exclusivamente 0/255; no antialias de alpha.
- Contiene **5 módulos de sofá**, **3 mesas**, **2 almohadones**, **1 pouf** y **1 alfombra**.
- Incluye **2 previews de lounges**, contact sheet, hoja de comparación junto a Tambu y handoff MD/JSON (anchors, colliders sugeridos, orden de montaje).
- Las dos L comparten módulos sin depender de capturas recortadas.
- Incluye 2 px de margen transparente y recomendación runtime `scale=1.0`; Tambu se presenta a `1.24`. Físicas/anchors son propuesta técnica, **no QA runtime**.
- **No existe integración ni QA de mundo real todavía**, ni se ejecutó `npm test` o `npm run build` para este pack artístico (correcto: no code changes).

## 2. Bloqueo de referencia de producción

El JSON del pack declara `reference_image.actual_dimensions = [1086,1448]` con nombre `Fiesta nocturna pixelada en el jardin (1)(1).png`.

La **última** referencia ambiental entregada y aceptada por Dirección en conversación es la captura de **1087×1447** (iteración de refinamiento posterior). Son variantes visualmente diferentes, no un problema de 1 px de exportación.

**Corrección obligatoria:** producir/comparar **contra la última captura aprobada de 1087×1447**, adjuntarla explícitamente con el brief. No basar QA sobre una versión anterior ni inventar coordenadas world a partir de una ilustración.

## 3. QA visual por pieza

- **F01 sofá modular**: **BASE STRUCTURAL GOOD / VISUAL TUNING**. La geometría es modular y legible, pero la textura/repetición de costuras de los módulos centrales y bordes de la esquina necesitan un refinamiento fino. Comprobar uniones limpias a tamaño 1x y apariencia frente a la captura final; conservar módulos/contratos de piezas salvo bug de unión real.
- **F02 almohadones**: **BASE ACCEPTABLE / KEEP**, revisar escala/color sobre el F01 final; no reabrir identidad salvo contraste pobre en preview.
- **F03 mesa auxiliar cuadrada**: **VISUAL CORRECTION**. La tapa parece una placa simple de tablas y sus patas/base se leen poco. Reforzar volumen/perspectiva 3/4, grosor de tapa, soporte y relación con sofá sin incrementar pixel noise.
- **F04 mesa ratona circular**: **VISUAL CORRECTION**. Parece una tapa/óvalo muy bajo; falta distinguir con claridad borde, grosor y base baja respecto de la mesa alta F05, y aproximarse mejor a la referencia final.
- **F05 mesa alta de cóctel**: **BASE ACCEPTABLE / KEEP**, validar que pedestal/tapa se lean bien junto a Tambu y con futuros vasos. No convertir en mesa picnic.
- **F06 pouf**: **VISUAL CORRECTION**. Forma actual muy genérica/sin lectura de tapizado, frente a referencia con ribete/pliegues o costuras. Añadir solo detalle material localizado y controlar contraste.
- **F07 alfombra circular**: **VISUAL CORRECTION**. Patrón excesivamente concéntrico/regular; que se lea tejido de exterior y no tronco/aro de madera. Textura controlada de Tier B/ground, sin antialias ni ruido.

**Observación general:** las piezas son limpias y legibles, pero algunos materiales parecen demasiado básicos frente al nivel de detalle de la captura objetivo y los assets Tier A ya aprobados. Se requiere pulido selectivo, no una nueva dirección estética ni una regeneración completa del pack.

## 4. Requerimientos de reentrega

1. Identificar claramente última captura objetivo (1087×1447), citarla en el handoff y mostrar comparativa de ambos lounges contra ella sin alterar personajes/entorno.
2. Conservar separación PNG, paleta nocturna, alpha binaria, escala, módulos y metadata salvo que correcciones lo exijan.
3. Refinar **F01, F03, F04, F06, F07** según QA. Mantener F02/F05 excepto ajustes de fit/contexto indispensables.
4. Validar uniones de ambos sofás, lectura de materiales, sombras de contacto, orientaciones y proporciones con Tambu.
5. Incorporar **una preview de composición de mobiliario con los PNG reales** sobre una **copia de la captura aprobada** (solo para QA; sin cambiar pixels de fondo/personajes), o reportar explícitamente si no puede realizarla. NO generar una nueva escena completa ni integrar código.
6. Actualizar los 12 archivos del kit solo donde hay corrección, contact sheet, previews, handoff MD/JSON y manifiesto de cambios. No inventar atributos de QA completados por integración.

## 5. Gates futuros

Hasta aprobar visualmente: **NO entregar a Integration Engineer, NO integrar al runtime, NO declarar Pack A CLOSED**.

No producir Pack B/C/D ni agregar NPCs como parte de la corrección. Al terminar, Dirección inspecciona la nueva entrega y da veredicto: APPROVED / CORRECTION PASS / REJECT.


---

## 6. Direction QA — correction01 (2026-10-27)

**Entrega revisada:** `tambu_dj_environment_pack_a_correction01(1).zip` (archivo adjunto en conversación; no subido al repo).

**VEREDICTO: APPROVED FOR ART / PENDING RUNTIME INTEGRATION QA.**

Se cerraron los bloqueos de producción visual de Pack A. Se inspeccionaron los 12 PNG, contact sheet, dos lounges aislados, comparación a escala con Tambu, preview contextual y comparativa de material. Se comparó binariamente la referencia del ZIP contra `image(4).png`, confirmando imagen final idéntica de **1087×1447** y hash `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418`.

### QA material y contrato

- F01 (5 módulos de sofá): **APPROVED ART**. Costuras, planos de tapizado y transición de esquina más limpios; ensamble preservado sin modificar geometrías/sockets.
- F02 (2 cojines): **APPROVED ART**, binariamente sin cambios respecto de v1.
- F03 mesa cuadrada: **APPROVED ART**. Grosor de tapa, soporte y patas más definidos.
- F04 mesa circular baja: **APPROVED ART**. Base baja y canto separados de tapa.
- F05 mesa cóctel: **APPROVED ART**, binariamente sin cambios.
- F06 pouf: **APPROVED ART**. Costura/ribete legible sin incremento excesivo de detalle.
- F07 alfombra: **APPROVED ART**. Tejido más orgánico, sin collider.

Comprobaciones propias sobre ambos ZIPs: **12/12** RGBA `alpha={0,255}`, bbox de contenido con margen transparente, **9 modificados + 3 idénticos**. Previews y handoff MD/JSON presentes. Composición overlay no altera píxeles fuera de su cobertura. No se ejecutaron tests/build de juego porque no hubo código ni implementación.

### Importante: qué NO está aprobado todavía

- **No hay world coords congeladas ni colliders validados.** La preview contextual utiliza un multiplicador ilustrativo `1.65` y superpone muebles sobre mobiliario ya dibujado en la captura. Es útil para comparar materiales, **no** un layout limpio ni prueba de escala/oclusiones dentro de Phaser.
- **No copiar `1.65` al runtime:** los sprites nativos se entregan con `scale=1.0` sugerido. Debe verificarse en juego frente a Tambu y geometría real.
- En futura composición e integración, evitar duplicación de muebles visuales de referencia, comprobar profundidad por piezas de sofá, respetar el hueco interior de los colliders en L y mantener alfombra no colisionable.
- La aprobación no autoriza automáticamente editar la escena, agregar props/fillers ni declarar PARTY PRESENCE CLOSED.
- El ZIP de producción sigue fuera del repositorio; la aprobación del documento NO equivale a incorporación de los PNG en `main`.

**Siguiente paso autorizado de producción artística:** DJ **Pack B — Vegetación y bordes** basado en la misma captura final y manifiesto. **Integration Engineer permanece en espera** hasta disponer de Pack A/B/C/D aprobados y composición en contexto revisada por Dirección. Social NPC Pass después.

No reabrir Pack A salvo bug visual o de ensamblaje demostrado en un preview de runtime posterior.
