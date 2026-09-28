# Patrones de Arquitectura CSS (3 Capas)

## 1. El Modelo de 3 Capas Semánticas
Para evitar parches como `width: calc(100% - 1.25rem)` y números mágicos, todo layout y componente debe construirse con la separación estricta de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. WRAPPER / RAIL (width: 100%, posición o flujo)           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. CONTAINER (.container, max-width + padding-inline) │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 3. CAPSULE / CONTENT (visual, fondo, padding)   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Capa 1: Riel / Wrapper
* Ancho `100%`.
* Controla si el elemento es fijo (`position: fixed`), sticky o parte del flujo.
* En barras flotantes: `pointer-events: none` para no bloquear interacciones a los lados.

### Capa 2: Contenedor `.container`
* Controla `max-width: var(--container-max-width)` (1440px).
* Centrado con `margin-inline: auto`.
* Margen de seguridad lateral continuo con `padding-inline: var(--container-padding)`.

### Capa 3: Cápsula / Layout
* Es la caja visual que lleva el `background-color`, `border-radius`, `box-shadow` y `border`.
* Lleva su propio aire interno: `padding-block: var(--space-2)` y `padding-inline: var(--space-4)`.
* En barras flotantes: `pointer-events: auto` para reactivar eventos de clic.

---

## 2. Anti-Patrones Prohibidos

1. ❌ **`width: calc(...)` para márgenes:**
   * Nunca hacer: `width: calc(100% - 1.25rem);`
   * Siempre hacer: Dejar que `.container` maneje el `padding-inline: var(--container-padding)`.
2. ❌ **Sobrescribir `font-size` en breakpoints:**
   * Nunca hacer: `@media (max-width: 479px) { h1 { font-size: 1.6rem; } }`
   * Siempre hacer: `h1 { font-size: var(--text-5xl); }` directamente.
3. ❌ **Colores hexadecimales duros:**
   * Nunca hacer: `color: #ffffff; background: #212051;`
   * Siempre hacer: `color: var(--color-text-inverse); background: var(--color-primary);`
