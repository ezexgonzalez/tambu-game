# Asset Production Pack v0.1 — Patio

Este documento define qué arte producir primero para convertir `PatioScene` de prototipo técnico a escena pixel-art real sin perder tiempo en assets prematuros.

## Objetivo de v0.1 visual

La escena debe dejar de sentirse como formas dibujadas sobre un fondo y empezar a leerse como un videojuego 2D coherente.

Al terminar este pack deben estar resueltos:

- suelo y césped con textura real;
- piscina reconocible y con profundidad visual;
- casa/fondo con ventanas y puerta de BAÑO;
- barra y zona DJ con identidad;
- props suficientes para que la fiesta se sienta vivida;
- Tambu con sprite real básico;
- NPC random con variantes modulares;
- Sofi, Mili y Cami distinguibles;
- HUD todavía funcional, aunque no definitivo.

## Estándar visual

- Tile base: `16x16 px`.
- Personaje base: `24x32 px`.
- Pixel art limpio, de lectura rápida y detalle medio.
- Máximo 2–3 tonos principales por material/objeto.
- `image-rendering: pixelated` siempre activo.
- Evitar blur, antialias y sombras suaves dentro del arte.
- Las luces y glows se agregan desde Phaser/CSS, no pintados de forma exagerada dentro de los sprites.

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

## 1. Césped

### Assets reales
- `grass_01.png`
- `grass_02.png`
- `grass_03.png`
- `grass_04.png`
- `grass_worn_01.png`
- `grass_worn_02.png`

### Reglas
- variación sutil, no ruido excesivo;
- 3 verdes principales;
- zonas gastadas cerca de barra, piscina y recorridos.

### Reemplaza
El checker verde generado por `Phaser.Graphics`.

---

## 2. Camino / deck

### Assets reales
- `path_01.png`
- `path_edge_01.png`
- `deck_01.png`
- `deck_edge_01.png`

### Reglas
- camino cálido, contrastando con el césped;
- madera oscura/cálida para el deck;
- bordes claros para facilitar lectura de colisiones.

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
- borde de piedra/baldosa claro.

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
- profundidad simple mediante zócalo y sombra inferior.

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
- mantener espacio libre delante para futura interacción.

---

## 6. DJ / sonido

### Assets reales
- `dj_booth.png`
- `dj_controller.png`
- `speaker_01.png`
- `speaker_02.png`
- `party_light_fixture.png`

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

---

# FASE 3 — Personajes

## 1. Tambu — primero

### Sheet inicial
`24x32 px` por frame.

### Animaciones mínimas
- idle_down
- idle_up
- idle_left
- idle_right
- walk_down_1 / walk_down_2
- walk_up_1 / walk_up_2
- walk_left_1 / walk_left_2
- walk_right_1 / walk_right_2

### Objetivo
Que Tambu deje de parecer un placeholder y defina el estándar de proporciones para el resto.

### Todavía no
No buscar parecido facial exacto hasta tener las fotos de referencia.

---

## 2. NPC random — sistema modular

No diseñar 30 personas a mano.

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

### Alcance v0.1
Un idle claro por personaje. Las animaciones de charla vienen después.

---

## 4. Amigos reales

En v0.1 pueden seguir con placeholder mejorado.

Orden futuro recomendado cuando lleguen las fotos:

1. Pitity
2. Uriel
3. Thiago
4. Tobi
5. Santy
6. Eze

Tambu va primero por ser el jugador.

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

1. Césped real.
2. Camino/deck.
3. Piscina real.
4. Casa + BAÑO.
5. Barra.
6. DJ + parlantes.
7. Props principales.
8. Tambu real básico.
9. NPC modular v1.
10. Sofi/Mili/Cami.
11. Ajuste de iluminación y ambient light.
12. Primera pasada del HUD.

No pasar al siguiente mapa hasta que este conjunto defina un lenguaje visual reutilizable.

---

# Criterio de aprobación v0.1

El pack se considera exitoso cuando:

- el jugador reconoce instantáneamente una fiesta en patio sin necesitar labels;
- piscina, barra, DJ y baño tienen identidad propia;
- Tambu destaca entre NPCs sin romper la estética;
- los NPC de relleno parecen variados aunque provengan de un sistema modular;
- los objetos ya no parecen simples rectángulos de prototipo;
- las colisiones continúan siendo legibles visualmente;
- el mapa se siente poblado pero no saturado;
- el ambient light complementa la escena sin competir con ella.
