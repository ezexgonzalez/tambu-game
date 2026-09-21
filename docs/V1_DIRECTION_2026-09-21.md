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
