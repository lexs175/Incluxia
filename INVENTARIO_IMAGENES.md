# Inventario de imágenes de Eco

> Actualización posterior: las imágenes locales se migraron a Astro. Los archivos activos, sus nombres definitivos y sus ubicaciones para reemplazarlos están en [IMAGENES.md](IMAGENES.md). Este inventario conserva la revisión anterior a esa organización.

Revisión local del 25 de octubre de 2026. Conteo de imágenes distintas, sin sumar cada repetición en tarjetas, avatares o carruseles. No se generaron, editaron ni reemplazaron imágenes.

## Cuenta actual y necesidad de producción

Hay **54 archivos raster y 13 SVG** en `public`. Los 54 raster incluyen seis archivos de logo (tres diseños duplicados), dos copias de la misma foto grupal y una imagen de reserva sin referencias activas (`trabajo.webp`).

La cuenta útil actual es **40 imágenes de contenido distintas en uso + 6 capturas = 46 piezas**, además de la marca y los iconos. Tener un archivo no significa que sea el original ni que corresponda a la persona indicada.

| Uso actual | Imágenes distintas | Qué corresponde usar |
|---|---:|---|
| Personas: perfiles y casos | 20 | Fotos reales de cada persona. Son 19 perfiles y una persona adicional en los casos; tres casos reutilizan fotos de perfiles. |
| Comunidad / inicio | 3 | Material propio de ASHICO: una foto grupal y dos fotos verticales. La foto grupal existe duplicada en dos rutas. |
| Nosotros: portada, misión y visión | 3 | Actividades reales de la institución si se presentan como su trabajo; sustituir las escenas genéricas actuales. |
| Categorías de Contratar | 8 | Imágenes de apoyo generadas o fotografías con procedencia documentada, sin representar una identidad real. |
| Blog | 6 | Ilustración o fotografía editorial; oficinas/CV pueden generarse. En imágenes clínicas y trámites, revisar que el contenido sea fiel al tema. |
| Capturas de la plataforma | 6 | Volver a capturar la interfaz real y actualizada; no generarlas con IA. |

**Equipo institucional:** hay tres posiciones en `AboutTeam.astro`. Diego ya está entre los perfiles; las otras dos posiciones usan fotos atribuidas a otras personas/archivos. Si se mantienen los nombres actuales, hacen falta **dos retratos específicos adicionales**: el plan pasa a **42 imágenes de contenido + 6 capturas = 48 piezas distintas**. Esta es la base de producción, no 48 imágenes nuevas por generar.

**Servicios y autónomos:** los 32 autónomos y los autores de los 32 servicios corresponden a 19 nombres y comparten las fotos de los 19 perfiles. No hacen falta 64 retratos nuevos. Los 32 servicios tampoco tienen portadas propias configuradas: usan las ocho imágenes de categoría como respaldo. Las muestras de trabajos reales de cada profesional serían una fase adicional.

## Origen: lo que se puede y no se puede confirmar

- No encontré un registro de autores, enlaces de origen o procedencia para las fotografías. No se puede certificar por su apariencia si son reales, de internet o generadas.
- Hay **8 fotografías candidatas a material propio/institucional**. La presencia de ASHICO y el contexto permiten priorizarlas para revisión, pero hay que confirmar a quién corresponde cada una.
- Hay **10 retratos cuadrados de 1024 × 1024** con estilo homogéneo y sin procedencia registrada. No deben darse por fotos reales verificadas.
- Hay **5 fotos genéricas de oficina usadas como retratos**: Camila, Javier, Mateo, Luis y María según los nombres de archivo. Se necesitan retratos reales si esos perfiles van a representar personas reales.

### Candidatas a originales que conviene conservar y preparar

| Archivo | Dimensiones | Preparación sugerida |
|---|---:|---|
| `/images/community/comunidad-ashico-triptico.jpg` | 1200 × 1600 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |
| `/images/community/comunidad-ashico-voluntaria.jpg` | 1200 × 1600 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |
| `/images/home/comunidad-ashico.png` | 1600 × 1200 | Conservar como escena institucional; preparar recorte sin eliminar integrantes. |
| `/images/profiles/diego-siles.png` | 1600 × 1200 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |
| `/images/profiles/lucia-salazar.png` | 1200 × 1600 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |
| `/images/profiles/valeria-morales.png` | 662 × 1041 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |
| `/images/stories/historia-destacada-bolivia.png` | 1100 × 825 | Confirmar la persona y el caso; conservar como foto documental del puesto de trabajo. |
| `/images/stories/juan-pablo-claros.png` | 960 × 1280 | Identificar a la persona; preparar recorte de rostro/medio cuerpo y corrección de luz conservando identidad. |

## Problemas de correspondencia que deben resolverse antes de retocar

1. En `AboutTeam.astro`, la foto `comunidad-ashico-triptico.jpg` se presenta como Dra. Gabriela Siles Rocha sin una correspondencia documentada.
2. La foto `juan-pablo-claros.png`, usada en su caso y perfil, también se presenta como Rodrigo Peñaranda en el equipo. No se debe resolver con un retoque; hay que corregir la identidad o conseguir la foto correcta.
3. Luis aparece abreviado como «Luis Mendoza» en casos y como «Luis Mendoza Albarracín» en perfiles; comprobar que se trata de la misma persona.
4. El primer caso tiene un video de ejemplo de Martina, no del nombre del caso. Sigue siendo una demostración; requiere reemplazo por el testimonio correspondiente.
5. Las capturas de Contratar, Publicar y Postulaciones muestran versiones anteriores de la interfaz y deben renovarse.

## Formatos que preparar a partir de originales

| Uso | Entrega recomendada | Criterio |
|---|---|---|
| Avatar de perfil / autor / postulante | Recorte cuadrado 1:1, 512 o 768 px, WebP | La misma persona y el mismo recorte en todos sus contextos. |
| Foto de caso de éxito | Horizontal de trabajo, idealmente 1600 px de ancho, o conservar formato documental si el original no permite recorte | No inventar personas, empresas ni sucesos con IA. |
| Comunidad / institución | Original de mayor tamaño, variantes horizontales según el contenedor | Proteger caras y contexto; no ampliar artificialmente fotos pequeñas para simular detalle. |
| Categorías de Contratar | Ocho composiciones coherentes, máster horizontal 4:3 o 3:2 | Dejar espacio de recorte y de texto; fotografías de actividad/objetos, sin marcas ni retratos de supuestos profesionales. |
| Blog | Horizontal 16:9, máster de aproximadamente 1600 px | Ilustrar el tema sin convertirlo en evidencia de un caso o institución. |
| Capturas | Capturas reales actualizadas, base de 1440 × 1000 | No confundirlas con fotografía ni hacerlas con IA. |

**Retoque de fotos reales:** se puede mejorar exposición, ruido, equilibrio de color, fondo y encuadre. Deben conservarse el rostro, la edad aparente, los rasgos y el contexto relevante. Si falta detalle por resolución, pedir el original de cámara antes de una mejora generativa.

## Lista de personas en perfiles

| Persona en los datos | Foto actual | Revisión |
|---|---|---|
| Valeria Morales Terán | `/images/profiles/valeria-morales.png` | Candidata a original; confirmar identidad |
| Javier Mercado Rocha | `/images/profiles/javier-mercado.jpg` | Genérica de oficina; reemplazar por retrato real |
| Camila Rojas Claure | `/images/profiles/camila-rojas.jpg` | Genérica de oficina; reemplazar por retrato real |
| Diego Siles Montaño | `/images/profiles/diego-siles.png` | Candidata a original; confirmar identidad |
| Lucía Salazar Pinto | `/images/profiles/lucia-salazar.png` | Candidata a original; confirmar identidad |
| Mateo Peñaranda Alarcón | `/images/profiles/mateo-penaranda.jpg` | Genérica de oficina; reemplazar por retrato real |
| Andrea Torrico Suárez | `/images/profiles/andrea-torrico.jpg` | Retrato sin procedencia confirmada |
| Alex Quispe Mamani | `/images/profiles/alex-quispe.jpg` | Retrato sin procedencia confirmada |
| Rodrigo Vargas Choque | `/images/profiles/rodrigo-vargas.jpg` | Retrato sin procedencia confirmada |
| Fernando Gutiérrez Rios | `/images/profiles/fernando-gutierrez.jpg` | Retrato sin procedencia confirmada |
| Gabriela Choque Flores | `/images/profiles/gabriela-choque.jpg` | Retrato sin procedencia confirmada |
| Luis Mendoza Albarracín | `/images/stories/luis-mendoza.png` | Genérica de oficina; reemplazar por retrato real |
| Juan Pablo Claros | `/images/stories/juan-pablo-claros.png` | Candidata a original; confirmar identidad |
| Claudia Arce Montaño | `/images/profiles/claudia-arce.jpg` | Retrato sin procedencia confirmada |
| María René Morales | `/images/stories/maria-rene-morales.png` | Genérica de oficina; reemplazar por retrato real |
| Melissa Arteaga Tórrez | `/images/profiles/melissa-arteaga.jpg` | Retrato sin procedencia confirmada |
| Patricia Soliz Guzmán | `/images/profiles/patricia-soliz.jpg` | Retrato sin procedencia confirmada |
| Carlos Mendoza Villarroel | `/images/profiles/carlos-mendoza.jpg` | Retrato sin procedencia confirmada |
| Sergio Mamani Calle | `/images/profiles/sergio-mamani.jpg` | Retrato sin procedencia confirmada |

## Casos de éxito

| Persona en los datos | Foto actual | Observación |
|---|---|---|
| Luis Mendoza | `/images/stories/luis-mendoza.png` | Foto genérica pequeña; conseguir material de la persona/caso real |
| María René Morales | `/images/stories/maria-rene-morales.png` | Foto genérica pequeña; conseguir material de la persona/caso real |
| Juan Pablo Claros | `/images/stories/juan-pablo-claros.png` | Candidata a original; confirmar que corresponde al testimonio |
| Carla Rodríguez Vaca | `/images/stories/historia-destacada-bolivia.png` | Candidata a original; confirmar que corresponde al testimonio |

## Orden de trabajo propuesto

1. Confirmar las personas y los casos que realmente se publicarán; identificar las ocho fotos candidatas a originales.
2. Preparar primero los retratos y fotos documentales correctos, con versiones adecuadas a cada contenedor.
3. Definir una sola dirección visual para las ocho categorías de Contratar y producirlas como conjunto.
4. Sustituir las tres escenas genéricas de Nosotros por material institucional correspondiente y revisar las seis imágenes de blog.
5. Actualizar las seis capturas después de estabilizar las pantallas.

## Evidencia local

- `artifacts/image-audit/inventory.json`: archivos, dimensiones, peso, duplicados y referencias por código/datos.
- `artifacts/image-audit/persons.jpg`: hoja de contacto de perfiles y casos.
- `artifacts/image-audit/editorial.jpg`: comunidad, Nosotros, blog y categorías.
- `artifacts/image-audit/branding.jpg`: marca y recursos de raíz.
- `artifacts/image-audit/screens.jpg`: seis capturas actuales.

La revisión utiliza los archivos locales y su uso en el código; no se hizo una búsqueda de procedencia en internet ni se editaron los originales.
