# Inventario de imágenes del sitio activo

Revisado el 25 de octubre de 2026 en los archivos guardados del proyecto, sus referencias, dimensiones, hashes y vistas de conjunto. Blog y Nosotros están archivados y quedan fuera de este plan.

Lista operativa por archivo, con edición, generación y prioridad: [LISTA_EDICION_Y_GENERACION.md](LISTA_EDICION_Y_GENERACION.md).

## Cantidades

En `public/images/` quedan 48 archivos raster y 44 contenidos distintos. Al separar logos, seis capturas de ejemplo y `trabajo.webp` sin uso, hay **34 imágenes distintas de contenido utilizadas por las páginas activas**:

| Grupo actual | Imágenes distintas | Reutilización |
| --- | ---: | --- |
| Personas de perfiles y casos | 20 | 19 perfiles y 4 casos; tres casos comparten foto con un perfil. Los autores de servicios reutilizan esos retratos. |
| Categorías de Contratar | 8 | También cubren las 32 tarjetas de servicios; no hay 32 portadas específicas. |
| Otras fotos de la galería | 6 | Tres de `about/`, dos de `community/` y una grupal de ASHICO. |

La galería tiene nueve posiciones por vuelta, pero solo ocho fotos distintas: incluye las seis anteriores y dos de testimonios. La repetición técnica para el movimiento no requiere fotos nuevas. Las dos posiciones de la portada muestran la misma foto grupal.

## Paquete de trabajo propuesto

**37 imágenes maestras de contenido**, aprovechando las que sirvan; esta cifra no significa 37 imágenes nuevas:

| Material | Cantidad | Criterio |
| --- | ---: | --- |
| Personas | 20 | Una foto correcta por identidad del catálogo actual: 19 perfiles más el cuarto caso que no tiene perfil. En los casos de éxito, una toma de la persona trabajando que admita también un recorte de rostro cuando corresponda. |
| Comunidad y trabajo | 9 | Nueve tomas distintas para la galería. Reutilizar dos de ellas en la portada, con encuadres diferentes. Escenas reales de trabajo, talleres o actividades de la comunidad. |
| Categorías | 8 | Conservar Diseño Gráfico de Figma. Preparar las otras siete con un criterio visual común; pueden ser generadas porque representan especialidades, no testimonios de personas. |

Además quedan **6 capturas de la plataforma para renovar al final**, como pidió Lex. No se producen todavía. No hacen falta imágenes para las portadas azules de perfiles ni fotos adicionales por cada repetición de un autor en tarjetas. Las publicaciones nuevas recibirán el material de su autor; no se presupuestan como un catálogo adicional fijo.

Los 20 nombres son los del contenido de demostración actual. Antes de presentar perfiles y testimonios como reales hay que confirmar a quién corresponde cada foto; el nombre del archivo no lo demuestra. La cantidad final puede variar si cambia ese catálogo.

## Procedencia comprobable

- **7 imágenes de categorías son de Unsplash**, según `artifacts/hiring/asset-sources.json`. No están documentadas como generadas por IA.
- **1 imagen de categoría viene del diseño de Figma**: `categories/diseno-grafico.png`. Mantenerla.
- **8 tomas muestran material de ASHICO o fotografías locales vinculadas a la comunidad** y son candidatas a conservar y preparar. Esto no confirma los nombres asignados en la web ni que los archivos disponibles sean originales de cámara.
- Los otros **18 archivos de contenido no tienen una fuente documentada en el repositorio**: diez retratos cuadrados de 1024 px, cinco fotos de personas usadas en perfiles/casos y tres fotos genéricas de oficina. No afirmar que son usuarios reales, que son de un banco concreto o que fueron generados solo por su apariencia.

## Primer lote: ocho fotos existentes para revisar y preparar

| Archivo actual | Dimensiones | Preparación propuesta |
| --- | --- | --- |
| `hero-ashico-cochabamba.jpg` | 1600 × 1200 | Foto grupal: corregir luz y color, conservar contexto; no sirve como fuente de retratos individuales de calidad. Es idéntica a `home/comunidad-ashico.png`. |
| `community/comunidad-ashico-voluntaria.jpg` | 1200 × 1600 | Mejorar luz/color y encuadre vertical. El cartel tiene protagonismo; no cuenta como escena de trabajo. |
| `community/comunidad-ashico-triptico.jpg` | 1200 × 1600 | Igual criterio; confirmar identidad antes de usarla como retrato de un perfil. |
| `profiles/valeria-morales.jpg` | 662 × 1041 | Recorte de cabeza y hombros, equilibrar fondo y luz. Priorizar una copia de mayor calidad si existe. |
| `profiles/lucia-salazar.jpg` | 1200 × 1600 | Recorte de rostro para avatar; conservar una versión de actividad con el cartel. |
| `profiles/diego-siles.jpg` | 1600 × 1200 | Encuadrar cabeza/hombros, corregir luz y fondo sin cambiar la persona. |
| `stories/juan-pablo-claros.jpg` | 960 × 1280 | Preparar retrato; para el caso de éxito conviene otra toma trabajando. No forzar esta foto vertical a una portada horizontal. |
| `stories/historia-destacada-bolivia.jpg` | 1100 × 825 | Conservar el contexto de oficina; preparar recorte para tarjeta. Buscar el archivo de mayor calidad para el detalle grande. |

La mejora con IA debe conservar la identidad y la actividad fotografiada. Preparar versiones derivadas manteniendo intacto el archivo recibido. Una foto pequeña de rostro no se convierte en un original nítido por exportarla a más píxeles.

## Fotos que requieren reemplazo o confirmación

| Archivo o grupo | Problema detectado | Acción |
| --- | --- | --- |
| `stories/luis-mendoza.jpg` | 588 × 375; imagen genérica de oficina, identidad sin comprobar. | Confirmar foto y persona; conseguir una toma mayor para el caso real. |
| `stories/maria-rene-morales.jpg` | 588 × 393; identidad sin comprobar. | Igual criterio; no basar una portada grande en esta copia pequeña. |
| `profiles/camila-rojas.jpg` | Persona fotografiada de espaldas. | Sustituir el avatar por un retrato correcto. |
| `profiles/javier-mercado.jpg` | Escena amplia de 740 × 493; rostro pequeño. | Conseguir un retrato adecuado, no ampliar el recorte de esa escena. |
| `profiles/mateo-penaranda.jpg` | Escena oscura; rostro poco visible. | Sustituir por un retrato con rostro legible. |
| Diez retratos cuadrados | Alex, Andrea, Carlos, Claudia, Fernando, Gabriela, Melissa, Patricia, Rodrigo y Sergio; no tienen procedencia documentada. Pesan aproximadamente 649–823 KB cada uno. | Mantener como material de demostración hasta confirmar o reemplazar con las fotos reales. Optimizar el peso después de la selección. |
| `about/equipo-colaboracion.jpg`, `mision-profesional.jpg`, `vision-trabajo.jpg` | 588 px de ancho; imágenes genéricas todavía usadas en la galería del inicio. | Reemplazar con escenas reales del lote de comunidad. Su carpeta permanece activa solo por este uso. |

## Formatos de entrega propuestos

- **Retrato:** fuente con rostro visible y espacio alrededor; derivar un recorte cuadrado de 512 × 512 para avatares. Mantener ojos y cabeza dentro del recorte circular que aplica la interfaz.
- **Caso de éxito:** preferir fuente horizontal de al menos 1600 px de ancho, conservando a la persona y su entorno de trabajo. Adaptar a tarjeta y detalle con recortes separados.
- **Portada:** fuente horizontal de alrededor de 2000 px de ancho cuando esté disponible. Las dos cajas tienen proporciones distintas; preparar el encuadre para cada una.
- **Galería:** mezcla de tomas verticales y horizontales con espacio para recortar, evitando carteles cortados y rostros fuera del encuadre.
- **Categorías:** fuentes de alrededor de 1400 px de ancho con zona central útil, porque la tarjeta de categoría y la de servicio tienen recortes distintos.

El tamaño de exportación no sustituye la calidad del original. Optimizar las versiones web después de elegir el material y comprobar sus recortes en el sitio.

## Archivos de revisión

- `codex-inventory.json`: dimensiones, tamaños, hashes y archivos fuente que referencian cada imagen después del archivo de páginas.
- `personas.png`: vista conjunta de los 20 archivos de personas.
- `contenido.png`: vista conjunta de las demás imágenes de contenido que quedan en el sitio.
- `archive/inactive-pages/manifest.json`: listado de los 20 archivos archivados de Blog y Nosotros con sus hashes verificados.

No se han retocado ni sustituido las fotos del sitio durante esta revisión.
