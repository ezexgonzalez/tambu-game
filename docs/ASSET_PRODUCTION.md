# Asset Production Pack v0.2 — Patio

Este documento define qué arte producir primero para convertir `PatioScene` de prototipo técnico a escena pixel-art real sin perder tiempo en assets prematuros.

## Fuentes de verdad

Antes de producir cualquier asset consultar:

- `docs/ART_DIRECTION.md` → visión, jerarquía y atmósfera.
- `docs/PIXEL_ART_STYLE_GUIDE.md` → paletas estrictas, noche, pixel density, IA, transparencia y validación.
- `docs/HUMAN_SCALE.md` → proporciones y escala respecto de Tambu.

Si un backlog antiguo contradice una regla nueva de estilo, prevalece `PIXEL_ART_STYLE_GUIDE.md`.

## Objetivo de v0.2 visual

La escena debe dejar de sentirse como formas dibujadas sobre un fondo y empezar a leerse como un videojuego 2D coherente.

Al terminar este pack deben estar resueltos:

- suelo y césped con textura real nocturna;
- piscina reconocible y con profundidad visual;
- casa/fondo con ventanas y puerta de BAÑO;
- barra y zona DJ con identidad;
- props suficientes para que la fiesta se sienta vivida;
- Tambu integrado como referencia humana de producción;
- NPC random con variantes modulares;
- Sofi, Mili y Cami distinguibles;
- HUD todavía funcional, aunque no definitivo.

## Estándar visual

- Grid lógico: `16x16 px`.
- La resolución visual de un asset puede superar 16x16 y ocupar múltiples tiles.
- Tambu es la unidad humana oficial del juego.
- Frame fuente de Tambu: `32x48 px`.
- Escala runtime de Tambu: `1.24`.
- Envolvente nominal runtime: `39.68x59.52 world px` con cámara `zoom = 1`.
- El resto de personajes, objetos y arquitectura deben calibrarse contra Tambu; no se debe reescalar a Tambu para hacer encajar assets nuevos.
- Pixel art limpio, de lectura rápida y detalle medio.
- Máximo 2–3 tonos principales por material/objeto normal.
- `image-rendering: pixelated` siempre activo.
- Evitar blur y antialias dentro del arte.
- Todo asset nace cromáticamente preparado para noche.
- Las luces y glows grandes se agregan desde Phaser/CSS, no pintados dentro de sprites.
- Generación IA: **una imagen = un asset**. Nunca sheets/collages conceptuales como fuente de producción; los tilesets técnicos autorados directamente para runtime son una excepción explícita.

## Qué sigue provisional

Estos elementos NO merecen arte final todavía:

- retratos de diálogo;
- animaciones complejas;
- efectos de alcohol;
- minijuego del baño;
- decoración muy pequeña sin función visual;
- sprites finales de todos los amigos reales;
- UI final;
- assets de otros mapas.

El objetivo es validar primero el lenguaje visual del patio.

---

# FASE 1 — Kit mínimo del entorno

## 1. Césped nocturno

El césped ocupa la mayor superficie del patio y su producción V1 queda cerrada con un único tileset runtime.

### Asset aprobado

```text
public/assets/tiles/grass/tx_tileset_grass_night.png
```

- imagen `256x256 px`;
- grilla de tiles fuente `16x16 px`;
- fuente de verdad única para el grass del patio;
- no recortar a PNG individuales;
- no modificar ni regenerar sus píxeles durante integración.

### Paleta oficial

Usar exclusivamente la paleta Night Grass vigente de `PIXEL_ART_STYLE_GUIDE.md`:

`#122D23`, `#153427`, `#183A2B`, `#1C4230`, `#214A35`, `#28533A`, `#316040`.

### Runtime aprobado

- una matriz determinista de IDs de frame fuente;
- una sola `TilemapLayer` para todo `PATIO_LAYOUT.terrain.grass`;
- aproximadamente `78%` base, `20%` detalle pequeño/suave y `2%` detalle medio;
- sin `Math.random()`;
- sin máscaras;
- sin `scene.add.image()` por celda;
- sin assets separados de ground, macro, patch, cluster, tuft o accent.

Los pools autorizados viven en `src/world/grass/grassLayout.js`. No seleccionar frames con flores, piedras, bordes, tonos amarillos ni contenido ajeno al grass base.

### Reemplaza

La familia legacy completa de grounds de 64 px, patches, clusters, tufts, macros y accents.

Ver `docs/PHASE_1_GRASS.md`.

---

## 2. Camino / deck

### Assets reales
- `path_01.png`
- `path_edge_01.png`
- `deck_01.png`
- `deck_edge_01.png`

### Reglas
- camino cálido, contrastando con el césped;
- madera oscura/cálida ya adaptada al ambiente nocturno;
- bordes claros para facilitar lectura de colisiones;
- paleta y pixel density según `PIXEL_ART_STYLE_GUIDE.md`.

---

## 3. Piscina

### Assets reales
- `pool_water_01.png`
- `pool_water_02.png`
- `pool_edge_top.png`
- `pool_edge_bottom.png`
- `pool_edge_left.png`
- `pool_edge_right.png`
- `pool_corner_tl.png`
- `pool_corner_tr.png`
- `pool_corner_bl.png`
- `pool_corner_br.png`
- `pool_ladder.png`
- `pool_float.png`

### Animación mínima
Dos frames de agua alternando lentamente.

### Reglas
- protagonista visual del centro del patio;
- cian/azul más luminoso que el entorno;
- reflejos limitados;
- borde de piedra/baldosa claro;
- escalera, borde y props deben verificarse junto a Tambu a escala runtime real.

### Reemplaza
Rectángulos actuales de agua y borde.

---

## 4. Casa / fondo

### Assets reales
- `wall_01.png`
- `wall_shadow.png`
- `window_lit.png`
- `window_dim.png`
- `door_generic.png`
- `door_bathroom.png`
- `bathroom_sign.png`

### Regla de copy
La señal visible debe decir `BAÑO` o usar iconografía reconocible. Nunca `WC`.

### Reglas
- pared crema/apagada;
- ventanas con luz cálida;
- profundidad simple mediante zócalo y sombra inferior;
- puertas y elementos arquitectónicos se validan colocando a Tambu delante antes de aprobación.

---

## 5. Barra

### Assets reales
- `bar_front.png`
- `bar_top.png`
- `bar_back_shelf.png`
- `bar_stool.png`
- `bottle_01.png` a `bottle_06.png`
- `glass_01.png` a `glass_03.png`
- `drink_01.png`
- `drink_02.png`
- `ice_bucket.png`

### Reglas
- debe leerse como punto de encuentro;
- botellas de colores variados pero controlados;
- mantener espacio libre delante para futura interacción;
- altura y profundidad visual del mostrador deben resultar creíbles junto a Tambu.

---

## 6. DJ / sonido

### Assets reales
- `dj_booth.png`
- `dj_controller.png`
- `speaker_01.png`
- `speaker_02.png`
- `party_light_fixture.png`

### Reglas de escala
- la cabina debe alojar un humano de la escala de Tambu de forma creíble;
- controladores, parlantes y superficie de trabajo deben mantener lectura humana al tamaño real del juego.

### Lo que sigue por código
- haces de luz;
- tintes;
- flashes;
- ambient light externo.

---

# FASE 2 — Props que hacen que la fiesta viva

## Prioridad alta
- `table_high.png`
- `table_low.png`
- `chair.png`
- `cooler.png`
- `plant_01.png`
- `plant_02.png`
- `cup_floor_01.png`
- `cup_floor_02.png`
- `bottle_floor_01.png`
- `bottle_floor_02.png`
- `can_floor_01.png`
- `ashtray.png`

## Prioridad media
- reposera;
- toalla;
- pelota de piscina;
- bolso/cartera;
- caja de bebidas;
- cenicero adicional;
- pequeñas manchas/reflejos de suelo.

## Regla de densidad
No llenar cada tile. Los props se concentran donde naturalmente habría actividad: barra, mesas, piscina y grupos.

## Regla de escala
Todo prop Tier A o Tier B debe probarse al lado de Tambu antes de aprobarse. Para clutter muy pequeño se conserva primero la legibilidad y luego el realismo literal.

---

# FASE 3 — Personajes

## 1. Tambu — referencia cerrada

Tambu ya cuenta con sprite de producción y **no debe rehacerse ni reescalarse como parte de este pack**.

### Especificación actual

- frame: `32x48 px`;
- spritesheet: `96x192 px`;
- escala runtime: `1.24`;
- envolvente nominal runtime: `39.68x59.52 world px`;
- 12 frames / 4 direcciones;
- fuente de verdad: `src/data/tambuSprite.js`.

### Animaciones actuales
- idle_down
- idle_up
- idle_left
- idle_right
- walk_down
- walk_up
- walk_left
- walk_right

### Objetivo
Usar a Tambu para definir el estándar de proporciones del resto de humanos y del entorno.

### Regla
Los assets nuevos se adaptan a Tambu. No ajustar su `scale: 1.24` para solucionar problemas de proporción ajenos.

---

## 2. NPC random — sistema modular

No diseñar 30 personas a mano.

### Base proporcional

Los NPCs parten de la familia visual y escala humana definida por Tambu. Pueden variar silueta, altura aparente y ancho dentro de márgenes controlados, pero no deben sentirse de otro sistema de escala.

### Componentes

#### Peinados masculinos
5 variantes.

#### Peinados femeninos
5 variantes.

#### Tonos de piel
4 variantes.

#### Torso masculino
5 outfits.

#### Torso femenino
5 outfits.

#### Piernas/calzado
4 variantes.

#### Accesorios
- vaso;
- celular;
- gorra;
- bolso/cartera;
- anteojos.

### Estados visuales
- idle;
- charla;
- baile;
- tomar;
- mirar celular;
- beso.

### Implementación
El juego combinará variantes por datos para generar diversidad sin crear sprites únicos innecesarios.

---

## 3. Mujeres interactuables

### Sofi
Lectura tranquila y amable. Outfit simple, postura menos expansiva.

### Mili
Más energía y presencia. Silueta/pose más dinámica.

### Cami
Más segura/filosa. Diferenciar por pelo, outfit y postura.

### Alcance v0.2
Un idle claro por personaje. Las animaciones de charla vienen después.

### Regla proporcional
Deben compartir el mismo sistema humano de Tambu; diferenciarlas por diseño, no mediante escalas arbitrarias.

---

## 4. Amigos reales

En v0.2 pueden seguir con placeholder mejorado.

Orden futuro recomendado cuando lleguen las fotos:

1. Pitity
2. Uriel
3. Thiago
4. Tobi
5. Santy
6. Eze

Tambu permanece como referencia humana para todos.

---

# FASE 4 — UI mínima

## Se mantiene provisional
- vidas;
- alcohol;
- puntos;
- `E · HABLAR`;
- caja de diálogo.

## Primera mejora visual permitida
- marco pixel-art simple;
- iconos propios para corazón, alcohol y puntos;
- tipografía compatible con estética retro.

No diseñar todavía HUD final porque puede cambiar cuando aparezcan El Consejo, estados sociales y mobile.

---

# Qué se dibuja y qué se resuelve por código

## Sprite / tile real
- césped;
- piscina;
- paredes;
- ventanas;
- puertas;
- barra;
- botellas;
- mobiliario;
- props;
- personajes;
- señales.

## Phaser / CSS
- ambient light exterior;
- haces de luz;
- tintes por zona;
- pulso de luces;
- cámara;
- colisiones;
- interacción;
- transparencias;
- feedback de selección;
- partículas pequeñas.

---

# Estructura de carpetas objetivo

```text
public/assets/
├── tiles/
│   ├── grass/
│   ├── path/
│   ├── deck/
│   ├── pool/
│   └── house/
├── props/
│   ├── bar/
│   ├── dj/
│   ├── furniture/
│   └── clutter/
├── characters/
│   ├── tambu/
│   ├── friends/
│   ├── women/
│   └── random/
└── ui/
```

---

# Orden exacto de implementación

1. Césped nocturno real y aprobado.
2. Camino/deck.
3. Piscina real.
4. Casa + BAÑO.
5. Barra.
6. DJ + parlantes.
7. Props principales.
8. Validación de escala de todos los assets contra Tambu.
9. NPC modular v1.
10. Sofi/Mili/Cami.
11. Ajuste de iluminación y ambient light.
12. Primera pasada del HUD.

No pasar al siguiente mapa hasta que este conjunto defina un lenguaje visual reutilizable.

---

# Criterio de aprobación v0.2

El pack se considera exitoso cuando:

- el jugador reconoce instantáneamente una fiesta en patio sin necesitar labels;
- piscina, barra, DJ y baño tienen identidad propia;
- todos los objetos importantes se sienten proporcionados para Tambu;
- Tambu destaca entre NPCs sin romper la estética;
- los NPC de relleno parecen variados aunque provengan de un sistema modular;
- los objetos ya no parecen simples rectángulos de prototipo;
- las colisiones continúan siendo legibles visualmente;
- el mapa se siente poblado pero no saturado;
- el ambient light complementa la escena sin competir con ella;
- los assets parecen pertenecer al mismo juego incluso antes de la iluminación dinámica.
