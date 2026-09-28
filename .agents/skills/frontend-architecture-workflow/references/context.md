# Contexto del Proyecto ASHICO (IncluyeAudición Bolivia)

## 1. Misión y Dominio de Negocio
* **Organización:** Asociación de Hipoacúsicos Cochabamba (**ASHICO**).
* **Propósito:** Plataforma web de inclusión laboral accesible y bolsa de trabajo especializada para personas con hipoacusia (pérdida auditiva) en Bolivia.
* **Marco Legal y Trámites en Bolivia:**
  * **Ley 223:** Ley General para Personas con Discapacidad en Bolivia (derecho a empleo digno y no discriminación).
  * **Ley 977:** Inserción laboral obligatoria del 4% en el sector público y 2% en el sector privado para personas con discapacidad o tutores.
  * **SIPRUNPCD:** Sistema de Información del Programa de Registro Único Nacional de Personas con Discapacidad (carnet de discapacidad).

## 2. Requerimientos de Accesibilidad (A11y)
* **Canal de Comunicación:** Postulaciones y consultas 100% por chat escrito (WhatsApp / Email), eliminando barreras de llamadas telefónicas.
* **Adaptaciones Laborales Visibles:** Cada oferta de empleo debe listar adaptaciones específicas (señalética luminosa, alarmas visuales, reducción de ruido ambiental, intérprete LSB).
* **Contraste Visual:** Cumplimiento de WCAG AAA con colores primarios oscuros (`#212051`) y acentos de alto contraste (`#ACF7FF`).
* **Navegación Asistida:** Enlaces "Saltar al contenido" (`.skip-to-content`) e interactividad accesible por teclado.

## 3. Stack Tecnológico
* **Framework:** Astro 5 con `output: "static"` (Static Site Generation).
* **Enrutamiento:** `ClientRouter` de Astro (`<ClientRouter />`) para transiciones fluidas de página sin recargas completas.
* **Estilos:** Vanilla CSS modular basado en tokens (`src/styles/tokens.css` y `src/styles/global.css`). Cero dependencias pesadas de CSS.
* **Tipografía:** `Montserrat` (Headings) y `Poppins` (Body).
