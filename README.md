# Privatemoney-for-designers

Speakers del Private Money Summit para diseño: Airtable → página + headshots + Excel.

Jala los speakers de la tabla **Onboarded Speakers** (base Private Money Summit) y muestra nombre, cargo, empresa y bio. Cada headshot se sirve como `Nombre-Apellido.jpg`.

## Correr

```bash
npm install
cp .env.example .env                       # y pon tu token de Airtable (solo lectura)
mkdir -p brand/fonts && cp ../n-cms/src/fonts/{PPNeueMontreal-Regular,PPNeueMontreal-Book,PPNeueMontrealMono-Regular,KeplerStd-MediumCnItDisp}.woff2 brand/fonts/
npm start                                  # http://localhost:3000
```

- `.env` no se sube a git. Lleva `AIRTABLE_TOKEN`, `AIRTABLE_BASE`, `AIRTABLE_TABLE` y `PORT`.
- Las tipografías de NEAR tienen licencia y **no están en el repo**. Cópialas desde `n-cms/src/fonts/` como muestra el comando de arriba. Sin ellas, la página usa las fuentes del sistema.

## Rutas

| Ruta | Qué hace |
|---|---|
| `/` | Página con todas las tarjetas |
| `/api/speakers` | JSON con name, company, role, bio, headshot |
| `/headshots/Nombre-Apellido.jpg` | Headshot convertido a JPG (`?download=1` para descargarlo) |
| `/speakers/Nombre-Apellido.zip` | Un speaker: su JPG en alta resolución y un `.txt` con nombre, cargo, empresa y bio |
| `/speakers.xlsx` | Excel: #, foto incrustada, nombre, empresa, cargo, bio y nombre del archivo JPG |
| `/headshots.zip` | ZIP con `speakers.xlsx` y la carpeta `headshots/` con todos los JPG |

Los datos se guardan en caché 5 minutos. Para forzar una lectura nueva de Airtable, agrega `?refresh=1` a cualquier ruta.

## Diseño y branding

- `page.js`: el HTML y CSS de la página.
- `brand/`: los assets de NEAR, copiados de `n-cms`. Son las tipografías PP Neue Montreal y Kepler Condensed Italic (con licencia) y los logos SVG.
- Los colores son los tokens de `n-cms/src/styles/tokens.css`: paper `#f5f5f5`, ink `#262626` y green `#00dc8d`.
