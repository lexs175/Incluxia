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

## Documentación y estado de la entrega

Actualizado el **26 de octubre de 2026**. Eco es un prototipo funcional con datos
y actividad guardados en el navegador. La misma cuenta permite buscar trabajo,
postular, contratar, publicar y ofrecer servicios.

| Documento | Qué explica |
| --- | --- |
| [Estado del proyecto](docs/ESTADO_DEL_PROYECTO.md) | Funciones implementadas, decisiones y pendientes de esta entrega |
| [Manual de usuario](docs/MANUAL_USUARIO.md) | Recorridos para trabajar, contratar, publicar y gestionar la cuenta |
| [Mantenimiento técnico](docs/MANTENIMIENTO.md) | Instalación, arquitectura, datos, imágenes, pruebas y actualización de capturas |
| [Open Graph](docs/OPEN_GRAPH.md) | Imagen para compartir enlaces, dominio, metadatos y prompt de generación |

**Pendientes visuales:** incorporar el logo definitivo, cambiar la imagen del
home y después renovar las capturas para el cierre de la entrega. Las capturas
actuales documentan una versión intermedia; el logo y la nueva imagen todavía no
están incorporados.

## ✨ Características

- **Páginas generadas estáticamente** (SSG), incluidas vistas de detalle con `[slug]`.
- **Colecciones de datos** en JSON: empleos, perfiles, contratación y casos de éxito.
- **Sistema de diseño con tokens**: color, tipografía fluida `clamp()` y espaciados centralizados en `src/styles/tokens.css`.
- **Accesibilidad**: foco visible, soporte de `prefers-reduced-motion`, navegación por teclado y textos alternativos. Las comprobaciones realizadas se detallan en la documentación; no equivalen a una certificación de accesibilidad.
- **SEO on-page**: meta tags, Open Graph y título/descripción por ruta.
- **Vista previa al compartir**: portada Open Graph de Eco con imagen de 1200 × 630 px y URLs completas para `https://eco-bolivia.vercel.app/`.
- **Animación** con GSAP y transiciones de vista con `astro:transitions`.

## 🗺️ Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Portada para visitantes; listado de Trabajos al ingresar |
| `/empleos` · `/empleos/oferta?id=…` | Ofertas y detalle de una publicación |
| `/empleos/[slug]` | Rutas estáticas de las ofertas iniciales |
| `/contratar` · `/contratar/[category]` | Especialidades, profesionales, servicios y sus detalles |
| `/publicar` · `/publicar?tab=mine` | Crear publicaciones y gestionar las propias |
| `/postulaciones` · `/postulaciones?tab=received` | Postulaciones enviadas y recibidas |
| `/perfil` | Perfil de la cuenta que inició sesión y su editor |
| `/perfiles` · `/perfiles/[slug]` · `/perfiles/ver?id=…` | Directorio y perfiles estáticos o vinculados a cuentas locales |
| `/postulaciones/perfil?id=…` | Perfil de un candidato desde una postulación recibida |
| `/casos-de-exito` · `/casos-de-exito/[slug]` | Historias de inclusión laboral |

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

Requiere Node.js **22.12.0 o posterior** y npm. Si ya tienes el repositorio y su
`package-lock.json`, utiliza `npm ci` para instalar las versiones fijadas.

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa del build |
| `npm test` | Nueve verificaciones locales sobre el sitio compilado |
| `npm run test:scroll` | Estabilidad de títulos, rueda, navegación y adaptación al cambiar la ventana |
| `npm run images:catalog` | Regenera el catálogo local de imágenes |

Los comandos de pruebas y catálogo requieren la carpeta local `scripts/`, que
actualmente está excluida de Git, al igual que `docs/`. Los enlaces de
documentación anteriores corresponden a esta copia local. Los requisitos y el procedimiento completo
están en [Mantenimiento técnico](docs/MANTENIMIENTO.md).

## 📁 Estructura

```
Eco/
├── docs/              # Estado, manual de usuario y mantenimiento
├── public/
│   └── favicon.svg
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

Las imágenes locales se gestionan con optimización nativa mediante Astro Assets desde `src/assets/images/`.

## Acceso del prototipo

Ingreso y registro comparten un modal compacto. El registro solicita nombre, correo y contraseña; ciudad, especialidad y contacto se completan después en Perfil. Ambos formularios permiten mostrar u ocultar la contraseña y conservan el destino y el scroll.

«Continuar con Google» simula el acceso con la cuenta local de Valeria; no usa Google Identity Services ni necesita un ID de cliente. «Ingresar como Valeria» ofrece también acceso directo para pruebas. Los formularios y sus contraseñas pertenecen a la simulación local existente, no a un servicio de identidad de producción.

El contenido se edita sin tocar componentes:

| Archivo | Ítems |
|---------|-------|
| `src/data/jobs.json` | 4 vacantes; `src/lib/demo.ts` agrega otros 4 ejemplos al listado |
| `src/data/hiring.json` | 8 categorías y 32 servicios iniciales |
| `src/data/profiles.json` | 19 perfiles |
| `src/data/stories.json` | 4 casos de éxito |

---

<p align="center">Eco Bolivia · Más oportunidades, menos barreras</p>
