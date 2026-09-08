# Tambu Game — Fase 1: Muestra de calibración visual

**Versión:** 1.0  
**Estado:** especificación aprobable antes de producción masiva  
**Scope:** Patio / V1  

Este documento define la primera producción visual real después de `ART_DIRECTION.md` y `HUMAN_SCALE.md`.

La Fase 1 NO consiste todavía en rehacer todo el patio. Primero se construye una muestra pequeña que debe demostrar que el lenguaje visual funciona en juego. Si esta muestra no alcanza el nivel buscado, se corrige aquí antes de producir barra, DJ, casa completa o sets grandes de props.

---

# 1. Objetivo de la muestra

Validar simultáneamente:

- escala real usando a Tambu como unidad humana;
- perspectiva top-down / 3/4;
- densidad de píxel;
- materiales;
- paleta nocturna;
- contraste;
- iluminación cálida y fría;
- sombras de contacto;
- lectura jugable;
- viabilidad de producir el resto del patio con el mismo estándar.

La pregunta de aprobación es:

> **¿Este pequeño bloque ya parece pertenecer al Tambu Game final y se siente correcto al lado de Tambu?**

---

# 2. Unidad humana oficial

Fuente de verdad: `src/data/tambuSprite.js`.

Tambu usa actualmente:

- frame fuente: `32x48 px`;
- escala runtime: `1.24`;
- envolvente nominal en world-space: `39.68 x 59.52 px`;
- tile base del entorno: `16x16 px`.

Para dirección de arte:

- `1H = 59.52 px` — una altura nominal de Tambu;
- `1W = 39.68 px` — un ancho nominal de frame de Tambu.

Tambu se coloca SIEMPRE en la muestra a su escala real de juego. No se redimensiona para que los objetos se vean bien. Los objetos se corrigen alrededor de él.

Importante: estas unidades sirven para comparación visual, no para convertir literalmente metros reales a píxeles. La perspectiva top-down comprime alturas y profundidades.

---

# 3. Tamaño de la muestra

Construir una zona de calibración de:

- `384x256 world px`;
- `24x16 tiles` de `16x16`.

Debe verse a `camera zoom = 1`, igual que el patio actual.

La muestra puede existir temporalmente como escena/dev board independiente. No debe reemplazar el arte del `PatioScene` hasta ser aprobada.

## Composición sugerida

```text
┌──────────────────────────────────────────────┐
│                    DECK                      │
│     luz cálida                               │
├──────────────────────────────────────────────┤
│                                              │
│    planta        TAMBU                       │
│                                              │
│                         ┌────────────────────│
│          CÉSPED         │ borde piscina      │
│                         │ ~~~~~~~~~~~~~~~~~~ │
│                         │ agua + luz cian    │
│                         │ ~~~~~~~~~~~~~~~~~~ │
└─────────────────────────┴────────────────────┘
```

La composición exacta puede ajustarse, pero debe contener todos los materiales y contrastes requeridos.

---

# 4. Componentes obligatorios

## A. Césped — candidato final

### Assets mínimos

- `grass_01.png`
- `grass_02.png`
- `grass_03.png`
- `grass_worn_01.png`

Todos construidos sobre módulo `16x16`.

### Reglas visuales

- `grass_01` debe dominar aproximadamente el 65–75% de la superficie.
- variantes secundarias deben aparecer agrupadas, no como ruido uniforme.
- máximo 3 verdes importantes dentro de un tile normal.
- no checker visible.
- no píxeles sueltos distribuidos aleatoriamente para “dar textura”.
- pequeños detalles claros deben formar briznas o clusters legibles.
- zonas gastadas se reservan para circulación o cercanía de objetos.

### Criterio

A distancia de juego, el césped debe leerse primero como una masa tranquila. El detalle aparece después, no antes.

---

## B. Deck — primer estándar de madera

### Assets mínimos

- `deck_01.png`
- `deck_02.png`
- `deck_edge.png`

Módulo base `16x16`.

### Reglas

- tablas con dirección consistente;
- usar el valor/sombra para describir unión y profundidad, no una línea negra alrededor de cada tabla;
- variación tonal sutil entre tablas;
- el borde hacia césped debe tener lectura de espesor;
- el deck debe ser cálido incluso antes de aplicar iluminación.

### Geometría de muestra

Usar una franja superior de aproximadamente `64–80 px` de profundidad visible (`4–5 tiles`).

---

## C. Esquina de piscina — asset estrella de calibración

La muestra no necesita todavía la piscina completa. Debe resolver una esquina lo suficientemente grande para validar el material.

### Assets mínimos

- `pool_edge_straight.png`
- `pool_corner.png`
- `pool_water_01.png`
- `pool_water_02.png`

### Footprint y escala

- reservar un borde modular de `16 px`;
- dentro de ese módulo, la masa visual sólida del borde puede ocupar aproximadamente `8–12 px` según perspectiva;
- evitar un borde tan grueso que se sienta como una plataforma monumental al lado de Tambu;
- debe existir suficiente agua visible para leer patrón y luz, no solo una franja.

### Agua

- base azul/cian más luminosa que césped y deck;
- dos frames lentos son suficientes para esta fase;
- reflejos agrupados en formas de 2–6 px, no ruido de 1 px por toda la superficie;
- profundidad mediante al menos 3 valores: profundo, base y luz;
- el frame 2 debe desplazar o cambiar algunos reflejos, no rehacer el patrón completo.

### Borde

- debe leerse como piedra/baldosa sólida;
- highlight de borde superior o interior controlado;
- sombra de contacto donde corresponda;
- diferenciar claramente agua, piedra y césped aun sin glow.

### Criterio

La piscina debe ser el elemento más atractivo de la muestra sin convertir toda la imagen en cian.

---

## D. Luz cálida de prueba

Usar una fuente localizada asociada al deck: lámpara, farol o aplique de patio.

### Prop recomendado

- sprite visible aproximado: `16x24` a `24x32 px`;
- lectura clara al lado de Tambu;
- núcleo cálido pixelado dentro del sprite;
- halo separado generado por Phaser.

### Glow de prueba

Punto de partida, no valor definitivo:

- radio visual aproximado: `48–72 px`;
- alpha bajo/moderado;
- amarillo/ámbar;
- additive blend solo si mejora la lectura.

La fuente debe calentar localmente deck/césped. No debe colorear toda la muestra.

---

## E. Luz fría/cian de piscina

La fuente fría nace del agua.

### Reglas

- el agua contiene highlights duros/pixelados;
- el halo externo se resuelve por Phaser;
- permitir leve contaminación cian sobre el borde inmediato;
- no teñir a Tambu de azul completo si está lejos del borde.

### Glow de prueba

- radio o área efectiva aproximada: `64–96 px`;
- intensidad menor que el núcleo visual del agua;
- movimiento/pulso, si existe, debe ser muy lento.

---

## F. Prop Tier B — planta de prueba

Usar una maceta/planta mediana para comprobar volumen, escala y sombra.

### Envolvente recomendada

- sprite fuente objetivo: alrededor de `32x40–48 px`;
- masa visible aproximada: `0.55–0.75H` en pantalla;
- ancho aproximado: `0.6–0.9W`.

No tiene que ocupar toda la caja transparente.

### Reglas

- maceta separada claramente del follaje;
- 2–3 verdes;
- hojas agrupadas;
- sombra corta de contacto;
- detalle subordinado a Tambu y piscina.

---

## G. Tambu — referencia obligatoria

Usar el sprite real del repo:

`/assets/characters/tambu/tambu.png`

Config real:

- frame `32x48`;
- scale `1.24`;
- idle frontal o lateral según mejor lectura de la muestra.

Ubicarlo:

- sobre césped;
- relativamente cerca de la piscina, pero sin solaparse;
- suficientemente cerca de la planta y deck para comparar escala.

La muestra no puede aprobarse usando un placeholder humano.

---

# 5. Paleta de calibración

Usar como familia la baseline de `ART_DIRECTION.md`.

## Césped

- oscuro `#21432D`
- medio `#2F5A38`
- luz `#487348`

## Madera

- sombra `#4A3027`
- base `#6A4531`
- luz `#8A5B3A`

## Piedra

- sombra `#8E8A84`
- base `#B8B2A9`
- luz `#D7D0C4`

## Agua

- profundo `#12627A`
- base `#1688A5`
- luz `#39B8D2`
- brillo `#8BE7EF`

## Luz cálida

- `#FFF0B0`
- `#FFD36A`
- `#E89A45`

Los valores pueden desviarse unos pasos si la integración lo exige. Lo que no puede cambiar es la relación: entorno nocturno más apagado, agua más luminosa, luz cálida localizada.

---

# 6. Sombras y volumen

Todo elemento con masa debe contactar con el mundo.

## Tambu

- sombra pequeña/elíptica pixel-art bajo pies;
- suficientemente oscura para anclarlo;
- no blur fotográfico.

## Planta

- sombra corta;
- desplazamiento coherente con la lectura de luz ambiente.

## Deck / borde piscina

- usar sombras estructurales pintadas en el propio tile cuando expresen espesor;
- glows no sustituyen sombras.

La muestra debe seguir teniendo volumen con los glows desactivados.

---

# 7. Regla de pixel density

La referencia de calidad NO se alcanza metiendo más píxeles de detalle en cada objeto.

A `zoom = 1`:

- Tambu debe seguir siendo una de las siluetas más legibles;
- el césped no debe vibrar visualmente;
- el borde de piscina debe leerse de inmediato;
- la planta debe reconocerse sin competir;
- los reflejos del agua deben formar masas, no estática.

Revisar también a `2x` o `4x` con nearest-neighbor solo para inspección técnica. La aprobación artística se decide mirando principalmente la escala real de juego.

---

# 8. Capas recomendadas en Phaser

Orden conceptual:

1. base de césped;
2. variantes de césped;
3. deck;
4. piscina / agua;
5. bordes estructurales;
6. prop/planta;
7. Tambu;
8. sombras dinámicas o sprites de sombra según sistema;
9. tint/ambient nocturno;
10. glows cálidos/fríos;
11. partículas, solo si fueran necesarias después.

No hornear grandes halos suaves dentro de los PNG de pixel art.

---

# 9. Qué NO entra todavía

No producir todavía como parte de esta muestra:

- barra final;
- DJ booth final;
- casa completa;
- NPCs nuevos;
- guirnaldas completas;
- clutter masivo;
- muebles en cantidad;
- UI final;
- partículas complejas;
- iluminación dinámica avanzada.

La fase se mantiene pequeña para poder iterar rápido.

---

# 10. Checklist de aprobación

La muestra se aprueba únicamente si cumple TODO esto:

## Escala

- [ ] Tambu está a `32x48 @ 1.24`.
- [ ] Ningún objeto parece diseñado para un humano de otra escala.
- [ ] Planta, borde y lámpara se sienten creíbles junto a Tambu.

## Materiales

- [ ] césped, madera, piedra y agua se distinguen inmediatamente;
- [ ] cada material tiene volumen sin necesitar glow;
- [ ] no hay ruido procedural evidente.

## Perspectiva

- [ ] deck, piscina, prop y Tambu pertenecen a la misma cámara;
- [ ] ningún asset parece frontal mientras los demás son top-down/3/4.

## Iluminación

- [ ] la escena se siente nocturna pero legible;
- [ ] existe contraste cálido/frío;
- [ ] el cian está concentrado en piscina;
- [ ] el cálido está concentrado en su fuente;
- [ ] los glows complementan el pixel art, no lo tapan.

## Jerarquía

- [ ] piscina es el principal foco material;
- [ ] Tambu se encuentra de inmediato;
- [ ] planta y césped acompañan;
- [ ] ningún detalle secundario roba atención.

## Producción

- [ ] el estilo puede repetirse para todo el patio sin multiplicar trabajo de forma absurda;
- [ ] los assets son modulares;
- [ ] funcionan en Phaser a escala real;
- [ ] la muestra se ve bien sin UI.

---

# 11. Gate de decisión

Al terminar la muestra existen solo dos salidas:

## APROBADA

Se congela:

- densidad de píxel;
- tratamiento de césped;
- tratamiento de madera;
- piedra/borde;
- agua;
- sombras;
- relación de iluminación cálida/fría;
- relación de escala con Tambu.

Entonces se avanza a producir la piscina completa y el resto del entorno.

## NO APROBADA

No se añaden más assets.

Se identifica el problema específico:

- escala;
- perspectiva;
- paleta;
- volumen;
- material;
- densidad;
- iluminación.

Se corrige la muestra y se vuelve a evaluar.

---

# 12. Orden de producción de esta fase

1. Césped base + variantes.
2. Deck + edge.
3. Borde de piscina + esquina.
4. Agua de 2 frames.
5. Planta Tier B.
6. Integrar Tambu real.
7. Sombras de contacto.
8. Ambient nocturno.
9. Luz cálida.
10. Luz cian.
11. Revisión a escala real.
12. Aprobar o iterar.

**No avanzar a producción masiva antes del punto 12.**
