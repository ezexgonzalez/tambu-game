# Tambu Game — DJ Environment Asset Manifest

**Estado:** VISUAL TARGET ACCEPTED FOR ART PRODUCTION PLANNING / ASSETS NOT APPROVED  
**Dirección:** 2026-10-21  
**Scope:** solo decoración de la zona DJ, a la izquierda de piscina y borde inferior del sector  
**Referencia visual:** última captura ambiental aceptada en conversación (1087×1447 px). Entregar esa imagen directamente a los agentes; **no está guardada como PNG dentro del repositorio**.  
**Autoridades:** `CURRENT_STATE.md`, `PARTY_PRESENCE.md`, `ART_DIRECTION.md`, `PIXEL_ART_STYLE_GUIDE.md`, `HUMAN_SCALE.md`.

## 1. Contrato

La imagen es un **objetivo compositivo**, NO sprites runtime ni referencia fiable de coordenadas/cortes exactos. Nunca recortar muebles del mockup como PNG final: recrear assets coherentes con Tambu y luego construir la composición por capas con los PNG originales.

- **No producir NPCs todavía**; Uriel, Santy, Sofi, Thiago, Tobi, Tambu y demás identidades existentes siguen protegidos.
- No alterar DJ, deck, grass, piscina, escala, cámara, física ni rutas durante asset production.
- Pixel art top-down/3/4, noche de nacimiento, hard pixels, transparencia RGBA, sin antialias, sombras de contacto contenidas. **No hornear halos de luz**.
- Escala: 1H = 59.52 world px (alto nominal de Tambu). Las proporciones indicadas son rangos de intención, no especificaciones de corte exacto; medir junto a Tambu antes de congelar exportaciones.
- **Tier B** para muebles/plantas/lámparas y **Tier C** para vasos/botellas/microdetalle. Mantener la piscina, DJ y personajes como Tier A.
- Cantidades son **instancias visibles aproximadas de la captura**, no archivos únicos. Crear familias y variantes reutilizables.
- Separar en los archivos el mobiliario, plantas, lámparas y clutter que requieran depths/colliders/iluminación independientes. No generar un atlas gigantesco con la escena entera.
- Un asset existente en `public/assets/props/patio/` es **CANDIDATE**, no approved runtime. Los assets de `public/assets/props/deck/` requieren comprobación de escala/estilo para reutilización.
- El borde inferior ya fue limpiado de perímetro legacy. Los maceteros modulares diseñados ahora **no son** recreación del fence/hedge rechazado ni deben formar collider perimetral invisible.

## 2. Pack A — Mobiliario (producir primero)

| ID | Asset / componente | Instancias en imagen | Diseñar y exportar | Aproximación escala | Estado / prioridad |
| --- | --- | --- | --- | --- | --- |
| F01 | **Sofá exterior modular en L, beige-gris nocturno** | 2 composiciones, superior e inferior izquierda | Familia de esquina + tramo recto + remate frontal, permitiendo dos montajes sin dos ilustraciones de sofá enteras. Sombra bajo base, silueta legible y respaldo top-down 3/4. Piezas/layers aptas para depth cuando un NPC se siente más adelante. | cada conjunto ~2.8–4.0H de ancho visual según montaje | NEW · P0 |
| F02 | **Almohadones lounge** | ~3–4 | Variante beige cálido y azul noche, separables del sofá para evitar duplicación. No agrandarlos. | 0.3–0.55H | NEW · P1 |
| F03 | **Mesa baja auxiliar cuadrada de madera oscura** | 1, junto al sofá superior | Top visible, patas cortas, volumen sobrio, superficie para lámpara, vaso y macetita. | 1.2–1.8H ancho | NEW · P0 |
| F04 | **Mesa ratona circular baja de madera** | 1, centro lounge inferior | Tapa circular, base visible, altura baja, sirve para lámpara/bebidas. No confundir con mesa alta de cóctel. | 1.2–1.8H diámetro | NEW · P0 |
| F05 | **Mesa redonda alta de cóctel con pie único oscuro** | 1, arriba a izquierda | Superficie pequeña para bebidas; pata central, base inferior, sin mesa picnic. Comprobar `patio_table_round_01.png` como candidato, no asumir aprobado. | 0.9–1.25H diámetro de tapa | CANDIDATE / NEW · P0 |
| F06 | **Pouf redondo tapizado claro** | 1, junto al sofá superior | Cilindro bajo, tapa texturizada muy simplificada, 3/4. Comprobar `patio_pouf_01.png`. | 0.8–1.1H diámetro visual | CANDIDATE / NEW · P1 |
| F07 | **Alfombra circular tejida exterior** | 1, debajo de lounge inferior | Asset plano para suelo con trama y círculos discretos, sin ruido fino; NO collider. Debe renderizar debajo de sofá/mesa. | ~2.5–3.5H diámetro | NEW · P1 |

**Entrega Pack A:** PNG transparentes por pieza/módulo + muestra ensamblada de dos lounges y mesa alta junto a Tambu. No hacer personas sentadas en esta pasada.

## 3. Pack B — Vegetación y jardineras

| ID | Asset / familia | Instancias estimadas | Diseñar y exportar | Aproximación escala | Estado / prioridad |
| --- | --- | --- | --- | --- | --- |
| V01 | **Árbol frondoso ornamental de esquina** | 1, superior izquierda | Tronco visible, copa asimétrica, 2–3 masas tonales, apto para recibir guirnalda sin hornear bombillas; separar tronco/copa si se necesita oclusión correcta. | copa ~2–3H ancho, validar contra DJ | NEW · P0 |
| V02 | **Planta tropical de hoja ancha / lanceolada** | ~4–6 usos en macetones, ambos bordes | Una familia con **2 siluetas diferentes** y orientaciones controladas, no clonar idéntica cada tramo. Hoja dura, sombras azules; usar maceta V06 donde aplique. | 0.9–1.7H alto visual | CANDIDATE / NEW · P0 |
| V03 | **Planta ornamental baja de hoja abierta, con alguna flor clara** | ~2–4 grupos en borde izquierdo | 2 variantes de volumen y floración muy contenida; no llenar toda la franja. Puede reutilizar `patio_planter_broad_01.png` o `patio_planter_spike_01.png` solo tras QA. | 0.5–1.0H alto | CANDIDATE / NEW · P1 |
| V04 | **Arbusto compacto redondeado verde oscuro** | ~2–3 | Volumen ancho en 2 variantes, una para maceta próxima al sofá inferior y otra para bordes. Revisar `patio_shrub_low_01.png`. | 0.7–1.1H ancho | CANDIDATE / NEW · P1 |
| V05 | **Arbusto bajo con flores claras/rosadas** | ~3 segmentos principales en franja inferior + pequeñas variantes | 2 variantes modulares que conviven con V04. Flores discretas de Tier C; no repetir patrón exacto. Revisar `patio_shrub_flower_01.png`. | 0.6–1.1H ancho por módulo | CANDIDATE / NEW · P0 |
| V06 | **Macetón alto rectangular/cuadrado oscuro** | ~5–7, especialmente left/right | 2 variantes de contenedor (alto y ancho), vegetal intercambiable por capas; base sólida para collider selectivo. Revisar `patio_crate_plant_01.png` y `props/deck/planter_dark.png` como referencias/candidatos. | 0.65–1.1H ancho base | CANDIDATE / NEW · P0 |
| V07 | **Jardinera lineal modular baja** | 3 conjuntos inferiores (con uniones/pilares) | Base de mampostería/piedra oscura, piezas izquierda/centro/derecha y ocupación variable con V04/V05; no hacer una muralla o fence continua. | largo total variable, módulo ~1–2H | NEW · P0 |
| V08 | **Macetita verde de mesa** | 1, mesa auxiliar superior | Pequeño recipiente oscuro con hojas compactas, separado de F03. | 0.2–0.4H visual | NEW / deck candidate · P2 |
| V09 | **Masa vegetal irregular secundaria para margen izquierdo** | 2–3 transiciones, sin repetición lineal | Variantes pequeñas de hojas y follaje denso para fundir árbol, maceteros y lounge, sin pintar foliage encima del césped como fondo único. | 0.6–1.5H por grupo | NEW / patio candidate · P1 |

**Entrega Pack B:** siluetas vegetales independientes, contenedores independientes cuando permita cambiar combinaciones, y 2 composiciones de muestra: borde izquierdo y jardineras bajas inferiores. No confundir con el perímetro legacy eliminado.

## 4. Pack C — Iluminación

| ID | Asset / familia | Instancias estimadas | Diseñar y exportar | Aproximación escala | Estado / prioridad |
| --- | --- | --- | --- | --- | --- |
| L01 | **Farol de suelo con marco oscuro, cuerpo alto** | ~4–6 | Silueta de farol vertical y vidrio ámbar; variantes de tamaño/soporte solo donde aporte. Reutilizar `props/deck/lantern.png` únicamente tras revisión de escala. | 0.6–1.1H alto | CANDIDATE / NEW · P0 |
| L02 | **Luminaria corta de poste/baliza cuadrada** | ~3–4, principalmente borde inferior | Poste oscuro con panel cálido pequeño. Coordinar con jardineras V07 y no crear cercado nuevo. | 0.5–1.0H alto | NEW · P0 |
| L03 | **Guirnalda cálida modular** | ~2 tramos visibles, borde superior izquierdo/derecho | Cable/segmento, bombilla y puntos de fijación que permitan curvar una tira de varios focos; no generar toda la escena como sprite único. No copiar guirnaldas Graphics legacy. | bombillas pequeñas frente a 1H | NEW · P1 |
| L04 | **Lamparita portátil cálida de mesa** | ~3, en mesas alta/baja | Lámpara pequeña sobre superficie, 1 variante base; light layer separado del PNG. | 0.25–0.55H alto | CANDIDATE / NEW · P0 |
| L05 | **Farol pequeño apoyado al borde del DJ / laterales** | ~2 cerca de DJ + sitios laterales si son necesarios | Puede reutilizar L01 a escala apropiada. No rediseñar la cabina de DJ ni hornear su luz en el booth. | validar in situ | REUSE L01 · P1 |

**Contrato luz:** todos los `glows` y contaminaciones cálidas de la referencia deben implementarse como feedback/luz runtime separado, con parámetros y puntos de origen anclados a las luminarias. **No generar PNG de grandes halos**.

## 5. Pack D — Bebidas / detalles pequeños

| ID | Asset / familia | Instancias estimadas | Diseñar y exportar | Aproximación escala | Estado / prioridad |
| --- | --- | --- | --- | --- | --- |
| C01 | **Botella verde con etiqueta mínima** | ~2–3, sobre mesas | 1 variante vertical reutilizable. Revisar `props/deck/bottle.png`; no añadir lettering legible artificial. | 0.2–0.4H | DECK REUSE CANDIDATE · P0 |
| C02 | **Vaso plástico rojo** | ~3–4, sobre mesas | 1 variante + versión girada solo si hace falta. Si `props/deck/glass.png` no parece plástico rojo, producir nuevo. | 0.17–0.3H | NEW / deck candidate · P0 |
| C03 | **Detalles de vaso/mesa opcionales** | 0–2 | Pequeña servilleta/posavasos si el render final necesita lectura de uso. No introducir clutter que la captura no pide. | Tier C | OPTIONAL · P2 |

No crear NPCs, platos, basura masiva, botellas en toda la pista, animaciones ni props que no se vean o no justifiquen su producción en esta referencia.

## 6. Mapa de intención compositiva

La captura (1087×1447 px) es una **referencia ilustrada**. Las regiones siguientes son proporciones de imagen, **NO world coords**:

- **Arriba izquierda:** árbol V01 + vegetación V03/V09 + guirnalda L03 + luminaria L01; mesa alta F05 con C01/C02/L04. No cargar la entrada frontal al DJ.
- **Izquierda media:** primer lounge F01 + F03 + F06, con almohadones F02 y maceta V06/V02; lámparas L01/L04. Mantener acceso desde el centro.
- **Izquierda inferior:** segundo lounge F01 + F04 + F07, almohadones, botella/vaso y lámpara; maceta/arbusto lateral V04 y V06/V02. Mantener el centro libre para población posterior.
- **Borde inferior:** V07 modular con V04/V05 y L02 a intervalos desiguales. Es un cierre visual del área dibujada, no un muro/collider obligatorio.
- **Lateral derecho/piscina:** maceteros altos y faroles puntuales V02/V06/L01; no intervenir visuales internos de la piscina.
- **DJ:** su arquitectura, posición y assets están LOCKED; iluminación complementaria solo mediante fuentes/objetos adyacentes.
- **Centro:** **RESERVED FOR FUTURE SOCIAL PASS**. No añadir NPCs/mesas grandes/props que afecten circulación.
- **Uriel, Santy, Sofi, Thiago, Tobi:** conservar posición, scale, sprite, labels, markers y radio de interacción.

## 7. Revisión de assets reales antes de producir

**Archivos verificados en repo (disponibilidad de ruta, no aprobación visual):**

- `public/assets/props/patio/`: `patio_bench_01.png`, `patio_cooler_party_01.png`, `patio_crate_plant_01.png`, `patio_planter_broad_01.png`, `patio_planter_spike_01.png`, `patio_pouf_01.png`, `patio_shrub_flower_01.png`, `patio_shrub_low_01.png`, `patio_table_round_01.png`, `patio_table_served_01.png`. Estos son **candidatos históricos**, no runtime approved.
- `public/assets/props/deck/`: `bottle.png`, `glass.png`, `lantern.png`, `planter_dark.png`, `planter_terracotta.png`, `stool.png`, `doormat.png`. Son assets existentes del deck; validar compatibilidad antes de reutilizarlos en césped.
- `public/assets/props/perimeter/` está histórico/NO ACTIVE y no autoriza reutilizar fence o hedge anteriores.
- Grass/night base y DJ/house/pool activos permanecen protegidos.

**No declarar un asset EXISTING APPROVED por ver solo su filename.**

## 8. Producción / handoff

1. **Art Director, audit corto de reuse:** comparar candidatos patio/deck con referencia, clasificar REUSE / ADJUST / NEW. No enviar veinte generaciones simultáneas.
2. **Pack A: piezas grandes de mobiliario primero**, con una referencia de Tambu a escala 1 y montaje de los dos lounges.
3. **Pack B: 2–3 siluetas vegetales, macetones y jardineras**, sin 1 planta única repetida.
4. **Pack C: familia de faroles y luz de mesa**, glow fuera del PNG.
5. **Pack D: validar reuse de botella, vaso y pequeños objetos**.
6. **Composer/integration preview:** componer PNGs aprobados sobre la captura limpia usando capas controlables, sin alterar personajes ni fondo. Validación Dirección. 
7. **Integration Engineer:** preload, anclajes, origins, scale, footDepth, depth occlusion, colliders únicamente de muebles sólidos, lámparas como fuente de luz, cleanup, tests/build y push `main`.
8. **Social Population Pass posterior:** ninguna persona nueva hasta aprobar el entorno implementado.

## 9. QA criteria

- Ningún asset aislado de captura generada se usa como runtime PNG.
- Todos los props con transparencia y escala de Tambu comprobada.
- 2 lounges armados con familia modular, no dos PNGs gigantes de capturas.
- Variantes de foliage y jardineras que evitan regularidad artificial.
- 3 bases de jardineras inferiores, sin reinstalar perímetro legacy.
- Luces con fuente tangible, halos runtime.
- Interactables libres y accesibles; movimiento viable.
- Occlusion/depth correctos (personajes delante/detrás según pies).
- Colliders con footprints, no rectángulo total de sprite ni decoración colisionable por defecto.
- El resultado visual se parece al mockup sin sacrificar realidad runtime.
- No se declaran assets APPROVED hasta QA individual y escena.

**Siguiente paso:** encargar **ART DIRECTOR — DJ DECORATION ASSET KIT / PACK A**, con captura + este manifiesto. No mandar aún nada al Integration Engineer.
