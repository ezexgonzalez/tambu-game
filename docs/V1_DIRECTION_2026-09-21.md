# Tambu Game — Dirección V1, prioridades e ideas

**Fecha:** 2026-09-21  
**Estado:** documento de dirección / planificación  
**Relacionado con:** `docs/PROJECT_AUDIT_2026-09-21.md`  
**Autoridad del runtime actual:** `docs/CURRENT_STATE.md`

Este documento consolida las decisiones tomadas después de la auditoría completa de Astra y de la revisión posterior con Eze.

No reemplaza `CURRENT_STATE.md`. Su función es conservar prioridades, decisiones de producto, ideas aprobadas conceptualmente y preguntas abiertas para la V1.

---

# 1. Dirección general

Tambu ya no necesita demostrar que puede sumar más sistemas.

El objetivo ahora es convertir las piezas existentes en una **noche completa, jugable, graciosa, coherente y rejugable**.

La prioridad de dirección pasa de:

> construir piezas aisladas

a:

> conectar las piezas en una experiencia con principio, desarrollo, consecuencias y cierre.

La V1 sigue ocurriendo exclusivamente en el patio actual.

No expandir todavía a otros mapas, más chicas, campaña, mundo abierto ni sistemas grandes que no mejoren directamente esta noche.

---

# 2. Lo más importante de la auditoría de Astra

La auditoría confirma que la base técnica es suficientemente buena para terminar la V1:

- arquitectura separada por sistemas y dominios;
- conversaciones data-driven;
- Sofi, Mili y Cami con lógica social real;
- El Consejo;
- outcomes persistidos;
- BathroomEvent y Bathroom Resistance;
- tests amplios;
- build funcional;
- pipeline visual ya probado con Sofi y Mili.

No hace falta una refactorización general ni migrar a arquitecturas más complejas.

## Fortalezas que hay que proteger

- identidad propia del grupo;
- humor contextual;
- patio único;
- sistema social oculto;
- Consejo como interpretación, no como respuesta correcta;
- personalidades diferentes entre Sofi, Mili y Cami;
- separación entre lógica social, presentación y eventos;
- QA visual manual de Eze;
- capacidad de retirar una solución que técnicamente funciona pero visualmente no.

## Riesgos principales detectados

1. Seguir puliendo arte sin construir una run completa.
2. Expandir NPCs, idles y ambientación sin presupuesto claro.
3. Tener sistemas que funcionan técnicamente pero presentan incoherencias narrativas o geométricas.
4. Perder los visual masters aprobados y volver a reconstruir personajes desde sprites pequeños.
5. Confundir tests verdes con experiencia completa validada.

---

# 3. Hallazgos críticos que deben corregirse

Estos puntos vienen de la auditoría y se consideran trabajo real, no mejoras cosméticas.

## BathroomEvent

### Ruta al baño

Desde las posiciones actuales de Mili y Cami, el primer segmento del recorrido al baño cruza geométricamente la piscina.

Se debe resolver con rutas de entrada seguras por zona.

No implementar pathfinding general.

### Depth de Tambu

Durante BathroomEvent, Tambu puede mantener un depth incorrecto porque el update normal del jugador queda suspendido.

Se debe actualizar su profundidad durante el trayecto igual que se hace con las chicas.

---

## Mili / Consejo

Hay una ruta donde Mili advierte que Tambu debería bajar un cambio, pero las señales conservadas pueden hacer que El Consejo interprete la situación como positiva.

Debe corregirse la precedencia/semántica de esas señales.

También existe un callback de Mili que puede mencionar que Tambu "robó el vaso" aunque esa elección no ocurrió.

Debe condicionarse al historial correcto o usarse una variante alternativa.

---

## Marker de interacción

Una chica ya resuelta deja de ser interactuable, pero el marker visual puede seguir sugiriendo que existe interacción.

La disponibilidad visual debe coincidir con la disponibilidad real.

---

# 4. Prioridad de producción acordada

## 1 — Cami visual

Terminar Cami mientras el pipeline de personajes sigue caliente.

Objetivo inicial:

- sprite real;
- walk necesario;
- idle mínimo;
- integración con conversación;
- integración con BathroomEvent.

No abrir todavía una gran producción de special idles.

---

## 2 — Pasada de coherencia crítica

Resolver:

- rutas seguras al baño;
- depth de Tambu;
- inconsistencias Mili/Consejo;
- callback incorrecto;
- marker de personajes resueltos.

---

## 3 — FIRST COMPLETE NIGHT

Este será el próximo gran milestone funcional.

Una run debe poder:

1. iniciar;
2. presentar la llegada;
3. permitir jugar toda la noche;
4. resolver las tres chicas;
5. terminar en derrota, victoria máxima o final normal;
6. mostrar una pantalla final adecuada;
7. permitir reiniciar;
8. iniciar una segunda run limpia.

---

## 4 — Amigos visuales

Después del loop completo:

- Pitity;
- Uriel;
- Thiago;
- Santy;
- Tobi;
- Eze.

La prioridad es que sean reconocibles.

No necesitan cada uno un sistema propio ni una conversación extensa.

---

## 5 — Población visual finita

Reemplazar los fillers rectangulares con una familia limitada y coherente.

No construir todavía una fábrica combinatoria gigante de:

- peinados;
- ropa;
- accesorios;
- tonos;
- animaciones.

Primero comprobar cuánto hace falta realmente.

---

## 6 — Audio mínimo

Integrar:

- música electrónica;
- ambiente;
- pocos SFX importantes;
- mute/volumen.

El audio debe hacer que el patio se sienta como una fiesta real antes de agregar más sistemas visuales.

---

## 7 — Microeventos

Agregar pocos eventos buenos.

Objetivo inicial:

- 3–5 eventos en catálogo;
- aproximadamente 2–3 visibles por run;
- suficiente silencio entre eventos;
- ninguno debe competir con conversación, Consejo o BathroomEvent.

---

## 8 — UI, balance y polish

Cerrar:

- claridad de controles;
- HUD;
- finales;
- resumen;
- ritmo;
- balance de outcomes;
- dificultad;
- oclusiones;
- presentación final.

---

# 5. Qué NO es prioridad

No hacer todavía:

- más mapas;
- más chicas;
- campaña;
- mundo abierto;
- sistema profundo de alcohol;
- nuevos consejeros completos;
- inventario;
- árbol de habilidades;
- sistema DJ complejo;
- pathfinding general;
- factory enorme de NPCs;
- otra pasada general de piscina/barra/deck;
- paquetes grandes de special idles por personaje;
- refactor general del proyecto.

Los sectores estables solo se tocan ante un defecto concreto.

---

# 6. Intro de la partida — "comienza la noche"

La partida debe tener una entrada breve y memorable.

## Concepto

Tambu entra al lugar.

La pantalla presenta:

`00:00`

Luego cambia a:

`00:01`

y se desvanece mientras aparece el patio.

La intención es comunicar sin explicación:

> la noche acaba de empezar.

## Dirección

- breve;
- limpia;
- no convertirla en una cinemática larga;
- aproximadamente 3–5 segundos;
- idealmente acompañada más adelante por un golpe sonoro o inicio de música;
- después de la primera partida se puede evaluar permitir skip.

No agregar texto como "La noche comienza" si el reloj ya transmite la idea.

---

# 7. Estados principales de una run

La V1 debe distinguir claramente tres cierres.

## A. GAME OVER — 0 vidas

Si las tres chicas rechazan a Tambu y pierde sus tres corazones:

- la partida se corta;
- aparece un fondo rojo;
- mensaje grande:

# SOS UN HIJO DE PUTA

El humor está en lo abrupto y exagerado.

No agregar una explicación larga debajo.

Después aparecen:

- `REINTENTAR`
- `VOLVER AL INICIO`

La pantalla debe sentirse como castigo cómico por haber jugado absurdamente mal las conversaciones.

---

## B. PERFECT NIGHT — 3 baños

Si Tambu consigue Baño con Sofi, Mili y Cami:

- se reconoce como victoria máxima;
- aparece un mensaje especial todavía por definir;
- no expulsar al jugador del mapa obligatoriamente.

Debe existir:

- `SEGUIR DE FIESTA`

Esto habilita un estado de postgame/free roam.

---

## C. FINAL NORMAL

Si las tres chicas fueron resueltas y:

- no se perdieron todas las vidas;
- no se consiguieron los tres Baños;

se muestra un resumen de la noche.

Debe incluir al menos:

- puntaje;
- Sofi + outcome;
- Mili + outcome;
- Cami + outcome;
- opción de volver a jugar;
- opción de volver al menú.

Ejemplo conceptual:

```
LA NOCHE DE TAMBU

SOFI
Instagram

MILI
Baño

CAMI
Friendzone

PUNTOS
825

[ VOLVER A JUGAR ]
[ MENÚ PRINCIPAL ]
```

El diseño visual definitivo se resolverá después.

---

# 8. Post-win free roam

Después de conseguir los tres Baños y elegir `SEGUIR DE FIESTA`, el juego entra en un estado diferente.

Conceptualmente:

`PARTY_ACTIVE → POST_WIN_FREE_ROAM`

## Reglas

- no se pueden conseguir nuevos outcomes románticos;
- no se puede volver al baño con las chicas;
- las chicas siguen presentes;
- pueden tener callbacks sobre lo ocurrido;
- amigos pueden reaccionar a la noche;
- pueden aparecer microeventos;
- el jugador puede recorrer el mapa libremente;
- el objetivo es descubrir detalles y disfrutar el patio.

No convertir el postgame en una segunda campaña.

Debe ser una extensión ligera de la fiesta.

## Posible consecuencia interesante

Alguna chica puede enterarse de que Tambu tuvo otros Baños esa misma noche y reaccionar.

Esto debe usarse con moderación y de manera contextual.

La victoria mecánica no obliga a que narrativamente todas las relaciones terminen perfectas.

---

# 9. Resistencia del Baño — rebalance obligatorio

El minijuego actual está demasiado fácil.

Valores actuales aproximados auditados:

- resistencia inicial: 65;
- drenaje: 15/s;
- SPACE: +6;
- duración: 10 s.

Esto permite ganar con una frecuencia de pulsación demasiado baja.

## Objetivo de diseño

La experiencia debe ser:

- corta;
- frenética;
- graciosa;
- más exigente en los últimos segundos;
- no agotadora.

El jugador debería sentir que hacia el final necesita realmente presionar rápido.

Una referencia inicial para probar podría rondar:

- resistencia inicial ~50;
- drenaje ~18/s;
- SPACE +4;
- golpes más fuertes o frecuentes hacia la segunda mitad.

Estos números NO quedan congelados.

La dificultad se ajustará mediante playtest manual.

El objetivo es sensación, no una fórmula perfecta.

---

# 9.5. Bathroom Resistance — identidad narrativa por intento

Esta idea pasa a considerarse **V1 MUST HAVE dentro del BathroomEvent**, no un microevento opcional.

La Resistencia del Baño no debe sentirse como una barra abstracta con golpes anónimos.

Debe convertirse en una escena viva del grupo.

## Principio central

A medida que Tambu consigue más Baños en una misma run:

- los amigos entienden mejor qué está pasando;
- las frases cambian;
- aparecen referencias a lo sucedido antes;
- aumenta el caos;
- aumenta la presión del minijuego;
- la dificultad crece con una explicación narrativa visible.

La progresión cómica debe ser:

### Baño 1 — sorpresa

El grupo todavía está descubriendo qué pasó.

Tono:

> ¿Con quién te metiste?

> Dale hijo de puta, salí.

> Abrí, pajero.

Debe sentirse como sorpresa, curiosidad y cargada.

La dificultad es la más accesible de las tres.

---

### Baño 2 — incredulidad

El grupo ya sabe que Tambu se encerró antes con otra chica.

Ahora las frases pueden usar memoria real de la run.

Ejemplo conceptual:

> ¿OTRA VEZ?

> ¿Con quién entraste ahora?

> Pero si Sofi está afuera, hijo de puta.

> No puede ser este pajero.

Si el primer Baño fue con Sofi y el segundo es con Mili, el sistema puede mencionar a Sofi.

No generar texto dinámico con IA.

Las variantes deben escribirse a mano usando datos simples del estado de run:

- currentGirl;
- previousBathroomGirls;
- bathroomCount;
- resultados previos relevantes.

La dificultad aumenta de forma moderada.

Debe haber más presión, más golpes o intervalos menores.

---

### Baño 3 — caos absoluto

Si Tambu llega al tercer Baño, el grupo ya perdió completamente la paciencia.

Tono:

> NOOO, OTRA VEZ NO.

> ¿LA TERCERA?

> SAQUEN A ESTE TIPO DEL BAÑO.

> TAMBU HIJO DE PUTA.

> ABRÍ LA PUERTA, ANIMAL.

Las líneas exactas se escribirán más adelante personaje por personaje.

Este tercer Bathroom Resistance puede funcionar como una especie de **boss final cómico de la perfect run**.

La dificultad debe ser la mayor de las tres.

La victoria de tres Baños debe sentirse merecida después de haber sobrevivido también al grupo.

---

## Presentación — caras de los amigos

Los golpes y textos anónimos actuales deben evolucionar hacia intervenciones identificables.

Cada intervención importante debe mostrar:

- cara/retrato pixel-art del amigo;
- nombre;
- frase breve;
- timing claro.

Ejemplo conceptual:

```
[cara de Santy]
SANTY
"ABRÍ PAJERO."
```

Los retratos deben derivarse de los personajes aprobados cuando existan.

No usar cajas de diálogo gigantes.

El jugador está jugando al mismo tiempo.

La barra de resistencia siempre debe permanecer visible y legible.

Reglas:

- una o dos voces simultáneas como máximo;
- frases cortas;
- lectura instantánea;
- no cubrir el centro de gameplay;
- entrada y salida rápida de los retratos.

---

## Personalidad de cada amigo

Las líneas deben sentirse escritas para cada personaje, no como insultos intercambiables.

Dirección inicial:

- **Pitity:** mínimo de palabras, remates secos o absurdos;
- **Tobi:** directo, cortante;
- **Uriel:** social, incrédulo, intentando entender qué está pasando;
- **Thiago:** descanso personal y familiar;
- **Santy:** máxima desubicación y barbaridades;
- **Eze:** puede arrancar más racional y terminar entrando también en el caos.

Las voces definitivas se escribirán usando `CHARACTERS.md` y el lore aprobado.

---

## Golpe asociado a personaje

Cuando un amigo interviene, su aparición puede tener una respuesta física coherente.

Ejemplo:

```
Santy aparece
↓
dice una barbaridad
↓
PUM PUM PUM
↓
la resistencia recibe presión
```

Esto crea asociación entre personaje y gameplay.

El objetivo es que quien juega termine reaccionando genuinamente contra el personaje que está golpeando.

No todos los textos necesitan producir daño.

Debe existir ritmo entre:

- frase;
- anticipación;
- golpe;
- recuperación;
- siguiente intervención.

---

## Dificultad narrativa

La dificultad no debe crecer únicamente porque un número oculto se multiplica.

Debe sentirse que:

### Baño 1
poca gente afuera + golpes moderados.

### Baño 2
más gente entiende lo que pasa + mayor frecuencia/intensidad.

### Baño 3
caos grupal + intervenciones rápidas + golpes fuertes.

La progresión mecánica debe acompañar la progresión cómica.

Esto se combina con el rebalance base definido en la sección anterior.

Los valores exactos siguen sujetos a playtest.

---

## Memoria de la run

Bathroom Resistance debe poder consumir información mínima del estado de run para cambiar sus líneas.

Ejemplos:

- nombre de la primera chica;
- cantidad de Baños anteriores;
- éxito o fracaso anterior de la puerta;
- chica actual;
- orden de los Baños.

Ejemplo:

> "¿Mili ahora? Si hace diez minutos estabas con Sofi."

Esto refuerza el principio general:

> el mundo debe recordar lo que pasó.

No todas las combinaciones necesitan texto exclusivo.

Se pueden escribir pools contextuales pequeños y bien seleccionados.

---

## Chicas anteriores afuera

Se puede explorar que una chica anterior aparezca o sea mencionada durante un Bathroom Resistance posterior.

Ejemplo conceptual de tono:

> Sofi: "...ah, espectacular."

Debe usarse con moderación.

No convertir cada segundo Baño en una escena de celos obligatoria.

La reacción depende de personalidad, historial y contexto.

---

## Criterio de éxito

Esta pasada se considera lograda cuando:

- los tres Bathroom Resistance se sienten narrativamente distintos;
- los amigos son reconocibles por cara y voz;
- las frases recuerdan hechos reales de la run;
- la intensidad crece entre primer, segundo y tercer Baño;
- el texto nunca impide jugar;
- la dificultad acompaña el caos sin volverse injusta;
- perder sigue siendo gracioso;
- el tercer intento funciona como clímax cómico de una perfect run.

Esta capa de personalidad debe implementarse después de:

1. corregir rutas/depth del BathroomEvent;
2. rebalancear la dificultad base;
3. disponer de los amigos visuales necesarios o retratos aprobados.


---

# 10. Evento Santy — interrupción camino al baño

Este evento queda aprobado conceptualmente como candidato fuerte para V1.

## Fantasía

Tambu consigue que una chica acepte ir al baño.

Durante el trayecto, existe una probabilidad baja de que Santy aparezca y los interrumpa.

Santy dice una barbaridad totalmente fuera de lugar.

La caminata se detiene.

La chica reacciona.

Tambu debe resolver una situación social incómoda.

La gracia nace de que el jugador cree que ya ganó y, de repente, aparece Santy a complicarlo todo.

---

## Principios

El evento debe ser muy gracioso, pero no romper injustamente la experiencia.

La aparición puede ser aleatoria.

El resultado NO debe ser aleatorio.

El jugador debe poder salvar la situación leyendo correctamente el contexto.

---

## Estructura

Idealmente una sola decisión importante, máximo dos.

Posibles tipos de respuesta:

- seguirle la barbaridad a Santy;
- intentar callarlo desesperadamente;
- desactivar la situación con humor;
- ignorar a Santy y responder directamente a la chica.

La mejor respuesta puede depender de la chica.

### Sofi

Puede valorar naturalidad, calma y no sobreactuar.

### Mili

Puede tolerar o incluso disfrutar mejor cierto caos si Tambu lo maneja bien.

### Cami

Puede castigar especialmente una explicación desesperada o un sobrejuego evidente.

No reutilizar necesariamente attraction/trust/intensity como otra conversación completa.

Puede existir un resolver pequeño específico:

`girlId + respuesta → crisis salvada / crisis fallida`

---

## Resultado 1 — Tambu salva la situación

- la chica responde;
- Santy recibe un remate;
- continúa el camino al baño.

Debe sentirse como haber superado una segunda prueba social.

---

## Resultado 2 — Tambu la caga

- la chica se incomoda;
- cancela el trayecto;
- no llegan al baño.

Todavía queda abierta la decisión exacta de qué outcome final recibe esa situación.

No asumir automáticamente:

- Rechazo;
- −1 vida.

Como Tambu ya había ganado la conversación principal, el castigo debe diseñarse con cuidado.

---

## Reglas de frecuencia

- máximo una aparición de Santy por run;
- probabilidad baja;
- no debe ocurrir siempre;
- conversación breve;
- no debería durar más de unos 15–25 segundos;
- evitar repetir siempre la misma barbaridad;
- no convertir a Santy en un obstáculo constante.

Se puede evaluar proteger el primer Baño de una primera partida para no interferir con onboarding.

---

# 11. Cambio conceptual del outcome Baño

El evento de Santy revela una distinción importante.

Actualmente el runtime persiste el outcome Baño antes del trayecto.

Para soportar interrupciones durante el camino, conceptualmente conviene distinguir:

```
CONVERSACIÓN
      ↓
la chica acepta
      ↓
BATHROOM INTENT
      ↓
TRAYECTO
      ↓
eventos posibles
      ↓
LLEGAN AL BAÑO
      ↓
BATHROOM CONFIRMED
      ↓
RESISTENCIA DEL BAÑO
```

## Regla

Una vez que llegaron físicamente al baño:

> Baño está conseguido.

El resultado de Bathroom Resistance no debe borrar ese logro.

Eso mantiene la decisión anterior:

- éxito del minijuego → desenlace legendario;
- fracaso → desenlace caótico/humillante;
- ambos conservan el outcome social Baño.

La modificación exacta del contrato actual debe diseñarse antes de implementar Santy.

---

# 12. Microeventos recomendados

No convertir todas las ideas de la auditoría en backlog.

Elegir pocos eventos con identidad.

## Alta prioridad conceptual

### Enzo, vení

Thiago llama a Tambu "Enzo" por una boludez.

Dos líneas.

Sin misión.

Sirve para mostrar relación real entre amigos.

---

### No lo digas más fuerte

Santy empieza a decir una barbaridad dentro del grupo y Tobi/Tambu lo corta.

Evento corto.

Refuerza el contraste entre humor privado y contexto social.

---

### Una fila menos en el Excel

Callback de Cami condicionado a lo que realmente ocurrió en su conversación.

Hace que el mundo recuerde una elección.

---

### El vaso que nadie pidió

El bartender termina una acción y aparece un pequeño gag alrededor de un pedido que nadie reconoce.

Usa infraestructura ya existente.

---

### La puerta quedó famosa

Después del primer Bathroom Resistance, un amigo comenta en privado si Tambu aguantó o si la puerta cedió.

Hace que ganar o perder el minijuego deje consecuencias narrativas.

---

### Todos conocen ese tema

Cuando exista música, un tema concreto provoca una reacción breve de dos grupos.

No todo el patio.

Objetivo: que durante unos segundos parezca realmente una fiesta compartida.

---

### Última vuelta por el patio

En el final de la noche, un amigo recuerda algo específico de esa run.

Ayuda a que el cierre se sienta personal.

---

# 13. Filosofía de eventos

Los eventos no deben ser solamente decoración.

Algunos deben funcionar como pequeñas situaciones sociales que:

- recuerdan elecciones;
- reaccionan a outcomes;
- muestran personalidad;
- ponen a Tambu en situaciones incómodas;
- hacen que dos runs no sean idénticas.

La sorpresa debe vivir en la fiesta.

No randomizar thresholds sociales ni hacer que una respuesta coherente falle arbitrariamente.

El jugador debe poder aprender a leer a las personas.

---

# 14. El mundo debe recordar lo que pasó

Uno de los mayores aprendizajes de la auditoría:

Actualmente el juego sabe muchas cosas internamente, pero el patio muestra pocas consecuencias.

Debemos aprovechar:

- history;
- signals;
- outcomes;
- Bathroom Resistance;
- decisiones concretas;

para crear callbacks pequeños.

Ejemplos:

- Sofi recuerda el informe;
- Cami recuerda el Excel;
- un amigo comenta un Baño;
- alguien recuerda el fracaso de la puerta;
- una chica reacciona a descubrir otros Baños;
- el resumen final recuerda un momento de la run.

Esto da mayor sensación de mundo vivo con poco sistema nuevo.

---

# 14.5. Post-outcome character state — las chicas siguen en la fiesta

Esta idea pasa a considerarse **parte importante de la V1**.

Actualmente, después de resolver el arco principal de una chica, el runtime deja de permitir interacción principal y, en BathroomEvent, la chica puede quedar oculta al finalizar.

La dirección aprobada es distinta:

> resolver una chica no significa que desaparezca del mundo.

Su conversación principal termina, pero ella sigue formando parte de la fiesta.

---

## Estados conceptuales

Cada chica debe poder pasar de:

```
ACTIVE
→ conversación principal disponible
```

a:

```
RESOLVED
→ conversación principal cerrada
→ sigue presente en el patio
→ puede reaccionar
→ puede moverse entre puntos sociales seguros
```

Esto aplica a todos los outcomes:

- Baño;
- Instagram;
- Friendzone;
- Rechazo.

La resolución cierra el arco principal, no la existencia del personaje.

---

## BathroomEvent — entrada y salida física

El BathroomEvent debe dejar de sentirse como una desaparición/reaparición mágica.

Flujo conceptual deseado:

```
approach
→ enter
→ bathroom
→ resistance
→ resolution
→ exit
→ aftermath
```

### Entrada

Tambu y la chica deben:

- llegar al acceso real;
- ejecutar una pequeña transición de entrada;
- desaparecer detrás/desde el umbral de forma intencional.

No ocultarlos demasiado pronto.

### Salida

Al terminar el evento:

- salen Tambu y la chica;
- no reaparece solo Tambu;
- ambos aparecen desde el baño;
- hacen una transición corta de salida;
- caminan unos pasos hasta posiciones seguras;
- recién entonces vuelve el control normal.

No hace falta una cinemática larga.

Puede resolverse con:

- walk controlado;
- 3–5 frames específicos;
- ocultamiento detrás del plano de puerta;
- una combinación simple de estas técnicas.

---

## Safe exit — corregir la salida defectuosa

El runtime actual puede restaurar a Tambu en una posición donde atraviesa visualmente la barra/colisión antes de que la física normal vuelva a ordenar el movimiento.

Esto debe corregirse.

No restaurar al jugador directamente encima de colliders.

Definir uno o más:

`safeExitPoints`

frente al baño.

BathroomEvent se considera terminado únicamente cuando:

- Tambu llegó a un punto seguro;
- la chica llegó a su punto de salida;
- ambos tienen depth correcto;
- las físicas normales pueden reactivarse sin atravesar geometría.

---

## Aftermath inmediato

Después de salir del baño puede existir una reacción breve entre Tambu y la chica.

Ejemplos conceptuales:

### Resistencia ganada

> Mili: "¿Siempre son así?"

### Resistencia perdida

> Cami: "Tus amigos son un caso clínico."

Estas líneas no son copy definitivo.

La función es conectar:

- minijuego;
- personaje;
- resultado;
- regreso al patio.

No abrir otra conversación completa.

---

# 14.6. Post-outcome reactions

Una chica resuelta puede seguir siendo interactuable.

La interacción cambia de propósito.

## Antes de resolver

```
E
→ conversación principal
→ decisiones
→ stats
→ Consejo
→ outcome
```

## Después de resolver

```
E
→ reacción breve
→ una o pocas líneas
→ sin decisiones
→ sin stats
→ sin Consejo
→ sin nuevo outcome
```

El prompt puede seguir siendo:

`E · HABLAR CON <NOMBRE>`

pero el marker visual debe diferenciar conversación principal de reacción posterior.

Se puede evaluar:

- quitar el `!`;
- usar un indicador más discreto;
- o no mostrar marker y dejar solo prompt por proximidad.

No mantener una señal visual que prometa contenido principal ya agotado.

---

## Reacción según outcome

Cada chica puede tener pools pequeños de reacciones según su resultado.

### Baño

Tono posible:

- cómplice;
- coqueto;
- incómodo;
- irónico;
- seco;

según personalidad.

### Instagram

Interés ligero o continuidad social.

### Friendzone

La relación puede seguir siendo amable.

No tratar Friendzone como desaparición del personaje.

### Rechazo

Puede existir incomodidad, sequedad o humor.

Volver a hablar con una chica que te rechazó puede ser contenido gracioso.

El fracaso también debe producir mundo, no vacío.

---

## Reacción según contexto de run

Las reacciones pueden tener variantes usando información ya existente:

- outcome;
- history;
- signals;
- bathroomHistory;
- eventos ocurridos;
- resultado previo de Bathroom Resistance.

Conceptualmente:

```
character
+ outcome
+ relevantContext
→ shortReaction
```

No convertir esto en otra conversación de cuatro beats.

Una línea correcta de tres segundos puede aportar más vida que otra animación compleja.

---

# 14.7. Conocimiento contextual — las chicas no son omniscientes

El gameState puede saber que algo ocurrió.

Eso NO significa que todos los personajes lo sepan automáticamente.

Separar conceptualmente:

> el juego sabe

de:

> el personaje sabe.

Una chica puede enterarse de otro Baño solo si existe una razón plausible.

Ejemplos:

- estaba cerca cuando salieron;
- los amigos hicieron suficiente escándalo;
- alguien comentó el hecho;
- ocurrió un microevento relacionado;
- el segundo/tercer Bathroom Resistance volvió el hecho imposible de ocultar.

No construir un sistema complejo de simulación de rumores.

Flags simples alcanzan para V1.

Ejemplo conceptual:

`knowsAboutOtherBathroom = true / false`

o un set pequeño de hechos conocidos.

Esto permite reacciones más naturales:

> "...Mili también? Mirá vos."

sin hacer que todas las chicas sepan todo mágicamente.

---

# 14.8. Social roaming — seguir con la fiesta sin parecer robots

Después de resolverse, una chica no debe volver obligatoriamente a su posición original exacta.

Eso se siente robótico.

Tampoco hace falta implementar IA libre o pathfinding general.

La dirección recomendada es **controlled social roaming**.

Cada chica tiene una lista pequeña de anchors seguros.

Ejemplo conceptual:

### Sofi
- barra tranquila;
- lateral de pileta;
- deck.

### Mili
- zona de baile;
- barra;
- grupo cercano a pileta.

### Cami
- sector derecho;
- barra;
- deck.

Después de resolver su arco:

1. sale de la situación;
2. elige un anchor válido;
3. camina usando su walk real;
4. queda en idle;
5. después de una pausa larga puede cambiar a otro anchor.

No hacer movimiento constante.

La sensación buscada es:

> siguió con su noche.

Ejemplo de ritmo:

- 30–60 segundos quieta;
- cambio ocasional de zona;
- pausa larga;
- otro cambio si corresponde.

No:

> izquierda → derecha → izquierda cada pocos segundos.

---

## Restricciones del roaming

- no cruzar piscina/barra/colliders;
- no bloquear accesos;
- no superponerse con otra chica;
- no interrumpir conversaciones;
- no moverse durante BathroomEvent;
- no moverse durante escenas críticas;
- solo usar destinos previamente aprobados.

No hace falta navegación general para V1.

---

# 14.9. Integración con post-win free roam

Este sistema es especialmente importante después de conseguir los tres Baños y elegir:

`SEGUIR DE FIESTA`

En ese estado:

- las conversaciones principales ya están cerradas;
- las chicas siguen presentes;
- pueden reaccionar;
- pueden haberse enterado de otros hechos;
- pueden cambiar de zona;
- los amigos comentan la run;
- aparecen microeventos;
- el patio sigue vivo.

Esto evita que el postgame sea caminar por un mapa vacío después de completar todo.

La fantasía pasa a ser:

> la fiesta continúa después del desastre que acabás de provocar.

---

# 14.10. Criterios de aceptación conceptuales

Esta capa se considera lograda cuando:

- ninguna chica desaparece injustificadamente después de resolver su arco;
- BathroomEvent devuelve a Tambu y a la chica al mundo;
- entrada/salida del baño no se siente como teletransporte;
- Tambu no reaparece atravesando barra/colliders;
- cada chica puede seguir existiendo en el patio;
- las interacciones post-outcome son breves y contextuales;
- no reabren stats ni outcome;
- el movimiento posterior parece natural sin IA compleja;
- el personaje puede recordar consecuencias reales de la run;
- no todos conocen mágicamente todo;
- el post-win free roam tiene contenido humano real.


---

# 15. Arquitectura — decisión

La arquitectura actual es suficiente para V1.

No hacer:

- ECS;
- TypeScript global;
- event bus universal;
- framework de quests;
- state machine universal para todos los NPCs.

## Posible abstracción al integrar Cami

Sofi y Mili ya duplican algunos contratos:

- dirección;
- walk;
- idle;
- depth;
- timers;
- listeners.

Si Cami repite esos mismos patrones, evaluar un adapter pequeño:

```
walkTo()
idle()
updateDepth()
dispose()
```

BathroomEvent podría trabajar con capacidades en vez de branches por nombre.

No generalizar:

- personalidad;
- animaciones;
- timings visuales;
- frame maps;
- special idles;
- narrativa.

---

# 16. Visual masters — regla de producción

Queda reforzada como política de producción.

Los sprites runtime pequeños NO son fuente visual principal.

Flujo:

1. referencia grande clara;
2. aprobación visual;
3. master literal;
4. normalización al atlas runtime;
5. integración;
6. QA visual manual.

Se recomienda versionar masters aprobados.

Estructura sugerida:

```
docs/references/characters/
  sofi/
    README.md
    sofi_visual_master_v01.png

  mili/
    README.md
    mili_visual_master_v01.png

  cami/
    README.md
    cami_visual_master_v01.png
```

Cada README debería guardar:

- master aprobado;
- fecha/versión;
- atlas derivado;
- frame size;
- grid;
- orden;
- neutral;
- escala;
- origin/pies;
- animaciones autorizadas;
- restricciones.

No guardar exploraciones descartadas innecesarias.

---

# 17. Workflow recomendado

Mantener:

```
Game Director
    ↓
referencia visual / diseño
    ↓
Art Director / Asset Studio
    ↓
Integration Engineer
    ↓
QA visual manual de Eze
```

## Reglas

### Dirección

Define:

- intención;
- función;
- límites;
- criterios observables.

### Producción visual

Entrega:

- master claro;
- atlas exacto;
- contrato técnico.

### Integración

- no rediseña;
- no inventa arte;
- no abre scope;
- valida código/tests/build;
- no hace QA visual mediante navegador.

### Eze

Valida:

- escala;
- ritmo;
- lectura;
- humor;
- resultado visual.

---

# 18. Definition of Done conceptual para V1

Tambu V1 puede considerarse completa cuando:

- existe menú inicial;
- existe intro de llegada;
- la noche puede jugarse de principio a fin;
- las tres chicas tienen presentación visual final suficiente;
- sus conversaciones son coherentes;
- BathroomEvent funciona desde las tres posiciones;
- Bathroom Resistance tiene dificultad adecuada;
- existe derrota por cero vidas;
- existe victoria máxima por tres Baños;
- existe final normal;
- existe resumen;
- existe restart limpio;
- amigos principales son reconocibles;
- fillers ya no rompen visualmente el mapa;
- existe audio mínimo;
- hay una pequeña selección de eventos memorables;
- UI comunica bien controles, outcomes y cierre;
- dos runs consecutivas funcionan sin arrastrar estado;
- la experiencia fue validada manualmente con amigos.

La V1 NO necesita:

- otros mapas;
- más chicas;
- campaña;
- alcohol profundo;
- guardado;
- mobile;
- mundo abierto;
- simulación compleja de NPCs.

---

# 19. Próximo milestone

## FIRST COMPLETE NIGHT

Orden recomendado después de completar Cami:

1. corregir BathroomEvent y coherencia social;
2. implementar intro `00:00 → 00:01`;
3. definir estado de run;
4. implementar derrota por 0 vidas;
5. implementar victoria máxima por 3 Baños;
6. implementar final normal y resumen;
7. implementar restart limpio;
8. rebalancear Bathroom Resistance;
9. playtest completo;
10. recién después ampliar vida ambiental y eventos.

Cuando este milestone exista, el juego debe poder entregarse a un amigo con una instrucción simple:

> Jugá una partida.

Y esa persona debe poder empezar, jugar, ganar o perder, ver un final y volver a intentarlo sin explicación del desarrollo.

---

# 20. Preguntas abiertas

Estas decisiones todavía no quedan congeladas:

- mensaje exacto de la victoria de 3 Baños;
- outcome exacto si Santy arruina el trayecto;
- si el primer Baño de la primera run queda protegido de Santy;
- regla exacta de vidas si se agregan futuros outcomes;
- balance final de Bathroom Resistance;
- cantidad exacta de eventos por run;
- qué callbacks aparecen en post-win;
- diseño visual del menú;
- diseño visual del resumen;
- si alcohol entra de forma mínima o se retira del HUD para V1.

Estas preguntas deben resolverse mediante diseño/playtest, no asumirlas automáticamente en integración.
