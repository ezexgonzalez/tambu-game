# Assets

Carpeta raíz del arte del juego.

## Estructura actual

```text
public/assets/
├── tiles/
│   ├── grass/
│   ├── deck/
│   ├── house/
│   └── terrain/
├── props/
│   ├── bar/
│   ├── dj/
│   ├── deck/
│   ├── patio/
│   ├── perimeter/
│   └── pool/
├── characters/
│   ├── bartender/
│   ├── dj/
│   ├── tambu/
│   └── ...
└── ...
```

No agregar directorios ni placeholders binarios solo para anticipar una estructura futura. Crear cada familia cuando exista una entrega aprobada.

## Convenciones

- PNG para pixel art.
- Nombres en minúscula con guiones bajos.
- Tile base: 16x16 px.
- Unidad humana de producción: frames de referencia `32x48 px`, calibrados contra Tambu a `scale: 1.24`.
- Sin antialias.
- Mantener transparencia donde corresponda.
- No hornear glows ni efectos de iluminación complejos dentro del sprite: se resuelven desde Phaser/CSS.

Antes de producir o integrar, consultar `docs/CURRENT_STATE.md`, `docs/HUMAN_SCALE.md` y `docs/ASSET_PRODUCTION.md`.

La presencia de un PNG en esta carpeta no implica aprobación. `public/assets/props/patio/`, por ejemplo, contiene candidatos de una pasada revertida y requiere validación contextual antes de reutilizarse.
