# Sistema de Tokens de Diseño (`tokens.css`)

## 1. Tokens de Color y Superficies
Queda prohibido hardcodear colores (`#...`) en componentes. Usar siempre:

| Token | Valor / Equivalencia | Uso Semántico |
| :--- | :--- | :--- |
| `var(--color-primary)` | `#212051` | Azul marino corporativo. Títulos, botones principales, acentos de marca. |
| `var(--color-primary-light)` | `#2c2b69` | Hover de navegación y acentos interactivos suaves. |
| `var(--color-primary-hover)` | `#1b1a45` | Hover oscuro de botones primarios. |
| `var(--color-primary-rgb)` | `33, 32, 81` | Base para opacidades: `rgba(var(--color-primary-rgb), 0.1)`. |
| `var(--color-accent)` | `#ACF7FF` | Cyan neón de alto impacto. Botones CTA secundarios, badges activos. |
| `var(--color-accent-dark)` | `#60EDFF` | Hover para botones sobre fondo cyan. |
| `var(--color-accent-rgb)` | `172, 247, 255` | Base para glows y sombras: `rgba(var(--color-accent-rgb), 0.5)`. |
| `var(--color-bg)` | `#F8FAFC` | Fondo de la aplicación. |
| `var(--color-bg-alt)` | `#F1F5F9` | Fondo de secciones secundarias y formularios neutros. |
| `var(--color-bg-card)` | `#FFFFFF` | Fondo de tarjetas, menús y modales. |
| `var(--color-white)` | `#FFFFFF` | Blanco puro para textos sobre fondos oscuros o inputs. |
| `var(--color-text-main)` | `#1E293B` | Texto principal de lectura (alto contraste). |
| `var(--color-text-muted)` | `#64748B` | Textos secundarios, fechas y metadatos. |
| `var(--color-text-inverse)` | `#FFFFFF` | Texto invertido sobre fondos oscuros. |
| `var(--color-border)` | `#E2E8F0` | Bordes estándar. |
| `var(--color-border-hover)` | `#CBD5E1` | Bordes interactivos en hover / focus. |

## 2. Tipografía Fluida con `clamp()`
Escala matemática continua desde móviles (240px) hasta pantallas desktop (1440px+):

```css
--text-xs: clamp(0.72rem, 0.2vw + 0.68rem, 0.75rem);
--text-sm: clamp(0.8125rem, 0.3vw + 0.75rem, 0.875rem);
--text-base: clamp(0.925rem, 0.35vw + 0.85rem, 1rem);
--text-lg: clamp(1.05rem, 0.5vw + 0.925rem, 1.125rem);
--text-xl: clamp(1.15rem, 0.7vw + 0.98rem, 1.35rem);
--text-2xl: clamp(1.35rem, 1vw + 1.1rem, 1.65rem);
--text-3xl: clamp(1.65rem, 1.6vw + 1.25rem, 2rem);
--text-4xl: clamp(1.95rem, 2.4vw + 1.35rem, 2.5rem);
--text-5xl: clamp(2.25rem, 3.5vw + 1.45rem, 3.25rem);
--text-hero: clamp(2.35rem, 4vw + 1.5rem, 3.5rem);
```

### Regla de Oro
* Declarar **una sola vez** en la regla base del componente (ej. `.hero-title { font-size: var(--text-hero); }`).
* **NUNCA** redefinir `font-size` dentro de `@media (max-width: ...)` o `@media (min-width: ...)`.

## 3. Contenedor y Espaciados
* `var(--container-max-width)`: `1440px`.
* `var(--container-padding)`: `clamp(1rem, 0.86rem + 0.71vw, 1.5rem)`.
