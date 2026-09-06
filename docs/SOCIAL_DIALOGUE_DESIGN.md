# Tambu Game — Social Dialogue Design

Documento vivo para registrar decisiones de diseño narrativo y social antes de implementarlas.

## Objetivo del sistema

Las conversaciones no deben funcionar como un árbol de "respuesta correcta / respuesta incorrecta". El jugador tiene que leer a la persona, interpretar el momento y decidir cuánto avanzar.

Estados sociales base:

- **Attraction**: interés romántico/sexual.
- **Trust**: comodidad, confianza y buena impresión.
- **Intensity**: cuánto está empujando Tambu la interacción.

Los valores son internos. El jugador no debe ver números ni barras, salvo eventualmente en debug.

Una conversación puede ir muy bien en términos de confianza y aun terminar en friendzone si Tambu nunca genera intención romántica. Del mismo modo, una respuesta arriesgada puede funcionar si el contexto ya la sostiene.

## Principio central

> Que la charla vaya bien no significa necesariamente que Tambu esté levantando.

El sistema debe premiar lectura social y timing, no memorizar opciones.

---

# Identidad adulta y humor del grupo

Tambu Game es un juego privado para adultos basado en la dinámica real y absurda del grupo.

Regla tonal aproximada:

- **75% conversación creíble**.
- **25% absurdo, intensidad, desubicación, humor interno o contenido adulto**.

No convertir todas las respuestas en chistes. Si todo es absurdo, nada sorprende.

El juego no debe autocensurar artificialmente el lenguaje del grupo. Puede haber comentarios fuertes, vulgares, sexuales, negros o desubicados cuando correspondan a la persona y al momento. La gracia está en que suenen auténticos, tengan timing y no aparezcan porque sí.

Las barbaridades privadas del grupo no implican que todos hablen así delante de una chica. El contexto social importa.

---

# Canon de Tambu relevante al diálogo

- Tambu **ya es Licenciado en Psicopedagogía**.
- No usar líneas antiguas como "me queda la tesis" o "estoy terminando la carrera".
- Puede usar Psicopedagogía como recurso humorístico y llevarla a lugares donde nadie se la pidió.
- A veces se refiere a sí mismo como **"papi"**, pero debe usarse poco.
- "Papi" es un recurso, no una catchphrase obligatoria.

Línea canon para Sofi:

> **"Sí, soy yo, te habla papi."**

---

# Regla de diseño de opciones

Cada opción debe hacer **algo socialmente diferente**, no ser la misma respuesta reescrita con otro tono.

Las intenciones posibles incluyen:

- humor;
- misterio;
- vulnerabilidad;
- seguridad;
- coqueteo;
- sinceridad;
- apertura;
- prudencia;
- desafío/juego;
- Tambu sin filtro.

No fijar siempre una intención al mismo número. El jugador no debe poder aprender que "2 = coqueteo" o "3 = amistad".

La opción 4 suele representar **Tambu sin filtro**, pero no es automáticamente meme ni mala. Puede ser:

- ego absurdo;
- intensidad romántica rápida;
- sinceridad excesiva;
- comentario adulto/desubicado;
- Psicopedagogía fuera de lugar;
- confianza injustificada;
- vulnerabilidad inesperada;
- romanticismo exagerado;
- humor interno sin contexto.

---

# Estructura de ramificación

Las conversaciones deben sentirse continuas, no como:

> Sofi pregunta → Tambu responde → nueva pregunta desconectada.

La estructura base es:

> NPC dice algo → Tambu responde → reacción propia → pequeño intercambio/puente → siguiente beat.

## Niveles de branch

### 1. Micro-branch — mayoría de respuestas

Cada opción tiene reacción propia y un pequeño intercambio propio. Después converge.

### 2. Branch contextual — algunas respuestas

La elección cambia el puente hacia el siguiente tema o incluso la formulación del siguiente beat.

### 3. Branch persistente — pocas decisiones

Una decisión fuerte puede cambiar la ruta durante varios beats o empujar directamente a un outcome.

Proporción orientativa:

- 70% micro-branches;
- 25% branches contextuales;
- 5% branches persistentes.

No crear un árbol exponencial de 4 → 16 → 64 → 256 opciones. La conversación debe reconocer lo que pasó y volver a converger cuando tenga sentido.

---

# Historial narrativo y señales

La conversación debe guardar más que stats.

Ejemplo conceptual:

```js
history: [
  { beat: 1, choice: 4 },
  { beat: 2, choice: 3 }
]
```

También pueden existir señales semánticas derivadas de lo ocurrido, por ejemplo:

```js
signals: [
  'sofi_played_along_with_papi',
  'sofi_returned_flirt',
  'tambu_playing_too_safe'
]
```

Estas señales sirven para:

- reacciones contextuales;
- puentes narrativos;
- outcomes;
- El Consejo;
- referencias posteriores a cosas concretas que Tambu dijo.

La misma respuesta puede funcionar o fracasar dependiendo del historial, stats y tono construido.

---

# Sofi — concepto social

Sofi es tranquila, observadora, amable y tiene humor seco. No es tímida.

## Lo que valora

- naturalidad;
- humor tranquilo;
- escucha;
- seguridad sin exhibición;
- intención clara cuando llega el momento.

## Lo que castiga

- intentar impresionar demasiado;
- intensidad temprana;
- respuestas demasiado estudiadas;
- buscar aprobación constantemente;
- confundir su amabilidad con atracción.

## Mecánica narrativa de Sofi

> **El peligro con Sofi es confundir comodidad con interés.**

Sofi puede reírse, hacer preguntas y sostener una conversación aunque solo vea a Tambu como alguien agradable.

Una ruta con mucha Trust y poca Attraction debe poder sentirse exitosa hasta revelar finalmente:

**💀 FRIENDZONE**

Esto es intencional.

---

# Sofi V5 — base narrativa congelada

Esta es la versión narrativa aprobada como base para implementación. El wording puede recibir microajustes al playtest, pero no cambiar su estructura sin una razón clara.

La conversación tiene **4 beats conectados**.

## Beat 1 — Reputación / primera impresión

**SOFI**

> —Vos sos Tambu, ¿no? Escuché tu nombre como tres veces desde que llegué.

### Opción 1 — misterio

> **Tambu:** —Depende. ¿Qué versión te llegó?

Reacción sugerida:

> **Sofi:** —¿Hay más de una?
>
> **Tambu:** —Siempre.
>
> **Sofi:** —Bueno, por ahora ninguna demasiado grave.

### Opción 2 — humor sobre el grupo

> **Tambu:** —Sí. ¿Quién está haciendo prensa por mí?

Reacción sugerida:

> **Sofi:** —No sé si prensa. Pero tu nombre circula bastante.
>
> **Tambu:** —Excelente, marketing orgánico.

### Opción 3 — genuino/autoconsciente

> **Tambu:** —Sí, soy yo. Espero no decepcionar.

Reacción sugerida:

> **Sofi:** —Todavía tenés tiempo.
>
> **Tambu:** —Perfecto, llegué con margen.

### Opción 4 — Tambu sin filtro / ego absurdo

> **Tambu:** —Sí, soy yo, te habla papi.

Reacción canon:

> **Sofi:** —¿Te habla quién?
>
> **Tambu:** —Papi.
>
> **Sofi:** —No podés presentarte así.
>
> **Tambu:** —Pero ya lo hice.

Sofi se ríe.

### Puente al Beat 2

La charla queda naturalmente hablando de la reputación de Tambu.

> **Sofi:** —Igual me habían dicho que eras el tranquilo del grupo. Me parece que exageraron un poco.

---

# Beat 2 — El tranquilo del grupo

### Opción 1 — humor seco

> **Tambu:** —Es que los dejo cansarse solos.

Reacción sugerida:

> **Sofi:** —Estrategia inteligente.
>
> **Tambu:** —Sobreviví bastante así.

El puente debe llevar naturalmente a que Sofi note que Tambu observa bastante y aparezca Psicopedagogía.

### Opción 2 — vulnerabilidad

> **Tambu:** —Con gente que no conozco arranco bastante lento.

Reacción sugerida:

> **Sofi:** —¿Y ya dejé de ser gente que no conocés?

La charla se vuelve un poco más personal. El puente lleva a cómo Tambu piensa/observa y luego a Psicopedagogía.

### Opción 3 — seguridad / coqueteo

> **Tambu:** —No soy tranquilo. Soy selectivo.

Reacción sugerida:

> **Sofi:** —Ah, mirá. ¿Y pasé la selección?

Esta línea de Sofi es una señal importante: **Sofi devuelve el juego**.

El puente puede hacer que Tambu explique que suele observar bastante y mencionar que es Licenciado en Psicopedagogía.

### Opción 4 — Tambu sin filtro / psicopedagogo delirante

> **Tambu:** —Estoy tranquilo porque ya analicé psicológicamente a todos los que están acá.

Reacción sugerida:

> **Sofi:** —¿A todos?
>
> **Tambu:** —A vos todavía te estoy cerrando.
>
> **Sofi:** —Ah, buenísimo. Cero presión.
>
> **Tambu:** —Después te paso el informe.
>
> **Sofi:** —No, gracias.

Después:

> **Sofi:** —Pará... ¿vos estudiás algo de eso de verdad o estás diciendo pelotudeces?
>
> **Tambu:** —Soy Licenciado en Psicopedagogía.
>
> **Sofi:** —Eso hace que todo esto sea un poco más preocupante.
>
> **Tambu:** —Al contrario. Ahora está respaldado académicamente.

### Convergencia al Beat 3

Las cuatro rutas deben llegar de forma coherente al mismo tema, no usar un texto que asuma que Tambu mencionó Psicopedagogía si no ocurrió.

Pregunta de convergencia:

> **Sofi:** —¿Y siempre analizás tanto a la gente?

---

# Beat 3 — Analizar demasiado / interés

### Opción 1 — genuino

> **Tambu:** —A veces. Es medio automático ya.

Reacción sugerida:

> **Sofi:** —Debe ser agotador.
>
> **Tambu:** —Más para los demás que para mí.

### Opción 2 — coqueteo directo

> **Tambu:** —Solo cuando alguien me interesa.

Reacción sugerida:

> **Sofi:** —Ah...
>
> —Qué conveniente.

Esta respuesta marca intención sin necesidad de decir explícitamente "me gustás".

### Opción 3 — autocrítica / vulnerabilidad

> **Tambu:** —Intento no hacerlo. Después termino flasheando cosas que capaz ni existen.

Reacción sugerida:

> **Sofi:** —Por lo menos sos consciente.
>
> **Tambu:** —A veces demasiado.

Puede construir mucha Trust sin generar necesariamente la misma Attraction que el coqueteo directo.

### Opción 4 — Tambu sin filtro / diagnóstico

> **Tambu:** —Con vos ya tengo diagnóstico.

Reacción sugerida:

> **Sofi:** —A ver.
>
> **Tambu:** —No puedo revelarlo. Secreto profesional.
>
> **Sofi:** —Qué conveniente tu carrera.

### Puente contextual al Beat 4

La formulación de Sofi debe poder reconocer qué respondió Tambu.

Ejemplos:

- si fue genuino: Sofi nota que igual está bastante pendiente de ella;
- si fue coqueteo directo: Sofi puede devolver "bueno, entonces te la hago fácil...";
- si fue vulnerable: Sofi puede pasar a una pregunta más directa antes de que Tambu siga pensando demasiado;
- si fue diagnóstico: Sofi puede llamarlo "señor profesional" o hacer referencia al chiste.

---

# Beat 4 — La intención real

La pregunta base es:

> **Sofi:** —Bueno... ¿viniste a hablarme porque te caí bien o porque te gusté?

La línea exacta puede variar según el Beat 3 para mantener continuidad.

### Opción 1 — directo / seguro

> **Tambu:** —Me gustaste y después me caíste bien. En ese orden.

Reacción sugerida:

> **Sofi:** —Ah, bueno. Clarito.

Intención: mostrar interés sin dar demasiadas vueltas.

### Opción 2 — natural / romántico sin forzar

> **Tambu:** —Al principio vine porque estabas acá. Después me dieron ganas de quedarme.

Reacción sugerida:

> **Sofi:** —Esa respuesta estuvo bastante bien.
>
> **Tambu:** —No estaba preparada.

Intención: una respuesta más romántica, pero desde algo ocurrido durante la charla.

### Opción 3 — sincero / abierto

> **Tambu:** —No sabía muy bien qué quería cuando vine. Ahora quiero seguir hablando con vos.

Reacción sugerida:

> **Sofi:** —Bueno... eso te lo compro.

Intención: apertura genuina sin sobreactuar ni negar interés.

### Opción 4 — Tambu sin filtro / sinceridad desubicada

> **Tambu:** —La verdad quería ver si terminábamos chapando, pero estoy intentando desarrollar una personalidad primero.

Esta respuesta debe ser **fuertemente contextual**.

#### Si ya hay química

Sofi puede reírse y seguir el juego.

Ejemplo:

> **Sofi:** —¿Ese era todo el plan?
>
> **Tambu:** —Fue evolucionando.
>
> **Sofi:** —Menos mal.
>
> **Tambu:** —Todavía estamos a tiempo de volver al original.
>
> **Sofi:** —No te agrandes.

#### Si venían en modo amistad

Puede generar sorpresa y confirmar que Tambu interpretó de más.

#### Si Tambu ya venía demasiado intenso

Puede provocar rechazo.

La misma línea no debe tener siempre la misma reacción.

---

# Outcomes de Sofi

Outcomes objetivo:

- ❤️ **Cita**
- 📱 **Instagram**
- 💀 **Friendzone**
- 👋 **Rechazo**

El cálculo final debe considerar:

- Attraction;
- Trust;
- Intensity;
- historial;
- señales narrativas relevantes.

No cerrar todavía thresholds definitivos como canon narrativo. Deben balancearse después de enumerar rutas y playtestear.

## Friendzone bien diseñada

La ruta friendzone no debe sentirse como una sucesión de errores obvios.

Una ruta muy prudente puede generar:

- mucha comodidad;
- mucha Trust;
- poca Attraction;
- casi nada de Intensity.

Sofi puede reaccionar positivamente durante toda la charla.

Resultado posible:

> **Sofi:** —Sos re buena onda, Tambu. Me caíste muy bien.

**💀 FRIENDZONE**

El juego NO debe transmitir:

> ser amable = friendzone
>
> ser arrogante = atracción

La combinación buscada es:

> **confianza + personalidad + intención + timing**

---

# EL CONSEJO — sistema

El Consejo no es un solucionador de respuestas.

> **El Consejo interpreta o entretiene. No resuelve.**

Una consulta nunca debe ser vacía, incluso cuando todavía no hay suficiente evidencia social. Puede aportar una lectura, humor o una observación concreta con la voz del amigo; no debe inventar interés romántico para justificar una consulta temprana.

Los callbacks priorizan lo que acaba de pasar. Las condiciones `latestSignals` consultan las señales emitidas por la última elección del historial, no las señales acumuladas de toda la conversación. Las lecturas generales quedan como respaldo. El exceso puede hacer que Eze o Tobi frenen a Tambu, y los veredictos especiales de Pitity conservan sus condiciones y prioridad. La variación dentro de cada pool sigue siendo determinística por contexto.

Los amigos reciben información de la situación y la interpretan según su propia personalidad.

Conceptualmente:

```text
historial + stats + señales + beat actual
                ↓
        situación social actual
                ↓
    Pitity / Eze / Tobi interpretan
```

El jugador jamás debe ver mensajes como:

- "Attraction alta";
- "Intensity 14";
- "elegí la opción 2".

Los amigos hablan como amigos mirando la situación desde la fiesta.

## Uso en Sofi

Para el primer slice:

- disponible desde Beat 2;
- **1 consulta por conversación**;
- el jugador elige entre Pitity, Eze o Tobi;
- no cambia stats;
- puede usar historial y señales concretas;
- una vez usado queda marcado como utilizado para esa conversación.

No convertirlo en una interrupción constante.

---

# Arquitectura conceptual de El Consejo

Separar:

1. **lectura objetiva de la situación**;
2. **interpretación/personaje del consejero**;
3. **selección de línea concreta**.

Ejemplo de lectura interna:

```text
Sofi está cómoda
Attraction alta
Intensity moderada
Sofi devolvió un coqueteo
Tambu ya mostró intención
```

Pitity, Eze y Tobi reciben esa misma situación, pero no hablan igual.

La lógica no debe ser un único bloque de `if attraction > X`.

También debe usar eventos del historial.

Ejemplo:

```text
signal: sofi_played_along_with_papi
```

Eso permite comentarios como:

> "Lo de papi funcionó de pedo. No abuses."

En lugar de una frase genérica sobre atracción.

---

# Regla anti-repetición del Consejo

Las frases icónicas son **remates especiales**, no respuestas por defecto.

Cada consejero debe tener pools de líneas posibles para una misma lectura.

La selección debería contemplar:

- condición/contexto;
- prioridad;
- historial reciente;
- cooldown de repetición;
- rareza de la frase.

Cuanto más icónica sea una línea, menos debe repetirse.

Esto también aplica a Tambu (`papi`, Psicopedagogía, etc.).

---

# PITITY — canon actual

Pitity habla poco. No explica de más.

Sus tres lecturas icónicas son:

## La cosa viene bien

> **Pitity:** —Parece bastante EZ.

## Atracción realmente fuerte

> **Pitity:** —Optimus.

Nada más.

`Optimus` debe ser raro y preferentemente requerir una señal narrativa fuerte además de stats altos, por ejemplo Sofi devolviendo claramente un coqueteo.

## Pinta friendzone / situación complicada

> **Pitity:** —Y la verdad que está bastante hard.

Nada más.

No convertir estas frases en spam. Pitity también puede tener respuestas más mínimas/neutras en otros estados.

---

# EZE — canon actual

Eze observa bastante bien las señales, pero puede sobreanalizar.

No debe sonar como terapeuta ni como una IA leyendo stats. Habla como parte del grupo.

## Frases y lenguaje propios

Para una chica muy linda puede decir:

> —Es un avión.

> —Tremendo camión.

> —Es un chiche.

Cuando cree que una chica realmente puede ser **la indicada para Tambu**, puede usar:

> —Es una princesa.

`Es una princesa` debe ser más rara y tener más peso que simplemente decir que es muy linda.

## Lecturas típicas

Cuando Sofi devuelve juego:

> —Esa te la dejó picando bastante.

> —Ojo que ahí hubo algo.

> —Te está dando bola.

Cuando Tambu está jugando demasiado seguro:

> —La charla está buena, pero estás jugando demasiado de amigo.

> —Está cómoda, sí. Pero no significa necesariamente que te esté dando bola.

> —En algún momento acordate de que te gusta.

Cuando una locura funcionó:

> —Lo de papi funcionó de pedo. No abuses.

Cuando Tambu pregunta por una señal ambigua, Eze puede dudar y sobreanalizar en vez de fingir certeza.

## Alcohol y tono sexual — futuro

Cuando Eze está serio/sobrio puede leer la situación con bastante fineza.

Cuando está en modo joda, y especialmente con alcohol, puede llevar conversaciones privadas con Tambu o el grupo hacia lo sexual y volverse más desubicado.

Esto NO significa que queme a Tambu delante de la chica. Su versión más sexual/desubicada ocurre principalmente dentro del grupo.

La degradación del filtro de Eze con alcohol es una dirección futura y no se implementa todavía en Slice 0.1.

---

# TOBI — canon actual

Tobi desprecia el sobreanálisis y empuja a Tambu a actuar cuando cree que la situación es obvia.

No usar una sola catchphrase todo el tiempo.

## Recursos propios

### "¿Sos pelotudo?"

Se usa cuando Tambu:

- no ve algo que Tobi considera obvio;
- duda demasiado;
- interpreta una señal de manera ridícula;
- pregunta algo que para Tobi no necesita análisis.

Ejemplos:

> —¿Sos pelotudo? Te está hablando bien. Hacé algo.

> —¿Sos pelotudo? ¿Entonces para qué viniste a hablarle?

### "Nao, nao..."

Tobi menea la cabeza de lado a lado y dice **"Nao, nao..."** como agregado a otra frase.

No debe quedar como línea solitaria.

Ejemplos:

> —Nao, nao... ¿sos pelotudo? No dijo eso.

> —Nao, nao... ya estás inventando cualquier cosa. Seguí hablando normal.

> —Nao, nao... ya está. No digas más nada.

## Otros remates ya compatibles con su personalidad

- "Andá, cagón."
- "Hacelo."
- "Hacé algo."
- "¿Qué estás esperando?"
- "Ya está."
- "Callate la boca."

Tobi no siempre debe empujar más intensidad. Si Tambu ya se está pasando, puede ser justamente quien le diga que se calle y no arruine algo que venía funcionando.

---

# Los otros miembros del Consejo

Thiago, Uriel y Santygamer quedan **deferidos**.

Hay ideas previas útiles, pero todavía necesitan correcciones de personalidad, vocabulario y timing antes de considerarlas canon.

No implementar sus voces definitivas hasta hacer esa pasada.

---

# Alcohol — dirección futura

El alcohol puede degradar el conjunto de opciones de Tambu en lugar de limitarse a modificar estadísticas.

Concepto:

### Sobrio

- 3 opciones controladas;
- 1 opción Tambu sin filtro.

### Alcohol medio

- 2 opciones controladas;
- 2 opciones dudosas.

### Alcohol alto

Tambu empieza a perder alternativas razonables.

El alcohol también puede alterar el filtro de ciertos consejeros, especialmente Eze.

No implementar todavía alcohol en el slice de Sofi.

---

# Contrato de implementación para Work

La implementación de Sofi + Consejo debe respetar estos principios:

1. **Data-driven**: no meter lógica narrativa específica de Sofi directamente dentro de `PatioScene`.
2. `PatioScene` sigue siendo coordinadora, no vuelve a concentrar sistemas.
3. Cada beat debe poder definir:
   - prompt del NPC;
   - opciones;
   - intención conceptual;
   - reacción propia;
   - efectos sociales;
   - señales emitidas;
   - puente/transición;
   - próximo beat.
4. El sistema debe guardar `history` y `signals` durante la sesión.
5. Las reacciones y puentes pueden depender de estado previo.
6. El Consejo recibe un snapshot de:
   - beat actual;
   - stats temporales;
   - history;
   - signals.
7. Separar la lectura objetiva de la situación de la voz de Pitity/Eze/Tobi.
8. El Consejo no revela stats ni opciones correctas.
9. Implementar una consulta por conversación, desde Beat 2.
10. Implementar anti-repetición/pools de líneas de forma extensible, sin sobrearquitectura.
11. Mantener Atracción / Trust / Intensity ocultas al jugador.
12. No implementar alcohol todavía.
13. No implementar todavía voces definitivas de Thiago, Uriel o Santygamer.
14. No modificar mapa, Tambu visual, NPC art ni arquitectura modular fuera de lo necesario.
15. Mantener tests del resolver/outcomes y agregar tests puros donde la nueva lógica lo permita.

## Importante sobre balance

Los textos y estructura narrativa de Sofi V5 están congelados como base.

Los valores exactos de Attraction / Trust / Intensity y thresholds de outcomes **no están congelados**. Deben ajustarse después de enumerar rutas posibles y probar si Cita, Instagram, Friendzone y Rechazo son alcanzables de forma interesante.

---

# Estado actual

Congelado como base:

- principios del sistema social;
- ramificación por micro-branches/contexto;
- necesidad de historial y señales;
- Sofi V5 narrativa;
- Tambu como Licenciado en Psicopedagogía;
- uso puntual de `papi`;
- sistema conceptual de El Consejo;
- Pitity;
- Eze;
- Tobi;
- regla anti-repetición;
- tono adulto/no autocensurado del grupo.

Pendiente:

- balance numérico definitivo de Sofi;
- playtest de rutas;
- outcomes finales y recompensas si requieren ajuste;
- alcohol;
- Mili;
- Cami;
- Thiago;
- Uriel;
- Santygamer;
- eventos sociales futuros.
