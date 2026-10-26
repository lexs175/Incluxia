<p align="center">
  <img src="src/assets/images/brand/logo.png" alt="Eco — Más oportunidades, menos barreras" width="360" />
</p>

<h1 align="center">Eco</h1>

<p align="center">
  Plataforma laboral boliviana para personas con pérdida auditiva e hipoacusia.<br/>
  Postulaciones y entrevistas <strong>100 % por chat o WhatsApp</strong>, sin llamadas telefónicas.
</p>

<p align="center">
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Astro-7.x-ff5d01?logo=astro&logoColor=white" alt="Astro 7" /></a>
  <a href="https://gsap.com"><img src="https://img.shields.io/badge/GSAP-3.x-88ce02?logo=greensock&logoColor=black" alt="GSAP 3" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

---

## ✨ Características

- **Páginas generadas estáticamente** (SSG), incluidas vistas de detalle con `[slug]`.
- **Colecciones de datos** en JSON: empleos, perfiles, contratación y casos de éxito.
- **Sistema de diseño con tokens**: color, tipografía fluida `clamp()` y espaciados centralizados en `src/styles/tokens.css`.
- **Accesibilidad primero**: contraste AA, foco visible, soporte de `prefers-reduced-motion`, navegación por teclado y textos alternativos en todos los recursos.
- **SEO on-page**: meta tags, Open Graph y título/descripción por ruta.
- **Animación** con GSAP y transiciones de vista con `astro:transitions`.

## 🗺️ Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio: hero, categorías y destacados |
| `/empleos` · `/empleos/[slug]` | Bolsa de empleo y detalle de vacante |
| `/perfiles` · `/perfiles/[slug]` | Perfiles profesionales y detalle |
| `/casos-de-exito` · `/casos-de-exito/[slug]` | Historias de inclusión laboral |

«Nosotros» y «Blog» están archivados en [archive/inactive-pages](archive/inactive-pages/README.md), fuera de las rutas activas.

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 7](https://astro.build) — islas + SSG |
| Estilos | CSS puro con custom properties (tokens) |
| Animación | [GSAP 3](https://gsap.com) |
| Tipografía | Montserrat (títulos) · Poppins (cuerpo) |
| Datos | JSON estático en `src/data/` |
| Despliegue | [Vercel](https://vercel.com) (salida estática) |

## 🚀 Inicio rápido

```bash
git clone https://github.com/lexs175/Eco.git
cd Eco
npm install
npm run dev      # http://localhost:4321
```

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa del build |
| `npm test` | Ocho verificaciones de la interfaz compilada; ejecutar después del build |
| `npm run test:platform` | Recorrido entre cuentas: perfil, publicaciones, postulaciones y consultas |
| `npm run test:auth` · `npm run test:header` | Acceso, menú, teclado y móvil |
| `npm run test:workspace` · `npm run test:hiring` | Ofertas y categorías de contratación |
| `npm run test:management` · `npm run test:home` | Vistas de gestión, inicio e historias |
| `npm run test:images` | Fuentes, variantes y carga de imágenes |
| `npm run images:catalog` | Actualizar el documento de imágenes activas |

Las pruebas usan Chromium mediante Playwright y sirven `dist/` en un puerto local
libre. Sus capturas e informes se guardan en `artifacts/`, fuera de Git; `npm test`
consolida el resultado en `artifacts/verification/summary.json`.
Para repetir solo una parte, usa por ejemplo `npm test -- platform workspace home`.
Si varias tareas compilan a la vez, se puede generar otra salida con
`npm run build -- --outDir artifacts/verification-site` y ejecutar las pruebas
con la variable de entorno `ECO_TEST_DIST=artifacts/verification-site`.
Las capturas maestras del inicio solo se actualizan expresamente con
`npm run test:platform -- --refresh-preview-images`; después hay que recompilar.

El código sin uso, las migraciones terminadas y el inventario anterior están en
[el archivo de mantenimiento](archive/maintenance-2026-10-26/README.md).

## 📁 Estructura

```
Eco/
├── public/
│   └── favicon.svg
├── scripts/           # Verificación y herramientas de imágenes
├── archive/           # Páginas y recursos anteriores conservados
└── src/
    ├── assets/images/ # Imágenes maestras gestionadas con Astro Assets
    ├── components/
    │   ├── cards/     # ProfileCard · StoryCard
    │   ├── layout/    # Header · HeaderNav · Footer
    │   └── ui/        # ActionButton · ExpandableButton · SiteImage · PasswordField
    ├── data/          # hiring · jobs · profiles · stories (.json)
    ├── layouts/       # Layout base (head, SEO, fuentes, GSAP)
    ├── pages/         # Rutas del sitio (SSG)
    └── styles/
        ├── tokens.css # Design tokens (color, tipo, espacio)
        └── global.css # Reset, base y utilidades
```

## Videos de los casos de éxito

En `src/data/stories.json`, cambia `videoUrl` por el enlace de YouTube de cada
historia. Se aceptan enlaces compartidos (`https://youtu.be/VIDEO_ID`), normales
(`https://www.youtube.com/watch?v=VIDEO_ID`), Shorts y directos. Deja `videoUrl`
vacío o elimina el campo para mostrar la fotografía de `image`.

El primer caso usa un video de ejemplo. El componente `YouTubeVideo.astro`
genera el reproductor adaptable sin reproducción automática ni archivos de video
en el hosting. Solicita subtítulos en español cuando el video los tenga; los
subtítulos y la interpretación LSB deben revisarse en el contenido original.
Los cambios se reflejan al volver a compilar y desplegar el sitio.

## 🎨 Sistema de diseño

Toda decisión visual vive en los tokens: los componentes **no** declaran colores ni
tamaños de fuente hardcodeados.

```css
/* Consumir los valores actuales de src/styles/tokens.css. */
.ejemplo {
  background: var(--color-bg-card);
  color: var(--color-primary);
  font-size: var(--text-hero);
}
```

Tres reglas de arquitectura que siguen todos los componentes:

1. **Cero hex/rgba quemados** → siempre `var(--color-*)`.
2. **Tipografía fluida** → un solo `font-size` con `clamp()`, sin `font-size`
   dentro de media queries.
3. **Layout en 3 capas** → *wrapper* (`100%`) → `.container`
   (`max-width` + `padding-inline`) → *cápsula* visual (fondo, radio, sombra).

Los controles normales usan `src/components/ui/ActionButton.astro`. Sus variantes
y estados se definen una sola vez en `src/styles/management.css`:

| Variante | Presentación y uso |
| --- | --- |
| `primary` | Fondo de marca para la acción principal. |
| `secondary` | Fondo neutro `var(--color-bg)`, borde y texto de marca; acciones alternativas como «Ingresar». |
| `ghost` / `quiet` | Sin fondo ni borde en reposo; acciones discretas. |
| `icon` | Control compacto para una acción representada por un icono. |
| `danger` | Acción destructiva con los tokens de error. |

Los tamaños `sm`, `md` y `lg` tienen alturas mínimas de 36, 44 y 50 px.
`link` se reserva para acciones con presentación de enlace. Selecciona la variante
en el componente; no redefinas su color, fondo o borde mediante clases locales.
`ExpandableButton.astro` se reserva para llamadas principales de avance cuando
corresponda; los controles de gestión usan `ActionButton`.

## 📦 Datos

Las imágenes locales se gestionan con Astro desde `src/assets/images/`. La lista de archivos independientes y las instrucciones para reemplazarlos están en [IMAGENES.md](IMAGENES.md). Ejecuta `npm run test:images` para verificar tamaños, rutas y comportamiento con sesión iniciada.

## Acceso del prototipo

Ingreso y registro comparten un modal compacto. El registro solicita nombre, correo y contraseña; ciudad, especialidad y contacto se completan después en Perfil. Ambos formularios permiten mostrar u ocultar la contraseña y conservan el destino y el scroll.

«Continuar con Google» simula el acceso con la cuenta local de Valeria; no usa Google Identity Services ni necesita un ID de cliente. «Ingresar como Valeria» ofrece también acceso directo para pruebas. Los formularios y sus contraseñas pertenecen a la simulación local existente, no a un servicio de identidad de producción.

Después de `npm run build`, ejecuta `npm run test:auth` para comprobar el ancho del modal, móvil, teclado, errores, los ojos de ambos campos, registro sin teléfono ni ciudad, Google simulado y acceso de Valeria. La evidencia se guarda en `artifacts/auth-simplification/`.

El contenido se edita sin tocar componentes:

| Archivo | Ítems |
|---------|-------|
| `src/data/jobs.json` | 4 vacantes |
| `src/data/profiles.json` | 19 perfiles |
| `src/data/stories.json` | 4 casos de éxito |

---

<p align="center">Eco Bolivia · Más oportunidades, menos barreras</p>
