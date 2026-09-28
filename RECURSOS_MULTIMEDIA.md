# Lista de Fotos, Videos y Arquitectura de Información
## Proyecto: IncluyeAudición / ASHICO Cochabamba

> **📌 Reglas básicas para enviar el material:**
> 1. **Fotos:** Enviar en **PNG o calidad original de cámara**, en bruto y **sin recortar** (con espacio alrededor de las personas). Enviar por Google Drive o WeTransfer.
> 2. **Videos:** Grabar con celular o cámara en posición **HORIZONTAL** (acostado), con buena luz de frente y audio claro.

---

## 📸 1. Inventario de Fotos y Videos

### 1.1. Logos de la Institución
| Elemento | Formato | Cómo debe entregarse |
| :--- | :--- | :--- |
| **Logo Oficial** | PNG transparente | Con fondo transparente para colocarlo sobre fondo blanco. |
| **Logo en Blanco** | PNG transparente | Todo en color blanco para colocarlo sobre fondo oscuro. |

---

### 1.2. Portada Principal (Página de Inicio)
| Elemento | Tipo | Qué debe mostrar la foto / video |
| :--- | :--- | :--- |
| **Foto Principal de Portada** | Foto (PNG) | Persona con hipoacusia (con audífono o implante visible de forma natural) trabajando concentrada en laptop o ambiente de oficina. |
| **Video de Presentación** *(Opcional)* | Video Horizontal | Video corto explicando el trabajo de ASHICO con apoyo de Lengua de Señas Boliviana (LSB). |

---

### 1.3. Casos de Éxito y Testimonios Reales
| Caso / Persona | Tipo | Qué debe mostrar |
| :--- | :--- | :--- |
| **Luis Mendoza** *(Área Tecnología)* | **Foto (PNG)** | Luis en su puesto de trabajo frente a su computadora/laptop. |
| | **Video Horizontal** | Video corto contando su experiencia y cómo trabaja por escrito. |
| **María René Morales** *(Área Diseño)* | **Foto (PNG)** | María René en su espacio de trabajo, diseño o agencia creativa. |
| | **Video Horizontal** | Video corto contando su experiencia profesional y superación. |
| **Juan Pablo Claros** *(Área Finanzas)* | **Foto (PNG)** | Juan Pablo en oficina o escritorio corporativo/contable. |
| | **Video Horizontal** | Video corto sobre su concentración y trabajo en finanzas. |
| **Intérprete de Lengua de Señas** | **Foto (PNG)** | Foto de medio cuerpo o rostro de un/a intérprete con fondo liso. |

---

### 1.4. Fotos para Artículos Informativos
| Artículo / Tema | Tipo | Qué debe mostrar la foto |
| :--- | :--- | :--- |
| **1. Leyes e Inclusión Laboral** | Foto (PNG) | Firma de contrato de trabajo o reunión laboral formal en Bolivia. |
| **2. Tipos de Pérdida Auditiva** | Foto (PNG) | Audífonos modernos, examen de audiometría o consulta audiológica. |
| **3. Comunicación en Equipos** | Foto (PNG) | Personas en reunión colaborando, mirándose de frente o en computadoras. |
| **4. Carnet de Discapacidad (SEDES)** | Foto (PNG) | Carpeta de documentos de trámite, carnet o centro de salud. |
| **5. Adaptaciones en Oficina** | Foto (PNG) | Escritorio ordenado con doble pantalla, buena luz y chat de trabajo. |
| **6. Consejos para CV y Entrevistas** | Foto (PNG) | Persona redactando su currículum en laptop con celular al lado. |

---

### 1.5. Sobre Nosotros (ASHICO Cochabamba)
| Elemento | Tipo | Qué debe mostrar la foto |
| :--- | :--- | :--- |
| **Sede / Actividades en Cochabamba** | Foto (PNG) | Fachada de la Casa Victor Mercier o foto de talleres/reuniones de la comunidad. |
| **Equipo / Directiva de ASHICO** | Foto (PNG) | Foto grupal de los directivos y profesionales de la asociación. |

---

## 🗺️ 2. Arquitectura de Información del Sitio Web (Sitemap)

Estructura completa de páginas, secciones y contenidos de la plataforma web:

### 2.1. Mapa General de Páginas y URLs

```text
├── / (Inicio / Portada Principal)
├── /empleos (Bolsa de Trabajo Inclusiva)
│   └── /empleos/[slug] (Ficha de Empleo & Postulación por WhatsApp)
├── /casos-de-exito (Historias de Inclusión & Testimonios)
│   └── /casos-de-exito/[slug] (Video Testimonial con Intérprete LSB)
├── /blog (Guías Informativas, Leyes y Salud Auditiva)
│   └── /blog/[slug] (Artículo Completo con Video LSB)
└── /nosotros (Asociación ASHICO, Guía de Carnet SIPRUNPCD y Sede)
```

---

### 2.2. Detalle de Contenido por Página

| Página | URL | Objetivo Principal | Secciones que la componen |
| :--- | :--- | :--- | :--- |
| **1. Inicio** | `/` | Presentar la plataforma, conectar postulantes con empresas y generar confianza. | • **Hero:** Título de impacto, botón de acción y foto principal.<br>• **Buscador Rápido:** Filtro por ciudad y área laboral.<br>• **Pilares:** Comunicación 100% escrita, Ley 223/977 y respaldo ASHICO.<br>• **Empleos Destacados:** 4 vacantes recientes con tags accesibles.<br>• **Historias Destacadas:** 3 testimonios reales de superación.<br>• **Blog Destacado:** Últimas 3 guías y artículos legales.<br>• **Banner de Contacto:** Botón directo a WhatsApp de ASHICO. |
| **2. Bolsa de Empleos** | `/empleos` | Explorar vacantes laborales verificadas y adaptadas para personas con hipoacusia. | • **Filtros Interactivos:** Por modalidad (Presencial, Remoto, Híbrido) y Ciudad (Cochabamba, Santa Cruz, La Paz).<br>• **Lista de Vacantes:** Tarjetas con requisitos, departamento y sello de "Contacto 100% por Chat". |
| **2.1. Detalle de Empleo** | `/empleos/[slug]` | Informar en detalle sobre el puesto y permitir postulación directa. | • **Cabecera del Cargo:** Empresa, ciudad, tipo de contrato y fecha.<br>• **Puntos Clave de Accesibilidad:** Selección sin llamadas, manuales visuales y entorno sin ruido.<br>• **Funciones y Requisitos:** Detalle de tareas y solicitud de Carnet Ley 223.<br>• **Botón de Postulación:** Enlace directo con mensaje prellenado a WhatsApp. |
| **3. Casos de Éxito** | `/casos-de-exito` | Inspirar a postulantes y sensibilizar a empresas con testimonios reales. | • **Filtros por Área:** Tecnología, Diseño Gráfico, Finanzas.<br>• **Galería de Historias:** Tarjetas con foto, frase inspiradora y duración del video con LSB. |
| **3.1. Detalle de Caso** | `/casos-de-exito/[slug]` | Mostrar la historia completa en video accesible. | • **Reproductor de Video:** Con subtítulos, cita destacada e Intérprete LSB.<br>• **Reseña Narrativa:** Trayectoria laboral y adaptaciones que hizo la empresa.<br>• **Compartir:** Botón para compartir el testimonio en redes. |
| **4. Blog & Guías** | `/blog` | Educar sobre derechos laborales (Ley 223/977), salud auditiva y consejos. | • **Filtros por Categoría:** Leyes y Derechos Bolivia, Salud Auditiva, Consejos para Empresas.<br>• **Listado de Artículos:** Tarjetas con imagen, fecha, autor y tiempo de lectura. |
| **4.1. Detalle de Artículo** | `/blog/[slug]` | Lectura profunda con soporte audiovisual accesible. | • **Imagen Destacada:** Portada del artículo.<br>• **Video LSB:** Video explicativo con señas y subtítulos.<br>• **Cuerpo del Artículo:** Texto redactado con subtítulos y recomendaciones.<br>• **Artículos Relacionados:** Recomendaciones al pie de página. |
| **5. Sobre Nosotros** | `/nosotros` | Respaldar la credibilidad de ASHICO y orientar en trámites legales. | • **Misión y Visión:** Objetivos de inclusión en Bolivia.<br>• **Guía de Trámite Carnet SIPRUNPCD:** Pasos y requisitos en SEDES Cochabamba.<br>• **Marco Legal:** Resumen de beneficios de la Ley 223 y Ley 977.<br>• **Sede Física y Mapa:** Dirección en Casa Victor Mercier con mapa de Google Maps.<br>• **Canales de Atención:** WhatsApp directo y horario de atención. |

---

### 2.3. Flujos de Usuario Principales (User Flows)

1. **Persona con Hipoacusia que busca Trabajo:**
   `Inicio` ➔ `Bolsa de Empleos (/empleos)` ➔ Selecciona Vacante ➔ Revisa que el puesto no requiere llamadas de audio ➔ Clic en `Postular por WhatsApp` (se envía mensaje automático con sus datos).

2. **Persona o Familiar que necesita tramitar su Carnet de Discapacidad:**
   `Inicio` o Menú ➔ `Sobre Nosotros (/nosotros#tramites)` ➔ Lee los 4 pasos y requisitos del SIPRUNPCD en SEDES ➔ Escribe al WhatsApp de ASHICO para orientación gratuita.

3. **Empresa o Reclutador que desea contratar bajo Ley 223 / Ley 977:**
   `Inicio` o `Blog` ➔ Lee artículos de `Comunicación Inclusiva` o `Leyes 223 y 977` ➔ Revisa `Casos de Éxito` ➔ Clic en `Contactar a ASHICO por WhatsApp` para publicar una vacante accesible.
