# Tambu Game — Dirección de Arte

**Versión:** 1.2  
**Estado:** FASE 0 — baseline visual definida  
**Scope actual:** V1 · La fiesta / Patio

Este documento fija **cómo debe verse y sentirse el juego**.

Documentos complementarios y precedencia:

- `docs/HUMAN_SCALE.md` → escala humana y proporciones.
- `docs/PIXEL_ART_STYLE_GUIDE.md` → reglas técnicas estrictas de producción, paletas, pixel density, IA y validación.
- `docs/ASSET_PRODUCTION.md` → qué assets producir y en qué orden.
- `docs/PHASE_1_*.md` → decisiones específicas de fase.

Si una decisión futura hace que un objeto se vea más detallado pero rompe esta dirección, la dirección visual tiene prioridad. Si una generación contradice una regla técnica o paleta de producción, prevalece `PIXEL_ART_STYLE_GUIDE.md`.

---

# 1. Objetivo visual

Tambu Game debe pasar de un prototipo funcional a un **pixel-art 2D moderno, nocturno, social y atmosférico**, con suficiente detalle para que el patio se sienta como un lugar real preparado para una fiesta.

La referencia de calidad no debe copiarse 1:1. Se toma como objetivo por:

- mejor iluminación nocturna;
- objetos con volumen y materiales legibles;
- mayor riqueza ambiental;
- mejor jerarquía visual;
- sensación de mundo vivo;
- coherencia entre escenario, personajes y props.

La escena final debe sentirse como un videojuego indie cuidado, no como formas geométricas con decoración encima y tampoco como una ilustración difícil de convertir en gameplay.

## Fantasía visual

> Una noche agradable de verano en el patio de una casa, con una fiesta suficientemente linda como para querer recorrerla, pero suficientemente íntima como para que cada grupo, conversación y rincón tenga personalidad.

La fiesta no es una rave ni un boliche. La energía viene de la gente, la música, el agua, las luces y pequeños focos sociales.

---

# 2. Restricciones que NO se rompen

La mejora visual no puede rediseñar el mapa jugable.

Se conserva:

- piscina como centro físico y visual;
- DJ en el sector izquierdo;
- barra en el sector derecho;
- casa/deck en la franja superior;
- circulación principal alrededor de la piscina;
- escala actual de Tambu;
- zonas de interacción existentes;
- colisiones y lectura jugable del espacio.

Se pueden mejorar formas, materiales, bordes, decoración, iluminación, props y microcomposición sin cambiar el macro-layout.

**Regla:** el arte se adapta al juego. El juego no debe romperse para acomodar una imagen bonita.

---

# 3. Lenguaje visual

## Estilo

- Pixel art moderno.
- Vista top-down / 3/4 superior coherente en todo el escenario.
- Lectura rápida de silueta.
- Detalle medio-alto en assets protagonistas.
- Detalle medio en props secundarios.
- Detalle bajo y controlado en clutter.
- Bordes y sombras definidos; evitar aspecto vectorial.
- Nada de antialias dentro de los sprites.
- Nada de texturas fotográficas.
- Nada de ruido de un píxel distribuido al azar para simular detalle.

## Regla nocturna

Todo asset nuevo se diseña **ya adaptado a noche**.

No producir assets diurnos para después oscurecerlos con un overlay.

> Los sprites nacen nocturnos. Phaser después los ilumina.

## Base técnica

- Tile/grid lógico del entorno: `16x16 px`.
- La resolución visual de un asset puede superar 16x16 y ocupar múltiples tiles cuando sea necesario.
- Tambu es la **unidad humana oficial**.
- Frame fuente de Tambu: `32x48 px`.
- Escala actual de Tambu en runtime: `1.24`.
- Envolvente nominal de su frame en runtime: `39.68x59.52 world px`.
- Cámara principal actual: `zoom = 1`.
- Relación nominal con tile: `2.48 tiles` de ancho por `3.72 tiles` de alto.
- Sprites y tiles se producen sin antialias y se renderizan con `image-rendering: pixelated`.
- La escala `1.24` de Tambu es una decisión estabilizada: **no se modifica para acomodar assets nuevos**.
- Para nuevos assets conviene autorar cerca del tamaño final; la prioridad es que se vean proporcionados junto a Tambu.

## Escala humana oficial

Para producción:

- `1H = 59.52 world px` → alto nominal del frame de Tambu en runtime.
- `1W = 39.68 world px` → ancho nominal del frame de Tambu en runtime.

`H` es una unidad de comparación visual, no una conversión literal a metros.

Todo Tier A o Tier B de escala humana debe probarse junto a Tambu antes de aprobarse: puertas, mesas, barra, DJ booth, parlantes, sillas, cooler, escalera, borde de piscina, etc.

La prueba se hace con Tambu a su escala real de runtime, nunca reescalándolo para hacer coincidir otro asset.

Ver `docs/HUMAN_SCALE.md`.

## Complejidad tonal

- Props normales: 2–3 tonos principales por material.
- Assets protagonistas: pueden sumar 1 tono de highlight/acento cuando ayude a volumen o iluminación.
- Las variaciones de color deben describir forma o material, no decorar por decorar.
- Las paletas estrictas y reglas de normalización están en `PIXEL_ART_STYLE_GUIDE.md`.

---

# 4. Jerarquía visual del patio

El jugador debe entender el escenario en este orden aproximado:

1. **Piscina** — protagonista visual y centro de composición.
2. **Tambu y NPCs interactuables** — lectura inmediata sobre el entorno.
3. **Barra y DJ** — dos focos laterales con identidades distintas.
4. **Grupos sociales / amigos / chicas**.
5. **Casa y deck superior** — marco arquitectónico de la escena.
6. **Props y clutter** — enriquecen sin competir.

No todos los elementos pueden tener el mismo contraste.

Los assets importantes reciben más contraste, volumen, animación o luz. Los secundarios sostienen la escena. El clutter debe desaparecer visualmente cuando se mira el mapa de lejos.

---

# 5. Paleta base

Los valores de esta sección definen la dirección de materiales. Para producción estricta, normalización de paleta y Night Grass prevalece `docs/PIXEL_ART_STYLE_GUIDE.md`.

## Noche / sombras

- Sombra profunda: `#111827`
- Sombra azul: `#18243A`
- Azul ambiente: `#22304A`

Evitar negro puro como sombra general del mundo. El negro puede reservarse para oclusión fuerte, UI y pequeños huecos.

## Césped — familia oficial nocturna

- Deep shadow: `#112A2F`
- Shadow: `#112F31`
- Dark base: `#123232`
- Base: `#153B35`
- Mid grass: `#194137`
- Soft light: `#1C4839`
- Highlight: `#25553D`

El césped debe sentirse como una superficie nocturna fría, uniforme y suave. Las variantes cambian patrón/densidad, no identidad cromática.

No usar:

- tierra marrón;
- zonas `worn`;
- verdes amarillos de día;
- checker repetitivo;
- flores integradas de forma masiva al ground.

## Madera / deck

- Marrón sombra: `#4A3027`
- Marrón base: `#6A4531`
- Marrón luz: `#8A5B3A`
- Highlight cálido excepcional: `#B07A4C`

## Casa / piedra / borde de piscina

- Piedra sombra: `#8E8A84`
- Piedra base: `#B8B2A9`
- Piedra luz: `#D7D0C4`
- Pared crema apagada: `#C9C1B5`
- Pared sombra: `#9E978F`

## Agua

- Profundo: `#12627A`
- Base: `#1688A5`
- Luz: `#39B8D2`
- Brillo: `#8BE7EF`

El agua puede ser el material más luminoso del escenario sin volverse fluorescente en toda su superficie.

## Iluminación cálida

- Núcleo: `#FFF0B0`
- Luz cálida: `#FFD36A`
- Ámbar: `#E89A45`

## Acentos de fiesta

- Violeta DJ: `#A25BFF`
- Magenta: `#F05AA6`
- Cian: `#53D8F2`
- Azul: `#5890FF`

Los acentos se concentran en fuentes de luz, señalética y pequeños detalles. No teñir todo el mapa con neón.

---

# 6. Iluminación

La iluminación es parte central de la identidad del juego.

## Regla general

El patio tiene una base nocturna fría y fuentes locales cálidas o de color. La escena no debe ser simplemente “oscura”; debe tener contraste entre zonas tranquilas y zonas activas.

Los materiales deben ser legibles sin iluminación final, pero deliberadamente contenidos para dejar espacio a las luces runtime.

## Piscina

- luz fría/cian;
- puntos de luz subacuática o reflejos localizados;
- leve contaminación azul sobre el borde cercano;
- movimiento visual incluso cuando Tambu está quieto.

## Casa / deck

- apliques y ventanas cálidas;
- luz contenida, doméstica, no teatral;
- separación clara de arquitectura respecto del fondo nocturno.

## Barra

- identidad cálida con acento magenta/violeta controlado;
- botellas y estantes pueden recibir backlight;
- debe verse como punto social sin competir con la piscina.

## DJ

- violeta/azul;
- mayor energía visual que el resto del mapa;
- pulsos, focos o haces sutiles por código;
- no inundar todo el césped con color.

## Guirnaldas y mesas

- halos pequeños y localizados;
- las bombitas deben sentirse como fuentes de luz y no como píxeles pegados a un cable.

## Implementación

Dentro de sprites:

- sombras de contacto;
- highlights duros y pixelados;
- pequeñas zonas pintadas de luz cuando formen parte material del objeto.

Por Phaser/CSS:

- ambient tint;
- glows suaves;
- additive blend puntual;
- pulsos;
- haces;
- variaciones sutiles de intensidad;
- partículas.

**No hornear grandes halos borrosos dentro del PNG.**

## Sombras

Todo objeto con masa debe tener contacto con el suelo.

- NPCs: sombra corta y simple.
- Mesas / macetas / postes: sombra legible pero discreta.
- Barra / DJ / arquitectura: sombra estructural más marcada.

La sombra debe reforzar volumen, no dibujar un segundo objeto negro debajo.

---

# 7. Reglas de materiales

Cada superficie debe poder identificarse incluso sin iluminación especial.

## Césped

- textura corta y sutil;
- superficie continua y relativamente uniforme;
- variación por patrón, densidad y patches verdes;
- flores y pequeñas plantas solo en lugares elegidos;
- sin tierra marrón;
- sin `worn`;
- mayor riqueza vegetal hacia bordes y rincones;
- centro jugable más tranquilo.

## Madera

- dirección de tablas consistente;
- uniones y bordes claros;
- evitar una línea oscura en cada tabla si genera demasiado ruido.

## Piedra / baldosas

- masa sólida;
- bordes claros;
- pequeñas juntas;
- suficientes diferencias con césped y agua para que las colisiones se entiendan.

## Agua

- patrón amplio y coherente;
- 2–4 frames lentos antes que ruido constante;
- reflejos agrupados;
- ondas alrededor de props cuando corresponda.

## Vidrio / botellas

- silueta primero;
- base oscura + cuerpo de color + highlight pequeño;
- no intentar representar detalle realista a escala minúscula.

## Plantas

- grupos de hojas, no píxeles aleatorios;
- 2–3 verdes derivados de la atmósfera nocturna;
- maceta claramente separada de la planta.

---

# 8. Diseño de assets por importancia

## Tier A — Assets protagonistas

- piscina;
- barra;
- DJ booth;
- casa/deck;
- Tambu;
- NPCs principales.

Pueden tener más detalle, 3–4 niveles tonales, animación, luz propia, props integrados y silueta única.

## Tier B — Soporte visual

- mesas;
- parlantes;
- postes;
- jardineras;
- cooler;
- sillas;
- muebles secundarios.

Deben verse terminados, pero subordinados a Tier A.

## Tier C — Clutter

- vasos;
- latas;
- botellas sueltas;
- flores;
- ceniceros;
- pequeños objetos de fiesta.

Su función es contar historia y romper repetición. Nunca deben convertirse en ruido dominante.

---

# 9. Densidad y composición

Más vida no significa llenar cada espacio vacío.

## Alta densidad

- barra;
- DJ;
- bordes sociales del patio;
- mesas;
- esquinas decorativas.

## Densidad media

- laterales de piscina;
- grupos de NPCs;
- transición deck/césped.

## Necesitan aire

- circulación inmediata de Tambu;
- frente de NPCs interactuables;
- accesos a barra y DJ;
- bordes jugables de piscina;
- recorridos entre puntos de interés.

El espacio negativo es parte del diseño. Sirve para mover al jugador y para hacer que los grupos sociales sean legibles.

---

# 10. Personajes y relación con el entorno

Los personajes deben pertenecer al mismo mundo visual que los props.

- Tambu mantiene su frame fuente `32x48 px` y `scale: 1.24`.
- No aumentar detalle facial por encima de lo que soporta esta escala.
- Priorizar peinado, outfit, silueta y postura para distinguir personas.
- Tambu debe destacar sin parecer de otro juego.
- NPCs random pueden ser más simples que personajes interactuables.
- Los personajes importantes pueden recibir 1–2 detalles identificatorios adicionales.
- No usar cambios arbitrarios de escala para comunicar edad, personalidad o importancia narrativa.

Todos los personajes deben tener sombra de contacto consistente.

Los NPCs no deben distribuirse como piezas de tablero. Deben formar pequeños grupos, mirar hacia alguien/algo y ocupar el espacio según una intención social.

---

# 11. Movimiento ambiental

La vida del mapa debe continuar aunque Tambu no se mueva.

Prioridad:

1. agua animada;
2. guirnaldas y luces con variación muy leve;
3. DJ con pulso o cambio de iluminación;
4. NPCs con idles/giros simples;
5. pequeños props animados solo cuando aporten.

Evitar que todo se anime al mismo tiempo. El movimiento también necesita jerarquía.

---

# 12. UI vs mundo

La UI puede ser más limpia y contrastada que el escenario, pero debe compartir lenguaje pixel-art.

- HUD legible por encima de la escena.
- Marcos oscuros.
- Iconografía simple.
- Acentos cálidos para puntos/recursos y rojos para vidas.
- Evitar glows grandes detrás de paneles.
- La UI nunca debe competir con NPCs o fuentes de interacción.

La UI final no queda congelada en esta fase; solo queda fijada su relación estética con el mundo.

---

# 13. Qué evitar

- aumentar detalle solo por aumentar detalle;
- sprites con perspectivas distintas;
- escalas inconsistentes;
- reescalar a Tambu para adaptar otro asset;
- aprobar mobiliario o arquitectura sin compararlo con Tambu;
- antialias en assets;
- objetos con bordes excesivamente negros;
- césped con checker o ruido repetitivo;
- césped con hue distinto entre variantes;
- verdes amarillos/diurnos en materiales base;
- tierra o `worn` en el césped actual;
- neón aplicado a todo;
- halos pintados dentro de cada sprite;
- props distribuidos uniformemente;
- NPCs alineados como grilla;
- sombras blandas realistas mezcladas con sprites sin volumen;
- copiar literalmente una referencia generada;
- usar una sheet conceptual como fuente de recortes finales;
- cambiar el macro-layout para hacer que una ilustración encaje;
- diseñar assets aislados sin probarlos dentro del mapa.

---

# 14. Pipeline obligatorio para cada asset importante

No producir un asset final solo a partir de un prompt.

Para Tier A y Tier B:

1. **Definir función** — qué hace y por qué existe.
2. **Definir footprint** — tamaño, colisión y espacio jugable actual.
3. **Calibrar con Tambu** — colocar frame real de Tambu y determinar proporción objetivo.
4. **Referencia / exploración** — IA, boceto o referencias visuales pueden proponer dirección.
5. **Diseño individual** — una imagen = un asset final candidate.
6. **Normalización** — perspectiva, escala, paleta, pixel density, bordes y detalle.
7. **Prueba con Tambu** — asset + Tambu a escala runtime real.
8. **Integración** — colocarlo en el patio real.
9. **Iluminación / sombra** — resolver contacto y fuente local.
10. **Revisión en contexto** — comprobar jerarquía, escala y lectura jugable.
11. **Variantes** — solo cuando la repetición lo justifique.
12. **Aprobación** — recién entonces se considera reutilizable.

## Regla específica de generación IA

- una imagen = un asset;
- no sheets como entrega de producción;
- no collages;
- no pack presentations para recortar;
- no atlas conceptuales como fuente de PNG finales;
- transparencia real cuando corresponda;
- cualquier sheet puede usarse únicamente como referencia visual.

Ver reglas completas en `docs/PIXEL_ART_STYLE_GUIDE.md`.

---

# 15. Gate visual antes de producir todo el patio

Antes de rehacer decenas de assets se debe construir y aprobar una **muestra de calibración** con:

- césped final candidate;
- un tramo de deck;
- una esquina de piscina con agua y borde;
- una luz cálida;
- una fuente fría/cian;
- una planta o prop Tier B;
- **Tambu real colocado a `scale: 1.24`, sin ninguna modificación de escala**.

La muestra debe validar simultáneamente:

- paleta;
- perspectiva;
- materiales;
- contraste;
- escala humana;
- sombra;
- comportamiento de iluminación.

Si esta muestra no funciona, se corrige antes de producir barra, DJ y resto del set.

---

# 16. Criterios de aprobación de la dirección

La Fase 0 se considera correctamente aplicada cuando una producción futura puede responder con claridad:

- ¿qué nivel de detalle corresponde a este objeto?;
- ¿qué perspectiva debe usar?;
- ¿qué tamaño tiene al lado de Tambu?;
- ¿su footprint actual sigue siendo razonable?;
- ¿qué paleta le pertenece?;
- ¿cómo recibe o emite luz?;
- ¿qué importancia tiene dentro del mapa?;
- ¿cuánto clutter puede rodearlo?;
- ¿debe ser sprite, tile, overlay o efecto por código?;
- ¿sigue pareciendo parte de Tambu Game al lado de los otros assets?

## Resultado visual esperado

Al completar las fases posteriores usando esta dirección, el patio debe:

- sentirse nocturno sin perder legibilidad;
- tener una piscina visualmente atractiva como centro;
- mostrar materiales claros y objetos con volumen;
- usar barra y DJ como focos secundarios;
- sentirse más vivo mediante composición, props, NPCs y animación ambiental;
- mantener caminos y colisiones legibles;
- verse coherente incluso sin UI;
- conservar la identidad y el layout jugable actual;
- mantener proporciones creíbles respecto de Tambu en todos los objetos humanos.
