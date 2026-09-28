---
name: GSAP & Barba.js Expert
description: Especialista en animaciones complejas y transiciones de página fluidas usando GSAP y Barba.js, con integración perfecta para Webflow.
---

# Skill: GSAP + Barba.js (Slater.app Edition)

Esta skill provee las mejores prácticas y la arquitectura estándar para implementar animaciones con **GSAP (GreenSock)** junto con transiciones de página usando **Barba.js**, adaptado específicamente para entornos donde interactúan constructores visuales de terceros como **Webflow** o entornos de compilación modular como **Slater.js**.

Se debe revisar cada vez el contenido para ver qué está bien y qué no lo está, **actualizándose constantemente**.

## 🎯 Principios Centrales

1.  **Separación de Responsabilidades**:
    * **Scripts Globales**: Navegación, sidebars, same-page links, cursores personalizados (se ejecutan una sola vez con `initGlobalScripts()`).
    * **Scripts de Página**: Marquees, interacciones de scroll, animaciones específicas (se ejecutan en cada transición vía `initPageScripts(container)`).
2.  **Gestión del Ciclo de Vida (El "Problema de Barba" y los Fantasmas de Memoria)**:
    * A diferencia del DOM, las variables de JavaScript sobreviven a los saltos de Barba.js. Cuando Barba reemplaza el contenedor, destruye los elementos del DOM pero *no* los event listeners de JS ni los ScrollTriggers de GSAP adjuntos a ellos (creando "fantasmas").
    * **Regla**: Usar `gsap.context()` para envolver scripts de página, y llamar `pageContext.revert()` en el `onComplete` del timeline de `leave` (cuando la cortina ya cubrió todo).
3.  **El Conflicto con Webflow (El Rastro Perdido y el Engaño)**:
    * Webflow IX2 está diseñado para leer el HTML sólo en una carga completa (F5). Al usar Barba.js, cambiamos el contenido dinámicamente sin recargar, lo que vuelve "ciega" a la instancia de Webflow parando las animaciones nativas.
    * **Regla**: Webflow IX2 y Lottie deben ser destruidos y re-inicializados manualmente en el hook `after` de Barba.js.
4.  **Integración con Entornos Modulares (Slater.js / Webflow)**:
    * Al refactorizar código monolítico en múltiples archivos para Slater.js, el scope de las variables y funciones por defecto es **privado** por archivo.
    * **Regla**: Todo componente o función compartida DEBE exportarse al objeto global (`window.showLoader = function() {}`).

## 🏛️ Arquitectura Avanzada SPA (Webflow + Barba + GSAP + Slater)

1.  **Protocolo `gsap.context()` (Innegociable)**:
    * Toda animación de página DEBE estar dentro de un `gsap.context(ctx => {...})`.
    * **Regla**: El `revert()` del contexto va en el `onComplete` del timeline de `leave` (NO en `beforeLeave`).
2.  **Monolítico vs Modular en Slater**:
    * Para proyectos de tamaño mediano en Slater es aceptable un archivo **Monolítico Seguro**.
    * **Regla**: Limpieza férrea vía `gsap.context()` es obligatoria.
3.  **Prohibición de Webflow IX3 en SPA**:
    * IX3 no tiene API pública para reiniciar correctamente. Usar **GSAP puro** para animaciones dinámicas.
4.  **Protección contra Layout Shifts**:
    * **Regla**: Retrasar animaciones hasta confirmar que fuentes e imágenes estén resueltos (`document.fonts.ready`, `img.decode()`).

## ⚖️ Reglas Estrictas de GSAP y Rendimiento

*Nota: Para la sintaxis pura de GSAP, optimización en navegador, timelines y utilidades, **revisar SIEMPRE los skills oficiales anexos (`gsap-core`, `gsap-performance`, `gsap-timeline`, etc.)** primero.*

**Regla de Entorno SPA Específica:**
1. **Scroll**: Obligatorio `history.scrollRestoration = 'manual'` (Esencial para evitar desajustes en Barba.js).

## 🔥 Elementos Globales vs Elementos de Página (CRÍTICO)

### Los 4 Elementos Persistentes (Fuera de `[data-barba="container"]`)
Barba **nunca los toca ni los reemplaza**:

| Elemento | Selector | Tipo de control |
| :--- | :--- | :--- |
| **Fixed Nav** (sidebar) | `#fixed-nav` | `initGlobalScripts()` una vez |
| **Hamburger** | `.hamburger_menu` | Se re-inicializa con scroll header |
| **Loader / Transition** | `#loader` | Controlado por Barba leave/enter |
| **Nav superior** | `.nav` | Se re-inicializa con `initScrollHeader()` |

### Reglas para Elementos Globales:
1. **Nunca** ponerlos dentro de `pageContext` — su estado se corrompería en cada transición.
2. Sus inicializadores van en `initGlobalScripts()` (una sola vez).
3. Exponer funciones de control vía `window.*` para que Barba los manipule.
4. Siempre tener un **safety net** (reset instantáneo) callable detrás del loader.

### Patrón de Control para Menús/Sidebars:
```javascript
// 1. Cierre CON animación (visible) — NUNCA usar guards de isAnimating
window.closeSidebarAnimated = () => {
  if (!isOpen && !isAnimating) return;
  if (menuTl) menuTl.kill();     // Matar lo que esté corriendo
  isOpen = true;                  // Forzar estado
  isAnimating = false;            // Limpiar guarda
  toggleMenu(true);               // Animación natural
};

// 2. Reset INSTANTÁNEO (invisible, detrás del loader)
window.resetSidebarState = () => {
  if (menuTl) menuTl.kill();
  gsap.set(nav, { x: "100%", display: "none" });
  isOpen = false; isAnimating = false;
};
```

## 🏗️ Estrategia de Hooks de Barba (ACTUALIZADA)

### Regla Crítica: NO matar animaciones en `beforeLeave`
Si se hace `pageContext.revert()` en `beforeLeave`, la página se **congela** visualmente ANTES de que la cortina cubra. El usuario ve un freeze.

### Ciclo Correcto:
```javascript
beforeLeave: () => {
  // VACÍO — las animaciones siguen vivas hasta que el telón cubra
},
leave: function (data) {
  const done = this.async();
  // Sidebar cierra CON animación en paralelo con la cortina
  if (typeof window.closeSidebarAnimated === 'function') window.closeSidebarAnimated();
  showLoader(pendingPageName);
  const tl = gsap.timeline({
    onComplete: () => {
      // Telón cubrió TODO → ahora sí matar animaciones (invisible)
      if (window.pageContext) window.pageContext.revert();
      done();
    }
  });
  addCoverAnimation(tl);
},
enter: function (data) {
  // Safety net detrás de la cortina (invisible)
  if (typeof window.resetSidebarState === 'function') window.resetSidebarState();
  window.scrollTo(0, 0);
  prepareContainer();
  // ...uncover animation...
},
after: function (data) {
  // BLOQUEO ABSOLUTO DE SCROLL FANTASMA (Scroll Anchoring Desync)
  // Siempre forzamos el scrollTo(0,0) ANTES del requestAnimationFrame, aislando
  // el salto nativo asíncrono del historial antes de que GSAP extienda la huincha de medir.
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    initPageScripts(data.next.container);
    // Nota: El ScrollTrigger.refresh() NO VA AQUÍ si tienes curtain animations. 
    // Mándalo orgánicamente y "sin true" cuando finalice toda transición.
  });
}
```

### Re-inicialización de Webflow IX2 / Lottie
```javascript
window.reinitWebflowIx = function(data) {
  if (data && data.next && data.next.html) {
    const parser = new DOMParser();
    const nextHtml = parser.parseFromString(data.next.html, 'text/html');
    const pageId = nextHtml.documentElement.getAttribute('data-wf-page');
    if (pageId) document.documentElement.setAttribute('data-wf-page', pageId);
  }
  if (window.Webflow) {
    window.Webflow.destroy();
    if (window.Webflow.require('lottie')) window.Webflow.require('lottie').lottie.destroy();
    document.dispatchEvent(new Event('readystatechange'));
    window.Webflow.ready();
    if (window.Webflow.require('ix2')) window.Webflow.require('ix2').init();
    if (window.Webflow.require('lottie')) window.Webflow.require('lottie').init();
  }
}
```

### Extracción de Elementos Externos (DOMParser para Componentes SPA Fijos)
**Regla Crítica:** Si un componente (ej. un *Custom Cursor* global o un *Tracker* persistente) debe vivir ESTRATÉGICAMENTE **fuera** de `[data-barba="container"]` para que el property `position: fixed` no se corrompa por transformaciones de scroll del layout:
1. **NUNCA obligues al usuario a reestructurar su Webflow** metiéndolo dentro del container.
2. **NUNCA inventes parches temporales** creando el elemento con `document.createElement`.
3. **USA DOMParser** en la transición (`enter` o `beforeEnter`) para interceptar el string de `data.next.html`, robar el nodo HTML orgánico y clonarlo a la pantalla actual. Inmediatamente elimina el tracker viejo si existe. Esto es oficial, robusto, mantiene las clases generadas estáticamente en Webflow, y garantiza limpieza al cambiar de ruta.

### MatchMedia (Responsividad sin fugas):
```javascript
// Para scripts globales:
if (window.headerMatchMedia) window.headerMatchMedia.revert();
window.headerMatchMedia = gsap.matchMedia();
window.headerMatchMedia.add("(min-width: 992px() => { /* ... */ });

// Para scripts de página: usar mm dentro del gsap.context
```

### Carga Inicial vs Carga por Barba
* **F5**: NUNCA tocar `[data-barba="container"]` con GSAP durante el loader inicial.
* **Barba**: Solo en transiciones controlar opacidad y posición del contenedor entrante.

## ⚡ Race Conditions y Guards

### EL ERROR: Guards que bloquean el cierre
```javascript
// ❌ NUNCA:
window.closeSidebarAnimated = () => {
  if (isOpen && !isAnimating) toggleMenu(true);  // isAnimating bloquea clicks rápidos
};

// ✅ SIEMPRE:
window.closeSidebarAnimated = () => {
  if (!isOpen && !isAnimating) return;
  if (menuTl) menuTl.kill();
  isOpen = true; isAnimating = false;
  toggleMenu(true);
};
```
**Por qué**: Click rápido durante apertura → `isAnimating = true` → cierre nunca se ejecuta → nav zombie.

## 🔗 Same-Page Links (Delegación Global)

### El Problema
Links en nav global (logo, "Inicio") están **fuera** del container de Barba. Si `initSamePageLinks` busca solo dentro del container:
- No los captura → Barba ignora same-URL → **navegador recarga** → saludos inesperados en home.

### La Solución
```javascript
// Handler GLOBAL con delegación en document (va en initGlobalScripts)
const initSamePageLinks = () => {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    if (link.hasAttribute('data-barba-prevent') || link.getAttribute('href')?.startsWith('#')) return;
    const normalize = url => url.split('#')[0].replace(/\/$/, '');
    if (normalize(window.location.href) !== normalize(link.href)) return;
    e.preventDefault();
    e.stopPropagation();
    // ... mostrar loader con transición ...
  });
};
```

## 🐛 Errores Comunes y Soluciones

| Error | Causa | Solución |
| :--- | :--- | :--- |
| Menú se queda abierto al cambiar página | Guards `isAnimating` impiden cierre + `revert()` mata timeline | `closeSidebarAnimated()` sin guards + `resetSidebarState()` safety net |
| Página se congela antes de cortina | `pageContext.revert()` en `beforeLeave` | Mover a `onComplete` de `leave` |
| Click en "Inicio" en home muestra saludos | Link fuera de container → navegador recarga | Delegación global en `document` |
| Click rápido no cierra menú | `isAnimating = true` bloquea `toggleMenu` | Kill + force state + animate |
| Contenido desaparece post-transición | `pointer-events: none` o `opacity: 0` residual | `clearProps: 'all'` al finalizar |
| ScrollTriggers en posición incorrecta o quietos (Bug Scroll Desync) | GSAP recogió offsets de un salto desde un scroll muy profundo porque el navegador aún "recordaba" la profundidad asincrónica | Agresivo `window.scrollTo(0,0)` seguido estrictamente de un `requestAnimationFrame` que inicie scripts |
| Animaciones "saltan" o "hacen un flicker rápido" al revelar | `ScrollTrigger.refresh(true)` fue forzado destruyendo estilos de tweening progresivo | Usar un `ScrollTrigger.refresh()` suave sin parámetro 'true' en el pageRevealComplete |
  | Marquees se duplican | Nodos clonados sin control | `marquee.dataset.duplicated = "true"` |

## 📐 Doctrina de Alturas: La Desincronización del Scroll (Scroll Desync)
> [!WARNING]
> Uno de los bugs más famosos de SPA: el usuario está a 2000px de profundidad, pasa por un link lateral a la Página B. Cuando Barba inyecta la página e inicia los scripts, la variable nativa de retención de scroll engaña a GSAP y dice "El height es X + 2000px". ScrollTrigger encuadra silenciosamente sus cotas 2000px fuera de órbita y cuando el usuario baja en la nueva página... los componentes interactivos jamás reaccionan. Nunca utilices `setTimeout(() => ...)` para inicializar un script vital, exige a rAF `requestAnimationFrame` limpiar el DOM después de una barrida con `window.scrollTo(0,0)` a primera línea, y envía un `ScrollTrigger.refresh()` (no agresivo) justamente a la micro-transición final con un Evento Dispatch, asegurándote un encuadre perfecto inalterable.

## 🚫 Lecciones de Interfaces y Overlays en SPA (CRÍTICO)

1. **El Defecto del `pointer-events` Fantasma**: Elementos visuales sobrepuestos (como *Custom Cursors* o *Trackers*) que se ocultan solo con `opacity: 0` bloquean los clics e interacciones inferiores porque su property está en `auto`. Todo overlay visual DEBE quemarse obligatoriamente con `pointer-events: none` desde el CSS nativo de Webflow.
2. **Webflow CMS y Clonación Estricta**: Al crear galerías dinámicas, jamás intentes recolectar atributos manuales (ej. `<img src="...">`) para recrearlos. Debes usar OBLIGATORIAMENTE `.cloneNode(true)` para preservar los hooks nativos insertados por Webflow: `srcset` optimizado, CDN rules, y atributos `loading="lazy"`. Hacerlo a la inversa colapsa el rendimiento y destroza la carga responsiva.
3. **Respeto a la Fuente de la Verdad (Zero-Forced-Reflow)**: JAMÁS asumas superioridad técnica creando elementos mágicos con `document.createElement()` o inyectando `gsap.set(el, { position: 'fixed' })` en los scripts de página creyendo parchear layouts vacíos. La "Fuente de la Verdad" visual siempre es el Canvas de Webflow. El trabajo exclusivo de JavaScript es mapear los nodos que Webflow dio a luz; todo reacomodo estructural pesado pertenece al Designer, no al compilador.

## 🚫 Anti-Patrones

1.  **NO usar `sessionStorage` para saludos del loader.** Los saludos van en CADA F5 del home. Barba nunca pasa por `runInitialLoader()`.
2.  **NO poner `pageContext.revert()` en `beforeLeave`.** La página se congela visualmente.
3.  **NO usar `if (isAnimating) return` en funciones de cierre forzado.** Kill + force + animate.
4.  **NO hacer reset instantáneo (snap) visible.** Solo como safety net detrás del loader.
5.  **NO buscar same-page links solo dentro del container de Barba.**

## 💻 Idioma y Documentación
* Todo en **Español**. Código con identificadores en inglés por estándar, pero comentarios en español.

## 🚀 Arquitectura Enterprise para Animaciones

1.  **El Enrutador (Namespaces)**: Usar lógica de Semáforo. En lugar de ejecutar todas las funciones esperando que los escudos (`if (!el)`) actúen, agrupar animaciones en paquetes (`initInicioPage()`) y ejecutarlas exclusivamente leyendo el `namespace` de Webflow (`data-barba-namespace="inicio"`).
2.  **Páginas CMS (Reutilización Absoluta)**: No duplicar scripts para diferentes ítems de CMS. Crear un único paquete abstracto (`initProyectoDetallePage()`). GSAP lee clases, no contenido.
3.  **Física Visual (Sticky Cards)**: Vincular la animación de una tarjeta a la aparición del elemento subsiguiente (`nextCard`) en vez de calcular offsets absolutos propensos a fallos.
4.  **Prevención de FOUC y Race Conditions**: Ocultar elementos en el milisegundo cero usando `gsap.set()`. Condicionar el arranque del Hero usando variables de estado globales (`window.isTransitioning`) **junto con Eventos Personalizados (`pageRevealComplete`)**, evaluando físicamente si la cortina de transición de Barba sigue en movimiento antes de iniciar animaciones.
5.  **DOM Limpio (Layout Thrashing)**: Para prevenir Layout Thrashing, incluir el Footer *dentro* del contenedor de transición de Barba (`[data-barba="container"]`). Solo los elementos verdaderamente fijos (Header/Nav) van fuera.
6.  **Estructura Estricta JS (3 Zonas)**: Dividir archivos en: 1) Recetario (Definición aislada de animaciones), 2) Paquetes (Agrupación para páginas), 3) Semáforo (Enrutador de Barba).
7.  **Selección Estricta de Nodos**: Detener la búsqueda temprano con `querySelector` para nodos únicos. Para colecciones, usar `gsap.utils.toArray(elemento.children)` para congelar el Array en memoria y evitar animar un `HTMLCollection` vivo que causa fallos de índices.
```