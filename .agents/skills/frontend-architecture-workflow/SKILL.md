---
name: Frontend Architecture & Design Tokens Workflow
description: Guía maestra y protocolo de arquitectura CSS, sistema de tokens de diseño, tipografía fluida con clamp(), maquetación en 3 capas y estándares de accesibilidad para el proyecto ASHICO (IncluyeAudición Bolivia) en Astro.
---

# Frontend Architecture & Design Tokens Workflow

Guía maestra y protocolo oficial de desarrollo para el proyecto **ASHICO - IncluyeAudición Bolivia**.

---

## 📚 Documentación de Referencia y Contexto

Para consultar los detalles técnicos específicos, acude a los documentos modulares de la carpeta `references/`:

1. [Contexto del Proyecto y Dominio](file:///d:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/.agents/skills/frontend-architecture-workflow/references/context.md)
   * Organización ASHICO, marco legal boliviano (Ley 223, Ley 977, SIPRUNPCD), requerimientos de accesibilidad A11y y stack tecnológico.
2. [Sistema de Tokens de Diseño](file:///d:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/.agents/skills/frontend-architecture-workflow/references/design-tokens.md)
   * Paleta oficial de colores, escala de tipografía fluida con fórmulas `clamp()` y reglas de consumo obligatorio.
3. [Patrones de Arquitectura CSS (3 Capas)](file:///d:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/.agents/skills/frontend-architecture-workflow/references/architecture-patterns.md)
   * Explicación del modelo *Wrapper (Capa 1) → Container (Capa 2) → Capsule (Capa 3)* y listado de anti-patrones prohibidos.
4. [Ejemplo de Implementación: Header Flotante](file:///d:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/.agents/skills/frontend-architecture-workflow/examples/floating-navbar.astro)
   * Código de referencia limpio para componentes flotantes tipo isla sin parches `calc()`.

---

## ⚡ Protocolo Rápido de Desarrollo

1. **Tokens Obligatorios:** Cero colores hexadecimales en CSS. Consumir siempre `var(--color-*)`.
2. **Tipografía Fluida:** Declarar `font-size: var(--text-*)` una sola vez en desktop. Prohibido redefinir tamaños de fuente dentro de `@media`.
3. **Maquetación 3 Capas:** Nunca usar `width: calc(100% - Xrem)` para márgenes. Usar `.container` con `padding-inline: var(--container-padding)`.
4. **Verificación Pre-Entrega:** Ejecutar siempre `npm run build` y comprobar que compile con código `0` sin errores.
