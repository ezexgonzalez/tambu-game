# Tambu Game — Party Presence

**Versión:** 1.2  
**Estado:** DJ ENVIRONMENT DESIGN / BORDER FIRST — ACTIVE (concept only)  
**Fecha:** 2026-10-15  
**Scope:** V1 · patio actual  
**Autoridad relacionada:** `CURRENT_STATE.md`, `GAME_DESIGN.md`, `ART_DIRECTION.md`, `PIXEL_ART_STYLE_GUIDE.md`

---

# 1. Objetivo

PARTY PRESENCE es el bloque que debe hacer que el patio se sienta como una fiesta incluso cuando Tambu no está interactuando con nadie.

La meta no es construir una simulación social compleja.

La meta es lograr:

> **poca simulación, mucha percepción de vida.**

Si Tambu se queda quieto durante unos 20 segundos, el jugador debe seguir percibiendo:

- gente reunida con intención;
- zonas sociales reconocibles;
- pequeñas actividades;
- movimiento ambiental;
- sonido;
- momentos que no dependen de Tambu.

---

# 2. Problema actual

El runtime actual contiene **0 LEGACY FILLERS**. La población procedural histórica (37 originalmente, 35 después del prototype DJ PASS 01A) fue removida por Dirección para preparar un canvas limpio.

Se retiran también perímetro rechazado, mesas/cooler Graphics, guirnaldas/postes, faroles procedurales y clutter del piso, incluidos colliders de props que desaparecieron. Ninguna coordenada legacy representa un anchor aprobado para la nueva composición.

La V1 no tiene un target de cantidad heredado. El número de personajes y sus actividades debe salir de cada mockup de zona aprobado. No se crea replacement durante este pass.

---

# 3. Nueva regla de composición

A partir de este bloque los fillers NO se distribuyen como puntos individuales.

Se diseñan como:

## SOCIAL ZONES
+
## MICRO-CLUSTERS
+
## NEGATIVE SPACE
+
## CIRCULATION

Primero se decide:

1. dónde tiene sentido que la gente se junte;
2. qué está haciendo ese grupo;
3. cuántas personas necesita la escena;
4. qué espacio debe quedar libre alrededor.

Después se colocan NPCs.

No al revés.

---

# 4. Social zones V1

La distribución final se trabajará por zonas, no toda de una vez.

Macrozonas previstas:

1. **DJ / dance floor**
2. **barra**
3. **bordes de piscina**
4. **deck / casa**
5. **césped inferior / chill-social**
6. **circulación y acceso**

Estas zonas NO tienen que contener la misma cantidad de gente.

La densidad debe responder a su función.

DJ y barra pueden ser polos de densidad.

Los caminos y accesos necesitan aire.

La piscina sigue siendo el centro visual y no debe quedar rodeada por una corona uniforme de NPCs.

---

# 5. Negative space

El espacio vacío es parte del diseño.

No llenar por llenar.

Debe mantenerse libre:

- rutas principales de Tambu;
- accesos;
- frente inmediato de personajes interactuables;
- rutas del Bathroom Event;
- lectura visual de piscina;
- zonas alrededor de props importantes;
- corredores entre macrozonas.

Un patio vivo no significa un patio saturado.

---

# 6. Micro-clusters

Cada grupo debe leerse como una pequeña situación.

Ejemplos:

- 3 personas bailando;
- pareja conversando;
- 2 personas con bebida mirando al DJ;
- grupo pequeño mirando la piscina;
- pareja aislada;
- una persona con teléfono al margen;
- dos personas sentadas/chill.

No todos los clusters necesitan animación compleja.

Una buena orientación + spacing + una actividad clara puede vender la escena.

---

# 7. Activities V1

La V1 busca pocas actividades legibles y reutilizables.

Familia inicial:

- DANCE
- CHAT
- DRINK
- PHONE
- SIT / CHILL
- KISS / COUPLE

No crear ahora:

- schedules;
- navegación general;
- necesidades;
- relaciones simuladas;
- AI social;
- roaming libre;
- conversaciones completas de fillers.

Las actividades deben ser visuales, no solo metadata.

---

# 8. Audio dentro de Party Presence

Party Presence también incluye una foundation de audio mínima:

- música de fiesta;
- ambiente de gente;
- SFX ambientales puntuales;
- SFX de eventos importantes;
- mute;
- volumen.

No construir un sistema de audio gigantesco antes de V1.

La presencia sonora debe acompañar las social zones y reforzar que DJ/bar/piscina tienen funciones distintas.

---

# 9. Ambient beats

Después de resolver zonas y población base se implementarán **2–3 beats ambientales de alto impacto**.

No serán quests ni sistemas nuevos.

Deben ser pequeñas situaciones visibles que hagan sentir que la fiesta sigue ocurriendo sin Tambu.

Principio:

> dos momentos memorables valen más que veinte NPCs moviéndose aleatoriamente.

El contenido exacto se decide después de cerrar las social zones.

---

# 10. Orden de trabajo actualizado

Dirección establece como preparación obligatoria el CLEAN CANVAS. Tras varias generaciones completas de capturas con NPCs y props improvisados, se cambia el método: **captura real limpia → environment design sin NPCs → manifiesto de assets y layout aprobado → Art Director produce PNGs por familias → composición controlada con esos assets sobre captura original → social composition con NPCs → Integration Engineer reproduce target aprobado**. Las imágenes anteriores de crowd/decoración son exploraciones rechazadas, NO objetivos aprobados. El antiguo prototype basado en fillers queda supersedido.

## PASS 1 — ENVIRONMENT DESIGN / BORDER FIRST

- estudiar referencias de paisajismo y mobiliario de una fiesta nocturna en patio moderno (función y materiales), separadas de la referencia de estilo pixel-art de Tambu;
- trabajar primero el **borde izquierdo y el borde inferior del sector DJ** señalados por Dirección en la captura anotada;
- especificar ambientación, mobiliario, vegetación, iluminación, apoyos de bebidas, circulación y un manifiesto de assets; **sin agregar NPCs nuevos ni generar otra captura completa en esta subfase**;
- la captura define geometría y piezas protegidas, pero la idea se valida como plano compositivo y catálogo de props antes de la producción.

## PASS 2 — ART PRODUCTION + CONTROLLED COMPOSITE

- Art Director produce las familias de assets necesarias en PNG transparentes aprobables a escala del juego;
- composición supervisada y editable de los PNG sobre la captura limpia, sin reinterpretar la totalidad del mundo;
- iterar ubicación/espaciado/variedad de props por capas hasta aprobar la escena ambiental.

## PASS 3 — SOCIAL COMPOSITION + FILLER FAMILY

- incorporar clusters y actividades sobre el entorno ya diseñado, sin redistribución aleatoria;
- producir solo la familia pequeña de NPCs/poses que esa composición necesita;
- conservar legibilidad de Sofi, amigos, DJ, accesos y rutas.

## PASS 4 — AUDIO FOUNDATION

- música;
- ambience;
- SFX esenciales;
- volumen/mute.

Puede avanzar en paralelo cuando no dependa de assets visuales.

## PASS 5 — ACTIVITIES + AMBIENT BEATS

- convertir metadata en actividad visible;
- sumar 2–3 beats ambientales;
- QA de patio vivo.

---

# 11. First target — DJ SOCIAL ZONE

La primera zona oficial de Party Presence es:

> **DJ / DANCE FLOOR**

Razones:

- es un polo social natural;
- ya existe una estructura DJ fuerte;
- es una zona que debería comunicar fiesta inmediatamente;
- permite probar clustering, densidad y activities sin tocar todo el patio.

Runtime actual relevante:

- DJ: `x 116, y 202, width 302, height 120`;
- fillers asociados al DJ: **0**, hasta aprobar el nuevo mockup;
- Uriel y Santy ya están físicamente cerca de esta zona;
- el scatter legacy ya no está activo ni sirve como referencia de composición.

Los amigos principales son anchors protegidos.

No mover Uriel/Santy como parte de este pass salvo decisión explícita posterior.

---

# 12. DJ zone — intención espacial

La zona DJ debe tener tres capas perceptuales:

## A. DANCE CORE

Un cluster compacto frente al DJ.

Debe sentirse como:

“acá está la gente que realmente está bailando”.

No una línea ni una grilla.

## B. SOCIAL EDGE

1–2 microgrupos a los costados/periferia:

- hablando;
- tomando;
- mirando el DJ.

Sirven para que el dance floor tenga borde social en lugar de terminar abruptamente.

## C. BREATHING / CIRCULATION SPACE

Debe quedar aire entre:

- DJ;
- dance cluster;
- piscina;
- Uriel/Santy;
- rutas de Tambu.

El jugador tiene que poder atravesar la zona sin leerla como una pared humana.

---

# 13. DJ zone — source of truth vigente

La captura limpia real del patio es referencia geométrica de la zona y de los anchors protegidos. **No usar una generación única de imagen final como contrato de producción.** Primero plano/composición ambiental y manifiesto, luego assets aprobados y composición con capas PNG reales; recién después NPCs y handoff técnico.

No reutilizar distribución procedural eliminada ni las ilustraciones IA rechazadas como objetivos. No mover DJ, piscina ni amigos principales para acomodar un diseño. No agregar fillers/props/decoración al runtime antes de aprobación visual y assets.

---

# 14. Criterios de aceptación — DJ zone

El prototype queda aprobado si:

1. la zona se lee como un polo social claro;
2. el dance core se reconoce inmediatamente;
3. los NPCs no parecen colocados al azar;
4. hay al menos un borde social además del grupo central;
5. Uriel y Santy siguen legibles como personajes principales;
6. Tambu puede circular;
7. no se bloquea el acceso al resto del mapa;
8. no invade visualmente la piscina;
9. existe negative space;
10. el número de fillers parece intencional, aunque sea menor que hoy.

---

# 15. Definition of Done — Party Presence

PARTY PRESENCE se considera cerrado para V1 cuando:

- la población está organizada por social zones;
- los fillers ya no parecen una distribución aleatoria;
- existe una familia visual pequeña/reutilizable;
- actividades principales son legibles;
- existe audio mínimo;
- existen 2–3 ambient beats;
- caminar por el patio tiene ritmo visual;
- los caminos siguen claros;
- el mapa no está sobrecargado.

Prueba final:

> **Si Tambu se queda quieto durante 20 segundos, ¿parece que está en una fiesta?**

Si sí, el bloque cumple su función.

---

# 16. Fuera de scope

No construir para V1:

- 37 personajes únicos;
- NPC AI;
- schedules;
- pathfinding general;
- simulación social;
- procedural crowd system complejo;
- conversaciones profundas de fillers;
- nuevos personajes principales;
- segundo mapa;
- roaming autónomo global.

PARTY PRESENCE debe terminar la fiesta actual, no convertirse en otro juego.


---

# 17. PASS 01A — histórico / supersedido

El prototype DJ de `main@adb6887` pasó de seis a cuatro fillers. Fue una exploración temporal; Dirección lo reemplaza por CLEAN CANVAS. Sus coordenadas y actividades no son dirección vigente y fueron retiradas de la data runtime. Git conserva el historial.

---

# 18. CLEAN CANVAS — integrado — 2026-10-04

**PARTY PRESENCE — CLEAN CANVAS INTEGRATED / VISUAL QA REQUIRED.**

- Fillers: **35 → 0**, sin lista espacial `fillerGroups` ni tweens/parejas decorativas activos.
- Perímetro: fence laterales, hedge inferior, esquinas vegetales/transiciones retirados; `patioPerimeter.js` eliminado y sin preload. PNG históricos conservados, no activos.
- Ambientación Graphics legacy: mesas, cooler, guirnaldas/postes, patio lanterns y floor clutter retirados sin reemplazo. Entries de layout y funciones consumidoras eliminadas.
- Colliders: retirados `party-table-0`, `party-table-1`, `cooler`; preservados los ocho rects de house/pool/bar/DJ.
- Preservados: grass, deck/edge/access, fachada con wallPlanters, piscina completa, barra y DJ (incluidos props/performers integrados). El deck estable conserva sus luces/props seleccionados. Tambu, seis amigos y Sofi/Mili/Cami permanecen exactamente en sus posiciones con su runtime actual. No cambia ningún evento, cámara, UI, rewards, diálogo ni ruta.

Validación: **259/259 tests aprobados; 0 fallos, 0 omitidos. `npm run build` correcto**, con advertencia conocida de chunk >500 kB. Se actualiza cobertura de `createCharacters` para cero placeholders, seis amigos y tres interactables; world/preload preservan estructuras y excluyen perímetro; colisiones eliminan únicamente props retirados y liberan sus ubicaciones. Assets y módulos estructurales protegidos sin modificaciones.

No se realizó navegador, screenshots ni ejecución visual local. No se declara aprobación visual. **STOP después del push.** La próxima acción es de Dirección:

**CLEAN PATIO SCREENSHOT → SOCIAL ZONE DESIGNER → APPROVED DJ ZONE MOCKUP → ART DIRECTOR → INTEGRATION ENGINEER.**

Sin nueva población, props, vegetación ni decoración en esta pasada.

---

# 19. DJ ENVIRONMENT DESIGN — borde primero / nueva metodología — 2026-10-15

**Estado: ACTIVE CONCEPT / NO ASSETS OR CODE APPROVED.** Dirección rechaza las iteraciones previas de “generar una fiesta completa encima de la captura”: acumulación de props repetidos, plantas como sellos de perímetro, mesas de picnic, crowd dispuesto por relleno e incoherencias de estilo.

## Alcance de la primera prueba

- Trabajar únicamente **el borde izquierdo y el borde inferior de la zona DJ marcados en rojo en la captura de referencia**. Son **límites visuales del sector que se está diseñando**, no nuevas coordenadas ni una instrucción de construir un muro/collider/perímetro uniforme a lo largo de todo el mapa.
- **No agregar NPCs** en este primer diseño ambiental. Uriel, Santy, Sofi, Thiago y Tobi permanecen visibles e intactos en sus ubicaciones aprobadas.
- Priorizar un **borde vivo** y no una cerca decorativa: alternancia de grupos vegetales desiguales, posibles tramos de lounge/mobiliario moderno, iluminación con causa física y pequeños apoyos de bebidas solo donde exista función.
- Romper repetición: cada familia de planta/mueble debe tener razón de colocación, silueta/variación y escala coherentes. Evitar una maceta idéntica en cada intervalo; evitar convertir todo el borde en una muralla de vegetación.
- La zona central queda mayormente libre en esta primera prueba, sin que eso implique que será así en el resultado final. Se diseñará la distribución social después de aprobar el borde y el entorno.
- Preservar corredores, colisión, acceso al DJ, piscina, Sofi y todos los personajes/estructuras. No recrear bordes rechazados del CLEAN CANVAS.

## Entregable del Environment Designer, antes de generar imágenes

1. Diagnóstico de la captura real y función del borde, distinguiendo tramo izquierdo, esquina y tramo inferior.
2. **Dos variantes conceptuales acotadas**, con distinta combinación de vegetación/mobiliario/iluminación, ambas viables con assets pixel-art modulares.
3. Plano de colocación descriptivo por tramos, anclado a elementos visibles; si se presenta un esquema anotado, debe ser de planificación y no simular una captura final.
4. Catálogo/manifest de assets: ID, silueta/material/escala relativa, variantes mínimas, cantidad aproximada, orientación, propósito, prioridad y posibilidad de reutilización en otras zonas.
5. Riesgos de colisión, oclusión, repetición y jerarquía de lectura.
6. Recomendación de una variante con argumentos; **Dirección la aprueba antes de pedir producción visual.**

## Flujo de aprobación

**Environment Designer (conceptual)** → Dirección aprueba layout/familias → **Art Director produce un pequeño kit de PNGs verificables** → composición controlada de las piezas sobre captura real (sin regenerar fondo/personajes) → Dirección aprueba ambiente → **Social Zone Designer ubica NPCs** → Art Director produce fillers necesarios → Integration Engineer implementa **sin inventar layout** → QA manual.

No iniciar Art Director, Integration Engineer ni nueva generación de crowd hasta que Dirección apruebe el primer plano ambiental. No comprometer la V1 con una factoría enorme de props.
