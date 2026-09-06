# Tambu Game — Game Design

## Premisa

Juego 2D pixel-art de comedia social. Tambu intenta atravesar una noche de fiesta, hablar con distintas mujeres y sobrevivir a la interferencia de su grupo de amigos.

## Objetivo actual — V1: LA FIESTA

La primera versión completa de Tambu Game se concentra **exclusivamente en el mapa actual de la fiesta en el patio**.

No hace falta expandir todavía el juego a otros mapas, días, citas posteriores, campaña o mundo más grande.

La meta es que este único mapa se sienta como una experiencia terminada, pulida, rejugable y suficientemente divertida para que el grupo de amigos pueda jugar una primera versión completa.

Principio de alcance:

> Antes de construir más mundo, terminar una noche de Tambu que se sienta como un juego completo.

Todo lo que se agregue durante esta etapa debe responder al menos a una de estas preguntas:

- ¿hace más divertida la noche?;
- ¿mejora la rejugabilidad?;
- ¿refuerza el humor y la identidad del grupo?;
- ¿mejora la experiencia de usuario?;
- ¿hace que el patio se sienta más vivo?;
- ¿aumenta el nivel de pulido de la V1?

Si no ayuda a esta experiencia, queda para una versión futura.

## Loop de la V1

1. Llegada de Tambu a la fiesta.
2. Exploración libre del patio.
3. Detectar NPCs y situaciones interactuables.
4. Conversar con distintas mujeres.
5. Tomar decisiones sociales con estadísticas ocultas y contexto narrativo.
6. Consultar opcionalmente a **El Consejo** cuando corresponda.
7. Resolver cada interacción con distintos outcomes.
8. Volver al patio y continuar la misma noche.
9. Participar en eventos, gags y minijuegos del mapa.
10. Acumular puntos, logros y resultados durante toda la run.
11. Finalizar la noche con un resumen de lo ocurrido.

## Outcomes sociales

Los outcomes principales de una interacción pueden incluir:

- 🚻 **Baño** — premio máximo.
- ❤️ **Cita**.
- 📱 **Instagram**.
- 💀 **Friendzone**.
- 👋 **Rechazo**.

### Regla importante del Baño

**BAÑO es el outcome social máximo de Tambu Game. Una cita no es el premio máximo.**

Durante la V1, no se exige una cita previa ni una progresión entre días para poder llegar al baño.

Cada chica funciona como una oportunidad independiente dentro de la misma noche. Si la conversación y el contexto llegan al punto necesario, esa interacción puede terminar en 🚻 BAÑO.

Tambu puede conseguir **más de un Baño durante la misma noche** si logra ese outcome con distintas chicas.

Esto es intencional y forma parte de la fantasía/comedia central de la V1.

Conseguir Baño una segunda vez no debe considerarse inválido ni narrativamente prohibido por haber ocurrido antes esa noche.

En el vertical slice actual de Sofi, las rutas del anterior outcome máximo `date` pasan a resolver `bathroom` sin modificar su balance. La cita queda disponible como outcome posible para situaciones futuras, pero no es un resultado de Sofi V5.

## Evento del Baño

Llegar a 🚻 BAÑO no debe resolverse únicamente con una tarjeta de puntos.

Debe convertirse en un evento especial de gameplay y puesta en escena.

Flujo conceptual:

1. La conversación termina con outcome `bathroom`.
2. Se dispara una cutscene/evento separado del sistema social.
3. Tambu y la chica se dirigen al baño.
4. Entran.
5. La puerta se cierra.
6. Se deja un breve momento para que el jugador registre que consiguió el premio máximo.
7. Los amigos comienzan a golpear/intentar entrar.
8. Comienza el minijuego **RESISTENCIA DEL BAÑO**.
9. El minijuego termina en éxito o desastre.
10. La partida continúa en el patio.

La lógica social solo debe decidir que el outcome fue Baño. La animación, movimiento, cámara, puerta, sonido y minijuego deben pertenecer a una capa de eventos/cutscenes independiente.

## Minijuego — RESISTENCIA DEL BAÑO

Nombre provisional oficial:

> **RESISTENCIA DEL BAÑO**

Mecánica base:

- aparece una barra de resistencia de la puerta;
- la barra baja continuamente y con rapidez;
- el jugador debe presionar **SPACE repetidamente** para recuperar/mantener la resistencia;
- los golpes de afuera pueden aumentar en intensidad durante el evento;
- si la barra llega a cero, la puerta cede;
- si el jugador aguanta hasta terminar el tiempo/evento, mantiene la puerta cerrada.

La primera versión debe ser corta e intensa. El objetivo es que sea gracioso y frenético, no agotador.

El ritmo puede escalar narrativamente:

- golpes suaves al principio;
- golpes más fuertes;
- voces reconocibles del grupo;
- varios amigos intentando entrar hacia el final;
- puerta temblando o reaccionando visualmente.

### Resultado del minijuego

Entrar al baño ya cuenta como haber conseguido el outcome 🚻 BAÑO.

Perder RESISTENCIA DEL BAÑO **no debe borrar retroactivamente ese logro ni transformarlo en rechazo**.

El minijuego agrega un segundo desenlace:

- **Éxito** → desenlace legendario completo / bonus mayor.
- **Fracaso** → desenlace caótico o humillante / bonus diferente.

Perder también debe ser divertido y puede tener su propia escena, remate o logro.

## Varias chicas en una misma noche

La V1 no busca simular una progresión romántica de varios días.

El jugador puede hablar con distintas chicas del patio y resolver cada interacción independientemente.

Ejemplo posible de una misma run:

- Sofi → Instagram;
- Mili → Baño;
- Cami → Friendzone;
- otra chica → Baño.

El diseño debe permitir que estas historias coexistan dentro de la misma noche.

## Experiencia de diálogo — capa futura sobre la lógica

La lógica narrativa/social y la presentación visual deben permanecer desacopladas.

La lógica decide:

- qué se dijo;
- qué respuesta eligió Tambu;
- qué reacción corresponde;
- qué señales se generaron;
- cómo cambian los estados sociales;
- qué outcome se alcanza.

La presentación puede evolucionar después sin reescribir esas reglas.

Mejoras previstas para la experiencia:

- mostrar cada intervención secuencialmente en vez de toda la conversación de golpe;
- efecto de texto escribiéndose / typewriter;
- ENTER/SPACE para avanzar o acelerar;
- pequeñas pausas dramáticas;
- sonidos de diálogo;
- reacciones físicas de sprites;
- personajes girándose hacia quien habla;
- risas, gestos o movimientos;
- cámara y pequeños zooms;
- oscurecimiento o enfoque del fondo cuando corresponda;
- feedback especial para decisiones y outcomes.

Objetivo:

> Que las conversaciones se sientan como escenas y no como leer una transcripción.

## Eventos y vida del patio

La fiesta debe sentirse viva incluso fuera de las conversaciones principales.

Pueden existir pequeños eventos, gags y situaciones reutilizando el mismo mapa, por ejemplo:

- intervenciones de amigos;
- eventos de Santy;
- `PITITY SALIÓ`;
- fotógrafo / referencia a **Furiosos los viernes**;
- discusiones o comentarios del grupo;
- alguien cayendo a la pileta;
- pedidos de reggaetón viejo;
- NPCs bailando, tomando, hablando o besándose;
- pequeños sucesos ambientales.

No todos estos elementos necesitan convertirse en sistemas grandes o questlines.

La prioridad es que caminar por el patio tenga personalidad y sorpresas.

## Los amigos más allá de El Consejo

Los amigos pueden tener presencia fuera del sistema de consejos mediante:

- diálogos ambientales;
- comentarios sobre lo que hizo Tambu;
- callbacks a outcomes anteriores de esa misma noche;
- pequeñas escenas;
- eventos aleatorios;
- participación en minijuegos;
- remates grupales.

No es necesario convertir a cada amigo en una historia independiente para la V1.

## Principio de arquitectura para eventos

Las conversaciones deben resolver gameplay social y emitir resultados/señales.

Los eventos especiales deben consumir esos resultados desde otra capa.

Flujo conceptual:

```text
Social logic
    ↓
Conversation flow
    ↓
Dialogue presentation
    ↓
Outcome / signal
    ↓
Event / Cutscene system
    ↓
Minigame / gameplay especial
    ↓
Regreso al patio
```

Ejemplo:

```text
outcome: bathroom
    ↓
BathroomEvent
    ↓
cutscene de entrada
    ↓
BathroomResistanceMinigame
    ↓
success / failure
    ↓
cutscene final
    ↓
regreso a la fiesta
```

Evitar meter movimiento de sprites, cámara o lógica específica del baño dentro del resolver social.

### Implementación actual — fase 1

La primera fase llega hasta la entrada al baño: el diálogo presenta un cierre narrativo, `BathroomEvent` conduce a Tambu y Sofi hasta la puerta real del patio, confirma el outcome y devuelve a Tambu al mapa. El outcome ya queda persistido y no puede farmearse.

**RESISTENCIA DEL BAÑO todavía no está implementado.** Se conectará después de esta transición sin cambiar el resultado social ya obtenido.

## Fin de la noche

La V1 debería tener principio y final.

Al terminar la run puede existir un resumen de resultados, por ejemplo:

```text
LA NOCHE DE TAMBU

🚻 BAÑOS: 2
❤️ CITAS: 1
📱 INSTAGRAMS: 1
💀 FRIENDZONES: 1
👋 RECHAZOS: 2

⭐ PUNTOS: 2850
```

El formato definitivo se diseñará más adelante, pero la intención es que toda la fiesta se perciba como una **run social completa**.

## Sistemas de la V1

Sistemas confirmados o previstos dentro del alcance del patio:

- vidas;
- puntos;
- alcohol;
- Attraction;
- Trust;
- Intensity;
- El Consejo;
- conversaciones ramificadas y contextuales;
- historial y señales narrativas;
- outcomes sociales;
- 🚻 Baño;
- RESISTENCIA DEL BAÑO;
- eventos ambientales/sociales;
- presentación de diálogo mejorada;
- cutscenes/eventos especiales;
- resumen final de la noche;
- polish audiovisual y de UX.

## Primer mapa — Fiesta en el patio

Este mapa es el escenario completo de la V1.

Debe incluir y pulir:

- casa de fondo;
- patio amplio;
- césped;
- piscina;
- barra;
- DJ;
- luces;
- baño visible;
- basura ligera de fiesta;
- NPCs de relleno;
- mujeres interactuables con personalidades distintas;
- grupo de amigos distribuido por el mapa;
- atmósfera de fiesta;
- rutas claras de navegación;
- espacios preparados para eventos y minijuegos.

La macrodisposición actual del patio se mantiene como base.

## Qué queda fuera por ahora

No desarrollar todavía como parte de esta V1:

- segundo mapa;
- otros días;
- sistema de citas posteriores;
- progresión romántica entre mapas;
- campaña extensa;
- ciudad/mundo abierto;
- sistemas grandes que no mejoren directamente la fiesta actual.

Estas ideas pueden retomarse después de validar la V1 con amigos.

## Condición para avanzar a nuevos mapas

No se pasa a un segundo mapa simplemente porque el patio esté técnicamente jugable.

La referencia es:

> Los amigos jugaron la fiesta, probaron distintas rutas, encontraron eventos, se rieron, quisieron repetirla y sienten que quieren ver qué viene después.

Recién entonces tiene sentido diseñar nuevas zonas, noches o progresión.

## Principio de desarrollo

Primero gameplay, personalidad y lectura visual. Después polish progresivo.

La prioridad actual es cerrar sistemas y contenido dentro del patio antes de expandir el mundo.

Los assets importantes pueden refinarse durante la fase de polish. Los NPCs secundarios y props deben ser reutilizables y razonables de producir.

La V1 debe sentirse pequeña en alcance pero completa en experiencia.
