# Tambu Game — Party Presence

**Versión:** 1.0  
**Estado:** ACTIVE DIRECTION / DJ SOCIAL ZONE FIRST  
**Fecha:** 2026-10-04  
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

El runtime actual contiene **35 fillers procedurales** (37 antes del PASS 01A DJ) definidos en `src/data/patioCharacters.js`.

Aunque existen etiquetas como:

- `dance`;
- `chat`;
- `drink`;
- `phone`;
- `sit`;
- `kiss`;

la mayoría no tienen todavía una actuación visual suficiente.

Además, la distribución actual fue construida principalmente como ocupación espacial segura y termina sintiéndose demasiado repartida por el mapa.

Problema perceptual:

> hay personas en muchos lugares, pero no siempre parece que existan grupos sociales reales.

La V1 NO está obligada a conservar 37 fillers.

**37 era el estado previo al prototype DJ, no un target de diseño. El total actual de 35 tampoco es un target final.**

Dirección puede:

- reducir;
- mover;
- agrupar;
- reutilizar;
- reemplazar;

fillers según lo que haga mejor la composición final.

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

Dirección cambia el orden interno de PARTY PRESENCE porque la distribución actual de fillers necesita una base espacial mejor antes de producir arte final.

## PASS 1 — SOCIAL ZONING / COMPOSITION

- auditar los 37 fillers actuales;
- dejar de tratarlos como distribución final;
- trabajar el patio zona por zona;
- validar clusters y negative space con placeholders existentes.

## PASS 2 — FILLER VISUAL FAMILY

Con posiciones/actividades ya validadas:

- definir lote pequeño de diseños base;
- reutilizar variantes;
- producir solo los assets que las social zones realmente necesitan.

## PASS 3 — AUDIO FOUNDATION

- música;
- ambience;
- SFX esenciales;
- volumen/mute.

Puede avanzar en paralelo cuando no dependa de assets visuales.

## PASS 4 — ACTIVITIES + AMBIENT BEATS

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
- fillers asociados al DJ: **4 dancers** después del PASS 01A (6 antes);
- Uriel y Santy ya están físicamente cerca de esta zona;
- los fillers actuales ocupan una franja amplia y se sienten más como puntos repartidos que como una escena social.

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

# 13. DJ zone — prototype rule

PRIMERO validar composición con placeholders existentes.

NO producir todavía sprites finales de fillers.

Durante el prototype se puede:

- mover fillers;
- reducir su cantidad;
- cambiar actividad metadata;
- probar orientación/spacing;
- crear clusters explícitos.

No:

- rediseñar DJ;
- mover piscina;
- mover amigos principales;
- generar arte final;
- agregar roaming;
- abrir scope de todo el mapa.

El objetivo del prototype es responder:

> “¿La zona del DJ parece un lugar donde espontáneamente se juntó gente?”

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

# 17. PASS 01A — DJ social zone composition prototype — 2026-10-04

**DJ SOCIAL ZONE — PROTOTYPE INTEGRATED / VISUAL QA REQUIRED.** Prototype espacial con placeholders actuales; sin arte nuevo ni cambios de actuación.

| Filler (palette existente) | X | Y | Activity |
|---|---:|---:|---|
| A (10) | 185 | 395 | dance |
| B (11) | 230 | 420 | dance |
| C (12) | 280 | 395 | dance |
| D (13) | 260 | 460 | dance |

**Antes: 6 fillers DJ. Después: 4 dancers + 0 fillers social-edge.** Uriel (320,355) y Santy (380,390) ya forman el borde social; no se movieron ni se escondieron detrás de fillers nuevos. Esta decisión específica del prototype limita la idea general de microgrupos de la sección 12: no se agrega población al borde en esta pasada.

El núcleo abarca 95×65 px entre anchors, con separaciones irregulares y sin línea/grid uniforme. El cuarto dancer queda en (260,460) para separar mejor su silueta del segundo. Las envolventes procedurales y los 5 px de recorrido del tween están fuera de los collision zones actuales. Se reserva aire delante del booth y hacia el lateral derecho/piscina, retirando el scatter que antes llegaba a (465,485). La circulación y legibilidad óptica quedan pendientes de validación en juego.

Se conservan paletas 10–13 y el renderer/tween procedural existente. Se eliminan los antiguos fillers DJ de paletas 14 y 15; no se reubican en otra zona. Los otros **31 fillers** permanecen exactamente iguales, total actual **35**. DJ, piscina, Uriel/Santy y todos los amigos, chicas/interactables, Tambu spawn, colliders y rutas BathroomEvent quedan intactos.

Validación: **257/257 tests aprobados, 0 fallos, 0 omitidos; `npm run build` correcto**, con advertencia existente de chunk >500 kB. Se amplía la cobertura existente de `createCharacters` en `miliSprite.test.js`: cuatro dancers dentro de un sector compacto, distribución no lineal, envolvente/tween fuera de colliders, placeholders creados desde la data, población de otras zonas y conservación de amigos/interactables. La comparación estática confirma que solo cambió el bloque DJ en `patioCharacters.js`.

No se realizó browser QA, screenshots ni ejecución visual local. **No se declara composición final.** Próxima acción exclusiva: **DJ SOCIAL ZONE — MANUAL VISUAL QA BY DIRECTION** para lectura conjunta, negative space, anchors y circulación. No iniciar barra, piscina ni deck.
