# Tambu Game — Fase 1 · Night Grass

**Estado runtime actual:** Night Grass Pack V3 integrado.  
**Estado de arte:** V3 NO está congelado como arte final; se está produciendo una nueva familia de césped nocturno bajo `PIXEL_ART_STYLE_GUIDE.md`.  
**Scope:** solo césped; no autoriza cambios de deck, piscina, barra, DJ, NPCs ni iluminación final.

---

# Fuente de verdad

Para cualquier asset nuevo de césped prevalece:

1. `docs/PIXEL_ART_STYLE_GUIDE.md` — paleta, noche, pixel density, generación IA y validación.
2. `docs/ART_DIRECTION.md` — objetivo visual y jerarquía.
3. este archivo — decisiones específicas de la Fase 1.

Los PNG actualmente integrados del Pack V3 continúan funcionando únicamente como implementación runtime mientras se aprueba su reemplazo.

La hoja/reference de cualquier pack conceptual es **solo referencia**. Nunca se recorta para fabricar assets finales.

---

# Decisiones cerradas de césped

- Todo el patio permanece visualmente verde.
- No existe capa `worn`.
- No se usa tierra marrón.
- No se usan caminos gastados.
- El césped nace cromáticamente nocturno.
- Temperatura: verde frío / teal profundo.
- Ground relativamente uniforme y suave.
- Variaciones por patrón, densidad y valor; no por cambio evidente de hue.
- Mayor riqueza vegetal hacia bordes y rincones.
- Centro jugable más tranquilo.
- Flores/hojas son acentos escasos.
- El césped nunca compite con piscina, Tambu, NPCs, barra o DJ.

---

# Paleta oficial Night Grass

Usar la paleta estricta definida en `PIXEL_ART_STYLE_GUIDE.md`:

```text
NG-01  #112A2F  Deep shadow
NG-02  #112F31  Shadow
NG-03  #123232  Dark base
NG-04  #153B35  Base
NG-05  #194137  Mid grass
NG-06  #1C4839  Soft light
NG-07  #25553D  Highlight
```

Las variantes nuevas deben sentirse como **el mismo césped bajo la misma noche**.

No aceptar una variante más amarilla, saturada o luminosa solo porque se vea bien de forma aislada.

---

# Nueva producción — prioridad

La nueva familia se produce en imágenes independientes.

## Ground obligatorio

- `grass_ground_01.png`
- `grass_ground_02.png`
- `grass_ground_03.png`
- `grass_ground_04.png` solo si la repetición lo justifica

## Variación macro

- `grass_macro_soft_01.png`
- `grass_macro_soft_02.png`
- `grass_macro_dark_01.png`

## Vegetación de borde

- `grass_cluster_soft_01.png`
- `grass_cluster_soft_02.png`
- `bush_edge_horizontal_01.png`
- variantes/corners solo cuando la composición los necesite

## Acentos posteriores

- `flower_white_01.png`
- `flower_pink_01.png`
- `leaf_01.png`
- pequeñas plantas

No producir clutter extra antes de aprobar ground + macro + primer cluster.

---

# Regla IA obligatoria

**Una imagen = un asset.**

No generar:

- sheets;
- collages;
- pack presentations;
- atlas conceptuales como fuente de producción;
- una imagen grande para después recortarla.

Los assets finales se generan individualmente para su función técnica.

---

# Gate para ground

Antes de aprobar `grass_ground_*`:

1. comprobar paleta contra `NG-01…NG-07`;
2. repetir la textura al menos `3x3`;
3. revisar costuras X/Y;
4. revisar patrones diagonales y manchas repetidas;
5. combinarla con otra variante candidata;
6. verla a `camera zoom = 1`;
7. colocar Tambu real encima a `scale: 1.24`.

Una textura no está aprobada solo porque se vea bien como imagen individual.

---

# Arquitectura runtime actual

El sistema V3 existente continúa renderizando conceptualmente:

```text
base → micro → macro → clusters → accents
```

La arquitectura puede reutilizarse si sirve al nuevo arte, pero **no obliga a mantener nombres, tamaños o PNGs del pack anterior**.

No se reintroduce `worn`.

`createPatioWorld.js` y la composición del patio no deben alterar colisiones ni macro-layout para acomodar el césped nuevo.

Tambu se conserva como referencia humana:

- frame fuente `32x48`;
- runtime `scale: 1.24`;
- cámara `zoom = 1`.

---

# Calibración

Durante desarrollo se mantienen disponibles:

```text
/?scene=grass-calibration&grassSpot=quiet
/?scene=grass-calibration&grassSpot=dense
```

`quiet` debe mostrar Tambu sobre ground tranquilo.  
`dense` debe probar vegetación de borde/cluster sin cubrir su silueta.

---

# Criterio para reemplazar V3

No reemplazar el pack runtime actual hasta tener como mínimo:

- 3 ground candidates coherentes entre sí;
- repeat test aprobado;
- 1 macro soft aprobado;
- 1 cluster soft aprobado;
- comparación con Tambu a zoom 1;
- revisión de color conjunta en una misma escena.

Cuando esos elementos estén aprobados, recién entonces se prepara el pack de integración para Work.

No avanzar a Deck como producción final hasta cerrar esta calibración del césped.
