# AGENTS.md - Reglas y Estándares del Proyecto

## 1. Reglas Globales No Negociables
- **PROHIBIDO usar scratchpad:** NUNCA crear o modificar archivos `scratchpad.md`, `scratchpad_*.md` o similares. El seguimiento y planeación se hace exclusivamente en los archivos oficiales y el chat directo con Lex.
- **PROHIBIDO usar browser_subagent:** NUNCA invocar la herramienta nativa `browser_subagent`. Para cualquier tarea de navegación, captura o prueba web, usar exclusivamente `playwright` CLI o Playwright MCP local.

---

## 2. Estándares de Arquitectura CSS y Tokens de Diseño

### Regla 1: CERO Colores Hardcodeados (Prohibido Hex / RGBA Quemados)
- **NUNCA** escribir colores hexadecimales directos (`#ffffff`, `#212051`, `#99F6FF`, `#F1F5F9`, etc.) en componentes `.astro` ni en archivos `.css`.
- **SIEMPRE** consumir las variables definidas en `src/styles/tokens.css`:
  - Fondos de tarjetas/páginas: `var(--color-bg)`, `var(--color-bg-alt)`, `var(--color-bg-card)`, `var(--color-white)`.
  - Colores de texto: `var(--color-text-main)`, `var(--color-text-muted)`, `var(--color-text-inverse)`.
  - Colores de marca: `var(--color-primary)`, `var(--color-primary-light)`, `var(--color-primary-hover)`, `var(--color-accent)`, `var(--color-accent-dark)`.
  - Alphas/Transparencias: `rgba(var(--color-primary-rgb), 0.2)` o `rgba(var(--color-accent-rgb), 0.6)`.

### Regla 2: Tipografía Fluida con `clamp()` (Cero Font-Sizes en Media Queries)
- La escala tipográfica completa (`--text-xs` a `--text-hero`) está definida como fluida con fórmulas `clamp(min, preferred, max)` en `tokens.css`.
- **Declarar una sola vez en desktop:** Asignar `font-size: var(--text-*)` en la regla base del componente o elemento (`h1` a `h6`, párrafos, títulos).
- **PROHIBIDO** redefinir `font-size` dentro de `@media (max-width: 479px)` o `@media (min-width: 1440px)` para encabezados o títulos. La tipografía escala de forma continua y automática por herencia.

### Regla 3: Arquitectura Limpia de 3 Capas (Cero Parches `calc()` de Ancho)
- **PROHIBIDO** usar parches como `width: calc(100% - 1.25rem)` o números mágicos para evitar que elementos se peguen a los bordes de la pantalla.
- **SIEMPRE** estructurar componentes y secciones en 3 capas semánticas:
  1. **Capa 1 (Wrapper / Rail):** Ancho `100%`. Gestiona posición (`position: fixed`, sticky o flujo) y deja pasar eventos si es flotante (`pointer-events: none`).
  2. **Capa 2 (Contenedor `.container`):** Define `max-width: var(--container-max-width)` y garantiza márgenes laterales de seguridad continuos con `padding-inline: var(--container-padding)`.
  3. **Capa 3 (Cápsula / Layout):** Es la caja visual que lleva el fondo (`background`), `border`, `backdrop-filter`, `border-radius`, `box-shadow`, `padding-block` y `padding-inline`, reactivando eventos con `pointer-events: auto`.

---

## 3. Flujo de Trabajo y Verificación Obligatoria
1. **Analizar antes de codificar:** Si se detectan inconsistencias de diseño, consultar o planear con base en los tokens existentes antes de introducir nuevas clases ad-hoc.
2. **Validar compilación:** Siempre verificar cambios con `npm run build` para asegurar 0 errores en las rutas estáticas.
