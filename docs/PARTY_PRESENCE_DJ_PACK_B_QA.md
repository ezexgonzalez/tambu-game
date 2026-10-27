# Tambu Game — DJ Environment Pack B v1 — Direction QA

**Fecha:** 2026-10-27  
**Entrega auditada:** `Tambu_DJ_Pack_B_v1(1).zip` (archivo adjunto a conversación; **no** incorporado a repo)  
**Veredicto:** **TARGETED CORRECTION PASS / NOT YET ART APPROVED**  
**Scope:** vegetación, maceteros y jardineras de DJ, sin Phaser/NPC/Pack A/C/D.

## 1. Verificación de formato y contratos

- ZIP inspeccionado: **18 PNG runtime** en `assets/` + documentación en `handoff/` y QA en `qa/`.
- **18/18 RGBA**, alpha binaria (0/255), todos con margen transparente de 2px como mínimo y sin semitransparencias.
- Árbol V01 distribuido en **canopy + trunk** sobre mismo canvas `160x129`, recombinable pixel-exacto según QA del kit.
- V02 tropicales (2 siluetas), V03 ornamentales (2), V04 compactos (2), V05 con flor (2), V06 recipientes (2), V07 módulos de jardinera (3), V08 mesa (1), V09 transición (2).
- Se entregan contact sheet, variantes con recipientes, prueba de escala Tambu, árbol ensamblado, montaje de borde izquierdo e inferior y vistas de capas.
- `asset_manifest.json` describe tamaños, anchors/origins, sockets, colliders sugeridos y reglas de unión; **son recomendaciones, no prueba en runtime**.
- **Referencia adjunta correcta:** `1087x1447`, SHA-256 `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418` (misma referencia final confirmada en QA Pack A).
- Reuse audit explícito: todos NEW con justificaciones frente a patio/deck/perimeter. Reutilización no forzada.
- Transparencia, packaging y docs: **PASS**. No se realizó `npm test`/`npm run build` por no existir modificación de código; correcto.
- Sin preview compuesta sobre captura limpia. El agente reconoce explícitamente que la captura aprobada es una **imagen ya decorada** y no la usa como base para duplicar vegetación. Esta limitación **no se considera error** de este pack.

## 2. Evaluación visual

### Fortalezas que hay que congelar

- **V01 árbol:** separación tronco/copa, silueta y material base legibles; conservar salvo que la prueba contextual real descubra desajuste de escala/volumen.
- **V02 tropicales:** variantes upright/wide diferenciadas en forma, no mero recolor; buena base. No regenerar.
- **V03, V04, V08, V09:** props complementarios funcionales, coherentes en paleta y detalle; conservar salvo pequeño ajuste de unión/lectura al montar.
- **V05 arbustos florales:** base legible y variación real, pero la composición del borde inferior debe maximizar su presencia.
- Modulación V07 de `left+middle+right` existe y es utilizable; preservar el contrato básico de unión.

### Correcciones necesarias

**B01 — V07 / borde inferior: demasiado lineal, oscuro y rígido respecto del target.** El montaje queda como una franja continua de contenedor azul grisáceo con pequeñas matas uniformes. La imagen objetivo tiene borde de jardín **más frondoso, irregular y espacialmente rico**, sin recuperar la cerca vieja.

- No reconstruir todo el borde como un PNG ni regresar a hedge/fence legacy.
- Refinar la lectura superior, grosor de material y relleno de V07 con un montaje que alterne V04/V05/V09 con **profundidades, volúmenes y densidades diferentes**.
- Permitir pausas verdaderas y cambios de silueta en los conjuntos, para evitar un único listón con matas pegadas arriba.
- Mantener tres módulos y sockets compatibles si es posible; si se modifica dimensión/export, actualizar datos de unión y QA pixel-exact.

**B02 — V06 / maceteros: falta lectura de material y unión planta-recipiente.** Las caras son bastante planas/geométricas y algunas combinaciones dejan mucho hueco oscuro alrededor del tallo. Refinar discretamente borde superior/interior, canto y una masa pequeña de sustrato o sombra de inserción, sin fusionar planta y macetero ni crear píxel-ruido.

**B03 — Volumen y jerarquía del follaje en conjunto.** La combinación actual es técnicamente limpia, pero algunas familias se ven bajas y uniformemente oscuras en el ensamblaje: la referencia aprobada muestra vegetación más frondosa con capas de hojas reconocibles. Una corrección focalizada en el **montaje** y, si hace falta, en V05/V09/V04, debe mejorar volumen/superposición y variar densidad sin convertir cada hoja en alta resolución. **No subir brillo general ni pintar halos de Pack C**.

**B04 — Escala/lectura en contexto, no inventar validación runtime.** Antes de aprobar el arte final, adjuntar una comparativa local de los dos conjuntos de bordes con mobiliario Pack A *si está disponible*, o al menos siluetas a escala Tambu y densidad objetivo frente a la captura. El screenshot decorado no debe usarse como fondo de superposición que duplique plantas. No establecer world coords, colliders ni escala1.65 desde ilustración. Si no existe captura limpia, explicar limitación y mantener montajes aislados.

## 3. Contrato de correction01

- **Targeted, not wholesale regeneration**: conservar V01/V02/V03/V04/V08 salvo defecto concreto; refinar V06/V07 y ensamblajes del borde, con ajustes V05/V09 solo si son indispensables.
- Conservar 18 PNG individuales e identidad de nombres cuando sea posible, alpha binaria, pixels duros, escala propuesta1.0, origins/sockets, árbol en 2 layers.
- No introducir plantas totalmente nuevas por defecto, no añadir iluminaciones/faroles/guirnaldas (Pack C), no tocar Pack A, no NPCs.
- Devolver ZIP completo actualizado (no solo cambios), manifest/README/QA actualizados, contact sheet, **montajes de borde revisados** y tabla breve de piezas alteradas con justificación.
- Verificar montaje 1x contra Tambu y unión de V07 tras cambios; separar escena ilustrativa vs QA de runtime.
- Hasta aprobación de Dirección, **NOT APPROVED FOR RUNTIME** y no enviar al Integration Engineer.

## 4. Estado del pipeline

- Pack A: **ART APPROVED**, integración pendiente.
- Pack B: **DELIVERED / TARGETED CORRECTION REQUIRED**.
- Pack C, D: **NO START**.
- Social NPC pass: **NO START**.
- Integración: espera packs de arte/composición visual aprobados.

**Siguiente acción:** Art Director Pack B correction01. El objetivo de la corrección es enriquecer bordes y plantas **sin perder el buen contrato modular y técnico logrado**.
