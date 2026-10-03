# Tambu Game — Bathroom Resistance 2.0 / Dirección narrativa

**Estado:** APPROVED DIRECTION / PENDING INTEGRATION  
**Fecha:** 2026-10-03  
**Autoridad:** dirección narrativa y presentation contract de Bathroom Resistance 2.0  
**No reemplaza:** balance, rewards ni contratos de `bathroomResistance.js`

---

# 1. Objetivo

Bathroom Resistance 2.0 no cambia el minijuego base.

Su objetivo es transformar tres repeticiones mecánicas en una progresión narrativa clara:

1. **BAÑO 1 — SORPRESA**
2. **BAÑO 2 — INCREDULIDAD**
3. **BAÑO 3 — CAOS**

La fiesta debe recordar lo que ya ocurrió durante la run. Los amigos reconocibles pasan a ser voces/personajes concretos en vez de un genérico `AFUERA`.

---

# 2. Mecánica protegida

Queda congelado el balance aceptado del Pass 2:

- duración: **10 s**;
- `SPACE` repetido;
- recuperación por pulsación: **+4**;
- 7 impactos por intento;
- perfiles 1/2/3 actuales;
- drain actual;
- daños actuales;
- ordinal de intento basado solo en bathrooms ya liquidados;
- success → `secured` +500;
- failure → `interrupted` +250;
- reward settlement idempotente;
- Perfect Night requiere 3 `secured`.

Bathroom Resistance 2.0 NO puede alterar esos contratos.

---

# 3. Portrait Reaction System — foundation

Los seis amigos ya tienen portraits UI aprobados.

Archivos:

- `ui_portrait_pitity_v1.png`
- `ui_portrait_tobi_v1.png`
- `ui_portrait_uriel_v1.png`
- `ui_portrait_santy_v1.png`
- `ui_portrait_thiago_v1.png`
- `ui_portrait_eze_v1.png`

Contrato visual:

- strip horizontal;
- **192×64 px**;
- 3 frames de **64×64**;
- frame 0 = `talk`;
- frame 1 = `angry`;
- frame 2 = `shout`;
- RGBA transparente.

Este sistema debe diseñarse como foundation reutilizable. Más adelante podrá recibir portraits de Tambu, Sofi, Mili y Cami para HUD/dialogue, pero esos assets y esa migración quedan fuera de este task.

---

# 4. Presentation contract

Durante Bathroom Resistance puede existir como máximo **una intervención hablada visible a la vez**.

Cada intervención muestra:

- portrait 64×64 del speaker;
- nombre corto del speaker;
- globito/caja breve de texto al lado;
- expresión indicada por el beat.

Los golpes sin diálogo pueden seguir funcionando como feedback de puerta/cámara sin portrait.

Principios:

- retrato pequeño, no domina la pantalla;
- frase corta;
- lectura instantánea;
- mismo lenguaje nocturno/pixel de `UI_DIRECTION.md`;
- sin rounded web cards;
- sin blur/glass;
- sin emojis del sistema;
- no tapar barra/timer;
- no convertir el minijuego en una conversación larga.

La frase debe desaparecer o ser reemplazada por la siguiente intervención. No acumular globos.

---

# 5. Memoria real de run

La narrativa puede consultar resultados anteriores ya liquidados.

## Segundo intento

Existe exactamente un resultado previo:

- `secured`
- o `interrupted`

La línea contextual debe cambiar según ese resultado.

## Tercer intento

Existen dos resultados previos.

La rama narrativa usa el total de bathrooms previos `secured`:

- **2 secured**
- **1 secured**
- **0 secured**

No recalcular rewards ni outcomes. Esta memoria es exclusivamente presentation/narrative.

---

# 6. BAÑO 1 — SORPRESA

## Cast

**Pitity**

Objetivo: el grupo todavía no entiende del todo qué está pasando. Pitity golpea porque necesita entrar y descubre que Tambu está adentro.

## Anticipation

### 1700 ms
SFX / golpe:
`PUM PUM PUM`

Sin portrait.

### 2450 ms
Speaker: **Pitity**  
Expression: **TALK**  
Copy:

`¿TAMBU?`

Debe sentirse más confundido que enojado.

## Resistance hits

Los timings y damages siguen siendo los del perfil actual. Solo cambia la presentation.

### Hit 1 — 800 ms
`PUM`

Sin portrait.

### Hit 2 — 1900 ms
Speaker: **Pitity**  
Expression: **TALK**  
Copy:

`¿ESTÁS AHÍ?`

### Hit 3 — 3100 ms
`PUM PUM`

Sin portrait.

### Hit 4 — 4400 ms
Speaker: **Pitity**  
Expression: **ANGRY**  
Copy:

`ABRÍ, BOLUDO.`

### Hit 5 — 6100 ms
`PUM PUM PUM`

Sin portrait.

### Hit 6 — 7900 ms
Speaker: **Pitity**  
Expression: **SHOUT**  
Copy:

`¡DALE, TENGO QUE MEAR!`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

## Resolution flavor

### Secured
Speaker: **Pitity**  
Expression: **ANGRY**  
Copy:

`BUENO. CAGATE.`

### Interrupted
Speaker: **Pitity**  
Expression: **SHOUT**  
Copy:

`¡TE DIJE QUE ABRAS!`

La resolución mecánica y reward no cambian.

---

# 7. BAÑO 2 — INCREDULIDAD

## Cast

**Tobi + Uriel**

Objetivo: ya ocurrió un Bathroom Resistance. Los amigos reconocen el patrón y no pueden creer que Tambu esté repitiendo la jugada.

## Anticipation

### 1700 ms
Speaker: **Tobi**  
Expression: **TALK**  
Copy:

`NO ME JODAS...`

### 2450 ms
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`¿OTRA VEZ?`

## Resistance hits

### Hit 1 — 800 ms
Speaker: **Tobi**  
Expression: **ANGRY**  
Copy:

`ABRÍ.`

### Hit 2 — 1900 ms
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`ESTÁ AHÍ ADENTRO, ¿NO?`

### Hit 3 — 3100 ms
`PUM PUM`

Sin portrait.

### Hit 4 — 4400 ms
Speaker: **Tobi**  
Expression: **SHOUT**  
Copy:

`¡TAMBU, ABRÍ!`

### Hit 5 — 6100 ms — MEMORY BRANCH

Si el bathroom anterior fue **secured**:

Speaker: **Uriel**  
Expression: **ANGRY**  
Copy:

`LA PRIMERA TE SALIÓ. ESTA NO.`

Si el bathroom anterior fue **interrupted**:

Speaker: **Uriel**  
Expression: **ANGRY**  
Copy:

`¿NO APRENDISTE NADA?`

### Hit 6 — 7900 ms
Speaker: **Tobi**  
Expression: **SHOUT**  
Copy:

`¡DALE, PELOTUDO!`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

## Resolution flavor

### Secured
Speaker: **Tobi**  
Expression: **ANGRY**  
Copy:

`NO PUEDE SER.`

### Interrupted
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`Y... ERA OBVIO.`

---

# 8. BAÑO 3 — CAOS

## Cast

**Santy + Thiago “La Abuela” + Eze**

Objetivo: ya no existe sorpresa. Todos saben exactamente qué está haciendo Tambu. La escena debe sentirse como el grupo entero participando del desastre.

La intensidad nace principalmente del cambio rápido de speakers, no de aumentar daños ni duración.

## Anticipation

### 1700 ms
Speaker: **Santy**  
Expression: **TALK**  
Copy:

`CHE...`

### 2450 ms
Speaker: **Thiago**  
Expression: **ANGRY**  
Copy:

`NO. OTRA VEZ NO.`

## Resistance hits

### Hit 1 — 800 ms
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡TAMBU!`

### Hit 2 — 1900 ms
Speaker: **Thiago**  
Expression: **ANGRY**  
Copy:

`ABRÍ LA PUERTA.`

### Hit 3 — 3100 ms — MEMORY BRANCH

Speaker: **Eze**

Si los dos bathrooms anteriores fueron **secured**:

Expression: **ANGRY**  
Copy:

`DOS VECES TE SALIÓ. ESTA NO.`

Si hubo **1 secured + 1 interrupted**:

Expression: **TALK**  
Copy:

`UNA TE SALIÓ. UNA TE LA CAGAMOS.`

Si ambos anteriores fueron **interrupted**:

Expression: **TALK**  
Copy:

`TERCERA VEZ Y TODAVÍA INSISTÍS.`

### Hit 4 — 4400 ms
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡ABRÍ, HIJO DE PUTA!`

### Hit 5 — 6100 ms
Speaker: **Thiago**  
Expression: **SHOUT**  
Copy:

`¡TENGO QUE MEAR!`

### Hit 6 — 7900 ms
Speaker: **Eze**  
Expression: **ANGRY**  
Copy:

`YA ESTÁ. TIREN LA PUERTA.`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

La cámara/puerta puede usar el feedback de hit existente. No agregar mecánica nueva de “tirar la puerta”.

## Resolution flavor

### Secured
Speaker: **Eze**  
Expression: **TALK**  
Copy:

`NAH. DEJALO. YA ESTÁ.`

### Interrupted
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡TE AGARRAMOS, GIL!`

---

# 9. Separación narrativa / balance

Crear una capa narrativa separada del balance.

Objetivo conceptual:

- `bathroomResistance.js` → mecánica, timings, drain, damage;
- nueva data/helper narrativa → speakers, expressions, copy y ramas de memoria.

No hacer que texto/portrait determine damage.

No duplicar perfiles de balance para poder cambiar frases.

---

# 10. Data contract recomendado

Cada beat narrativo debería poder resolverse a una forma similar a:

```js
{
  speaker: 'pitity',
  expression: 'talk',
  text: '¿TAMBU?',
}
```

Un golpe sin diálogo puede resolver a:

```js
{
  speaker: null,
  expression: null,
  text: 'PUM PUM',
}
```

Las ramas de memoria deben resolverse antes de llegar a UI. La UI presenta datos, no decide historia.

---

# 11. Out of scope

No entra en Bathroom Resistance 2.0:

- mover amigos físicamente a la puerta;
- nuevos sprites o animaciones de amigos;
- nuevos portraits;
- portraits de Tambu/chicas;
- voice acting;
- audio final;
- rebalance;
- nuevas rewards;
- cambiar duración;
- cambiar número de golpes;
- nueva física de puerta;
- cutscene adicional;
- refactor general de UI;
- rediseño completo del HUD.

---

# 12. QA narrativo

La pasada se considera exitosa si, jugando tres bathroom attempts en una misma run:

1. el primero se siente como descubrimiento/sorpresa;
2. el segundo reconoce explícitamente que esto ya pasó;
3. el tercero se siente como escalada social y caos;
4. los portraits permiten reconocer inmediatamente quién habla;
5. las ramas reflejan resultados anteriores reales;
6. ninguna frase modifica dificultad;
7. el spam visual no dificulta SPACE/bar/timer;
8. la escena sigue siendo corta;
9. failure sigue siendo divertido;
10. success sigue sintiéndose como victoria.

---

# 13. Estado de cierre esperado

Después de implementación + QA manual de Dirección:

**BATHROOM RESISTANCE 2.0 — CLOSED / BASELINE**

El siguiente bloque del roadmap será:

**PARTY PRESENCE**
