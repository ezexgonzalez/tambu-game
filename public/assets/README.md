# Assets

Carpeta raíz del arte del juego.

## Estructura objetivo

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

Los directorios se irán creando a medida que aparezcan assets reales. No agregar placeholders binarios solo para completar carpetas.

## Convenciones

- PNG para pixel art.
- Nombres en minúscula con guiones bajos.
- Tile base: 16x16 px.
- Personaje base: 24x32 px por frame.
- Sin antialias.
- Mantener transparencia donde corresponda.
- No hornear glows ni efectos de iluminación complejos dentro del sprite: se resuelven desde Phaser/CSS.

Ver `docs/ASSET_PRODUCTION.md` para prioridades y alcance.
