# Tambu Game — UI Direction

**Versión:** 1.0  
**Estado:** dirección activa — baseline de UI definida  
**Scope:** V1 · todo el juego  
**Base visual de referencia:** intro nocturna, GAME OVER, PERFECT NIGHT y NORMAL END integrados en `main`

Este documento fija **cómo debe verse, organizarse y comportarse la interfaz de Tambu Game**. No reemplaza la dirección de arte del mundo: la complementa.

Documentos relacionados:

- `docs/CURRENT_STATE.md` → autoridad sobre estado, vigencia y prioridades.
- `docs/ART_DIRECTION.md` → atmósfera y lenguaje visual del mundo.
- `docs/PIXEL_ART_STYLE_GUIDE.md` → reglas técnicas de pixel art.
- `docs/GAME_DESIGN.md` → loop, estados y objetivos de la V1.

Si una implementación funcional contradice esta dirección visual, se corrige la presentación sin alterar la lógica salvo decisión explícita de Dirección.

---

# 1. Identidad de UI

La UI de Tambu debe sentirse como una **interfaz arcade/pixel nocturna, sobria y con personalidad**, no como una capa genérica de Phaser ni como una HUD futurista.

La identidad nace de cuatro piezas ya integradas:

1. el reloj `00:00 → 00:01` de la intro;
2. el golpe visual de GAME OVER;
3. la presentación contenida de PERFECT NIGHT;
4. el scoreboard final de NORMAL END.

La dirección global es:

> **pixel-grid + noche profunda + líneas azuladas + blanco jerarquizado + composición limpia + timing con intención.**

La UI debe parecer parte de la misma noche que el patio, incluso cuando cubre casi toda la pantalla.

---

# 2. Principios no negociables

## 2.1 Jerarquía antes que decoración

La interfaz siempre debe responder con claridad:

1. ¿qué es lo más importante?;
2. ¿qué información necesito leer después?;
3. ¿qué acción puedo ejecutar?;
4. ¿qué es puramente decorativo?

No todos los textos pueden tener el mismo tamaño, brillo o contraste.

## 2.2 Pixel art real, no tipografía de sistema disfrazada

Para títulos, scores, labels importantes y pantallas de estado se usa el lenguaje de `src/ui/pixelText.js`:

- glyphs 5×7;
- bloques cuadrados;
- sin antialias;
- mayúsculas;
- separación visible entre celdas;
- geometría dura y legible.

No introducir nuevas fuentes externas para resolver una pantalla puntual.

## 2.3 Sobriedad

Evitar:

- cards decorativas por defecto;
- gradientes modernos;
- glassmorphism;
- blur;
- sombras suaves de UI web;
- glows grandes;
- marcos ornamentales excesivos;
- iconos genéricos;
- emojis de sistema;
- múltiples colores compitiendo.

Una línea fina bien ubicada vale más que cinco adornos.

## 2.4 El patio sigue existiendo

Cuando una pantalla de cierre o evento aparece sobre el mundo, el patio puede quedar insinuado debajo mediante overlay oscuro.

La UI no debe sentirse como cambiar a otra aplicación.

Excepción: GAME OVER puede usar un fondo completamente opaco y agresivo porque su función es cortar la noche.

## 2.5 El espacio vacío forma parte de la composición

No llenar la pantalla solo porque exista espacio.

El aire separa jerarquías y hace que:

- títulos;
- tablas;
- score;
- prompts;

se lean como bloques distintos.

---

# 3. Sistema tipográfico

## 3.1 Display pixel

`src/ui/pixelText.js` es la baseline de tipografía display.

Uso recomendado:

- títulos de pantallas;
- números grandes;
- nombres;
- outcomes;
- headers;
- labels;
- prompts cortos;
- estados especiales.

Todo glyph nuevo debe agregarse al sistema 5×7 y quedar cubierto por tests.

## 3.2 Texto largo / diálogo

El renderer 5×7 **no debe usarse para párrafos largos por obligación**.

Diálogos, narrativa y textos de varias líneas pueden conservar una tipografía legible de cuerpo mientras esa capa siga provisional.

Objetivo futuro: llevar también esas superficies al mismo lenguaje visual sin sacrificar legibilidad.

Regla:

> display = pixel 5×7; cuerpo = legibilidad primero.

## 3.3 Escala jerárquica

La escala exacta depende del contenido y del viewport, pero la relación debe mantenerse:

- **Hero / punchline:** máximo contraste y tamaño.
- **Título:** dominante, pero no ocupa media pantalla sin razón.
- **Dato clave / score:** grande, separado.
- **Contenido principal:** mediano.
- **Headers / labels:** menores y apagados.
- **Prompt:** pequeño y secundario.

En `1280×720`, los `cellSize` habituales pueden caer aproximadamente en:

- hero: 10–14;
- título: 8–10;
- contenido: 5–8;
- labels: 4–5;
- prompt: 3–4.

Estos valores son referencias, no constantes. Siempre usar `measurePixelText()` para fit.

## 3.4 Uppercase

La UI display usa mayúsculas como idioma visual principal.

Ejemplos:

- `LA NOCHE DE TAMBU`
- `NOCHE PERFECTA`
- `PUNTAJE`
- `BAÑO ASEGURADO`
- `ENTER / SPACE · VOLVER A JUGAR`

No forzar mayúsculas en diálogo narrativo si afecta el tono o lectura.

---

# 4. Paleta de UI

La UI se apoya en una familia nocturna fría y contenida.

## Base

- Deep overlay A: `#05080D`
- Deep overlay B: `#060B14`
- Panel oscuro: `#081421`

## Texto

- Primary / title: `#F2F5F7`
- Main text: `#D5DCE4`
- Secondary / labels: `#94A6B9`

## Frames

- Frame / divider: `#355A78`

Estos valores salen de la baseline actual de NORMAL END y funcionan como referencia global.

No es obligatorio que cada panel use exactamente el mismo hex, pero debe permanecer dentro de esta familia.

## Colores semánticos

Los colores fuertes son excepción, no decoración.

- **Danger / GAME OVER:** rojo saturado reservado a derrota o peligro fuerte.
- **Puntos / recompensa:** acento cálido permitido en feedback puntual.
- **Success:** cyan frío o verde pálido, usado con moderación.
- **Warning / interrupted:** ámbar apagado si hace falta diferenciar.
- **Lives:** rojo funcional.

Nunca depender solo del color para comunicar un estado. Siempre acompañar con texto o iconografía clara.

---

# 5. Fondos y overlays

## Pantallas de cierre

Baseline:

- overlay oscuro entre aproximadamente `0.92–0.97` alpha;
- patio apenas visible;
- sin blur;
- sin shaders;
- sin gradientes complejos.

NORMAL END actual usa:

- `#060B14`;
- alpha `0.94`.

PERFECT NIGHT actual usa:

- `#05080D`;
- alpha `0.97`.

Ambos son válidos dentro del mismo sistema.

## GAME OVER

Es la excepción deliberada:

- rojo opaco;
- mundo desaparece;
- punchline central;
- impacto inmediato después del beat.

---

# 6. Marcos, líneas y paneles

## Forma

Preferir:

- rectángulos;
- esquinas duras;
- bordes de 1–3 px;
- líneas horizontales y verticales;
- composición ortogonal.

Evitar:

- rounded cards;
- cápsulas;
- neumorfismo;
- bordes gruesos decorativos;
- múltiples marcos anidados sin función.

## Color

Frames y dividers usan azul grisáceo oscuro.

Deben estructurar, no dominar.

## Continuidad

Una tabla es una sola estructura.

Si existe una divisoria vertical o una regla horizontal:

- debe continuar de manera coherente;
- no puede aparecer en una fila y desaparecer en otra;
- no deben existir cortes visuales accidentales entre filas.

## Panel fill

Los paneles pueden usar fill oscuro semitransparente cuando ayude a separar contenido del mundo.

No usar fill solo para crear “cards”.

---

# 7. Layout y composición

## Base

Viewport de referencia:

`1280×720`

Pero toda UI debe construirse desde:

- `scene.scale.width`;
- `scene.scale.height`;
- porcentajes razonables;
- `measurePixelText()`.

No diseñar una pantalla que solo funcione con coordenadas absolutas de 1280×720.

## Márgenes

Las pantallas full-screen deben conservar un perímetro respirable.

Referencia habitual:

- frame exterior: aproximadamente 4–6% desde los bordes;
- contenido principal: aproximadamente 10–14% desde los laterales.

## Alineación

Priorizar:

- centros reales;
- columnas claras;
- baselines consistentes;
- alturas de fila iguales;
- padding repetible;
- simetría cuando la pantalla sea ceremonial;
- alineación funcional cuando haya tablas.

## Proximidad semántica

Elementos relacionados deben estar visualmente juntos.

Ejemplo obligatorio en resultados:

`SOFI → FRIENDZONE`

debe leerse como una misma fila.

Nunca separar tanto nombre y resultado que la relación dependa de “seguir una línea con el ojo”.

---

# 8. Tablas y scoreboards

La pantalla NORMAL END establece la baseline para tablas de resultados.

Reglas:

- headers separados del contenido;
- columnas estables;
- filas de altura uniforme;
- dividers continuos;
- nombres y outcomes alineados;
- score fuera de la tabla si representa una métrica global;
- frame fino, no card por fila.

Orden de lectura:

1. título;
2. headers;
3. filas;
4. score;
5. acción disponible.

No usar portrait o icono si no existe un asset pixelado real y legible. La estructura debe funcionar sin decoración.

---

# 9. Iconografía

Usar iconos solo cuando:

- aportan lectura;
- existen como asset aprobado;
- coinciden con pixel density y paleta;
- funcionan al tamaño real del juego.

No introducir:

- emojis del sistema;
- Lucide/FontAwesome genéricos;
- SVGs vectoriales que parezcan de otra interfaz;
- símbolos inventados con primitives si su función es puramente decorativa.

Si no existe iconografía aprobada, usar texto.

---

# 10. Prompts e interacción

Los prompts son **terciarios**.

Formato preferido:

`INPUT · ACCIÓN`

Ejemplos:

- `ENTER / SPACE · REINTENTAR`
- `ENTER / SPACE · SEGUIR DE FIESTA`
- `ENTER / SPACE · VOLVER A JUGAR`

Características:

- tamaño pequeño;
- color secundario;
- posición inferior clara;
- sin competir con contenido principal;
- habilitados solo cuando la acción realmente está disponible.

Los prompts deben aparecer después del mensaje principal cuando el timing de la pantalla lo requiera.

---

# 11. Timing y comedic beats

La UI de Tambu no aparece siempre “lo antes posible”.

El timing es parte de la identidad.

## GAME OVER

Baseline actual:

- estado terminal inmediato;
- gameplay bloqueado;
- ~900 ms de último frame / silencio;
- golpe rojo + punchline;
- ~450 ms;
- prompt de retry.

Objetivo: que la derrota tenga timing de chiste.

## PERFECT NIGHT

Baseline actual:

- gameplay bloqueado;
- ~700 ms de patio;
- reveal de victoria;
- ~500 ms;
- prompt.

Objetivo: dejar registrar el logro antes de pedir otra acción.

## NORMAL END

Baseline actual:

- gameplay bloqueado;
- ~700 ms de patio;
- summary;
- ~500 ms;
- replay prompt.

Objetivo: transición limpia de noche a resumen.

## Regla general

No copiar estos números ciegamente a cualquier UI.

La regla es:

> primero comunicar el momento, después pedir input.

---

# 12. Input gating

Durante una transición:

- consumir ENTER/SPACE residuales;
- no permitir que el mismo input que cerró un diálogo active inmediatamente la siguiente pantalla;
- habilitar acciones únicamente cuando el prompt está visible/ready.

Esto es parte de la presentación, no solo una defensa técnica.

---

# 13. Relación entre UI y estados de juego

La UI no decide resultados.

Debe recibir estados o snapshots ya resueltos.

Ejemplos:

- `RunState` decide GAME OVER / NORMAL END / PERFECT NIGHT.
- `getRunSummary(gameState)` produce datos de resumen.
- la UI solo presenta esos datos.

No duplicar lógica de outcomes dentro de una pantalla.

---

# 14. Tres familias de UI

## A. Terminal / ceremonial

Ejemplos:

- intro;
- GAME OVER;
- PERFECT NIGHT;
- NORMAL END.

Estado: **baseline visual ya definida**.

Características:

- pixel display;
- composición centrada o scoreboard;
- overlays fuertes;
- timing controlado;
- poco contenido;
- gran jerarquía.

## B. Panels de gameplay

Ejemplos:

- diálogo;
- Consejo;
- Bathroom Resistance;
- outcomes intermedios.

Estado: **funcionales, visualmente provisionales**.

Deben migrar gradualmente hacia:

- fondos oscuros;
- frames finos azulados;
- jerarquía tipográfica;
- menos blanco puro;
- prompts secundarios;
- iconografía pixelada real o texto.

No hacer un rediseño global de estas pantallas sin una tarea dedicada.

## C. HUD persistente

Ejemplos:

- vidas;
- puntos;
- alcohol;
- interaction prompt.

Estado: **funcional, provisional**.

Debe ser la capa más liviana del sistema:

- alta legibilidad;
- mínima superficie;
- sin marcos enormes;
- sin competir con NPCs;
- semántica cromática contenida.

---

# 15. Qué queda protegido desde ahora

Quedan como **lenguaje aprobado**:

- pixel display 5×7 para texto de alto nivel;
- overlays nocturnos azul-negro;
- blanco jerarquizado, no blanco uniforme;
- azul grisáceo para frames y dividers;
- marcos rectos y finos;
- tablas con alineación fuerte;
- score separado como métrica;
- prompts pequeños al pie;
- delays de presentación con intención;
- patio insinuado debajo en cierres no destructivos;
- GAME OVER como excepción cromática fuerte.

Una UI nueva debe partir de estas reglas.

No debe inventar una identidad visual distinta por pantalla.

---

# 16. Qué NO queda congelado

Todavía puede cambiar mediante tareas específicas:

- tamaños exactos de cada pantalla;
- spacing fino;
- posición exacta de títulos;
- intensidad concreta de overlays;
- layout final del HUD;
- layout final de diálogo;
- iconos finales;
- microanimaciones;
- sonido de UI;
- menú inicial;
- accesibilidad completa.

Estas decisiones pueden evolucionar sin romper el sistema descrito arriba.

---

# 17. Reglas de implementación

## Reutilizar antes de duplicar

Para display text usar:

`src/ui/pixelText.js`

Si un carácter no existe:

1. agregar glyph 5×7;
2. mantener la misma grilla;
3. actualizar tests.

## Fit de texto

Nunca asumir que un label largo entra.

Usar:

- `measurePixelText()`;
- ancho disponible;
- altura disponible;
- `cellSize` dinámico.

`BAÑO INTERRUMPIDO` es un caso de referencia útil para validar overflow.

## Coordenadas

- derivar layout desde viewport;
- redondear coordenadas de pixel primitives;
- evitar half-pixels en líneas;
- conservar line widths enteros.

## Cleanup

Toda UI creada por Scene debe:

- destruir Graphics/Text/Images en shutdown;
- no dejar listeners o timers vivos;
- no duplicar input al reiniciar.

## Assets

No usar screenshots o mockups como assets runtime.

Una referencia visual se reconstruye con:

- pixelText;
- Graphics;
- sprites aprobados;
- assets pixelados reales.

---

# 18. QA visual obligatorio

Una pantalla nueva o rediseñada no queda aprobada solo porque compila.

Validar manualmente:

1. ¿se entiende qué mirar primero?;
2. ¿hay demasiado blanco puro?;
3. ¿los labels secundarios realmente son secundarios?;
4. ¿las líneas estructuran sin dominar?;
5. ¿las columnas y filas están alineadas?;
6. ¿los dividers son continuos?;
7. ¿el texto más largo entra?;
8. ¿el prompt aparece cuando corresponde?;
9. ¿el input anterior queda consumido?;
10. ¿la UI parece del mismo juego que intro, GAME OVER y NORMAL END?;
11. ¿sigue siendo legible sobre el patio real?;
12. ¿hay suficiente aire?;

La QA visual la realiza Eze sobre el juego real.

---

# 19. Anti-patterns

Rechazar una solución que:

- usa `monospace` grande como título final cuando corresponde pixel display;
- pone todo en blanco puro;
- hace todos los textos del mismo tamaño;
- crea una card por cada dato;
- usa bordes redondeados de UI web;
- agrega glow para “hacerlo más gaming”;
- usa emojis como iconografía final;
- rompe una tabla con dividers incompletos;
- centra elementos matemáticamente pero los deja ópticamente desequilibrados;
- llena el fondo con decoración innecesaria;
- prioriza ornaments sobre lectura;
- muestra un prompt antes de que el jugador haya podido leer el mensaje;
- mezcla estilos distintos entre pantallas sin una razón semántica.

---

# 20. Resultado esperado

Cuando el sistema de UI esté maduro, un jugador debería poder reconocer una pantalla de Tambu aun sin ver personajes ni patio.

Debe reconocerla por:

- la grilla pixelada;
- los marcos finos azulados;
- el fondo nocturno;
- la jerarquía blanca/gris;
- la composición aireada;
- la forma en que aparece el input;
- el timing seco y deliberado.

La UI debe acompañar el humor del juego sin convertirse en el chiste.

**El mundo tiene personalidad. La interfaz también, pero sabe cuándo callarse.**
