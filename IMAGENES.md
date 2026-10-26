# Imágenes del sitio: archivos para reemplazar

Todos los archivos maestros activos están en `src/assets/images/`. Las imágenes que deben cambiar de forma independiente tienen archivos separados. No se copiaron indiscriminadamente las imágenes que ya eran distintas.

Para sustituir una imagen, reemplaza **el archivo señalado, manteniendo su nombre y extensión**, y ejecuta `npm run build`. Astro leerá las dimensiones nuevas y generará sus variantes WebP. No se editan `dist/`, los archivos con hash ni las rutas de los componentes. Conserva una copia de la fotografía recibida antes de retocarla.

Los 32 servicios tienen su portada propia. Se conservan los ocho maestros PNG existentes y se incorporaron las otras 24 imágenes recibidas, agrupadas de cuatro en cuatro por categoría y asignadas según el contenido de cada servicio. Estas últimas mantienen sus rutas WebP mediante una conversión sin pérdida, sin reducir las dimensiones ni cambiar los píxeles; Astro genera después las variantes de entrega. Los PNG recibidos y la relación entre números, servicios y archivos se conservan en `archive/maintenance-2026-10-26/media-sources/service-image-import/` y `archive/maintenance-2026-10-26/provenance/service-image-import/`. Las imágenes originales y copias anteriores de `public/` están archivadas en `archive/image-assets-before-astro/`, con hashes verificados.

Un mismo avatar se reutiliza en el menú, las tarjetas y los servicios de esa persona. Los tres avatares que compartían el archivo de una historia tienen ahora su copia independiente: cambiar el caso no cambia su retrato. Cada caso conserva una imagen compartida entre su listado y su detalle. Las dos vueltas de la galería reutilizan intencionadamente sus nueve posiciones; no necesitan dieciocho fotos.

## Portadas de los 32 servicios

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| serv-1 · Diseño de Identidad Visual y Logotipo Profesional | [services/diseno-grafico/identidad-visual-v2.png](src/assets/images/services/diseno-grafico/identidad-visual-v2.png) | Portada propia del servicio |
| serv-2 · Pack de 12 Piezas Gráficas para Redes Sociales | [services/diseno-grafico/piezas-redes-sociales-v2.png](src/assets/images/services/diseno-grafico/piezas-redes-sociales-v2.png) | Portada propia del servicio |
| serv-3 · Diseño de Packaging y Etiquetas de Producto | [services/diseno-grafico/packaging-producto-v2.png](src/assets/images/services/diseno-grafico/packaging-producto-v2.png) | Portada propia del servicio |
| serv-4 · Manual de Marca y Guía de Estilo Corporativo | [services/diseno-grafico/manual-marca-v2.png](src/assets/images/services/diseno-grafico/manual-marca-v2.png) | Portada propia del servicio |
| serv-5 · Optimización, Limpieza y Mantenimiento de Software Remoto | [services/sistemas-ti/mantenimiento-remoto-v1.png](src/assets/images/services/sistemas-ti/mantenimiento-remoto-v1.png) | Portada propia del servicio |
| serv-6 · Configuración Segura de Redes LAN y Wi-Fi de Oficina | [services/sistemas-ti/redes-lan-wifi-v1.png](src/assets/images/services/sistemas-ti/redes-lan-wifi-v1.png) | Portada propia del servicio |
| serv-7 · Soporte Helpdesk Mensual por Chat para Empresas (Hasta 10 PCs) | [services/sistemas-ti/helpdesk-chat-v1.png](src/assets/images/services/sistemas-ti/helpdesk-chat-v1.png) | Portada propia del servicio |
| serv-8 · Instalación y Parametrización de Software Corporativo y Antivirus | [services/sistemas-ti/instalacion-software-v1.png](src/assets/images/services/sistemas-ti/instalacion-software-v1.png) | Portada propia del servicio |
| serv-9 · Conciliación Bancaria y Cierre Mensual de Facturación | [services/contabilidad-finanzas/serv-9-conciliacion-bancaria-y-cierre-mensual-de-facturacion.webp](src/assets/images/services/contabilidad-finanzas/serv-9-conciliacion-bancaria-y-cierre-mensual-de-facturacion.webp) | Portada propia del servicio |
| serv-10 · Emisión y Registro de Facturación Electrónica SIAT | [services/contabilidad-finanzas/serv-10-emision-y-registro-de-facturacion-electronica-siat.webp](src/assets/images/services/contabilidad-finanzas/serv-10-emision-y-registro-de-facturacion-electronica-siat.webp) | Portada propia del servicio |
| serv-11 · Armado de Libros de Compras y Ventas IVA para Negocios | [services/contabilidad-finanzas/serv-11-armado-de-libros-de-compras-y-ventas-iva-para-negocios.webp](src/assets/images/services/contabilidad-finanzas/serv-11-armado-de-libros-de-compras-y-ventas-iva-para-negocios.webp) | Portada propia del servicio |
| serv-12 · Planilla de Sueldos y Aportes Patronales (Hasta 15 dependientes) | [services/contabilidad-finanzas/serv-12-planilla-de-sueldos-y-aportes-patronales-hasta-15-dependientes.webp](src/assets/images/services/contabilidad-finanzas/serv-12-planilla-de-sueldos-y-aportes-patronales-hasta-15-dependientes.webp) | Portada propia del servicio |
| serv-13 · Digitación y Transcripción Masiva de Documentos (Hasta 150 páginas) | [services/digitacion-datos/serv-13-digitacion-y-transcripcion-masiva-de-documentos-hasta-150-paginas.webp](src/assets/images/services/digitacion-datos/serv-13-digitacion-y-transcripcion-masiva-de-documentos-hasta-150-paginas.webp) | Portada propia del servicio |
| serv-14 · Limpieza y Normalización de Bases de Datos en Excel / Google Sheets | [services/digitacion-datos/serv-14-limpieza-y-normalizacion-de-bases-de-datos-en-excel-google-sheets.webp](src/assets/images/services/digitacion-datos/serv-14-limpieza-y-normalizacion-de-bases-de-datos-en-excel-google-sheets.webp) | Portada propia del servicio |
| serv-15 · Digitalización e Indexación de Archivos Físicos a PDF Buscable | [services/digitacion-datos/serv-15-digitalizacion-e-indexacion-de-archivos-fisicos-a-pdf-buscable.webp](src/assets/images/services/digitacion-datos/serv-15-digitalizacion-e-indexacion-de-archivos-fisicos-a-pdf-buscable.webp) | Portada propia del servicio |
| serv-16 · Captura Masiva de Formularios e Inventarios Comerciales | [services/digitacion-datos/serv-16-captura-masiva-de-formularios-e-inventarios-comerciales.webp](src/assets/images/services/digitacion-datos/serv-16-captura-masiva-de-formularios-e-inventarios-comerciales.webp) | Portada propia del servicio |
| serv-17 · Gestión Mensual de Redes Sociales: 16 Publicaciones + Atención por Chat | [services/redes-sociales/serv-17-gestion-mensual-de-redes-sociales-16-publicaciones-atencion-por-chat.webp](src/assets/images/services/redes-sociales/serv-17-gestion-mensual-de-redes-sociales-16-publicaciones-atencion-por-chat.webp) | Portada propia del servicio |
| serv-18 · Parrilla Mensual de Contenido con 20 Ideas y Guiones Escritos | [services/redes-sociales/serv-18-parrilla-mensual-de-contenido-con-20-ideas-y-guiones-escritos.webp](src/assets/images/services/redes-sociales/serv-18-parrilla-mensual-de-contenido-con-20-ideas-y-guiones-escritos.webp) | Portada propia del servicio |
| serv-19 · Diseño de 10 Carruseles Educativos de Alto Alcance para Instagram | [services/redes-sociales/serv-19-diseno-de-10-carruseles-educativos-de-alto-alcance-para-instagram.webp](src/assets/images/services/redes-sociales/serv-19-diseno-de-10-carruseles-educativos-de-alto-alcance-para-instagram.webp) | Portada propia del servicio |
| serv-20 · Moderación y Respuesta de Mensajes por WhatsApp y DMs (1 mes) | [services/redes-sociales/serv-20-moderacion-y-respuesta-de-mensajes-por-whatsapp-y-dms-1-mes.webp](src/assets/images/services/redes-sociales/serv-20-moderacion-y-respuesta-de-mensajes-por-whatsapp-y-dms-1-mes.webp) | Portada propia del servicio |
| serv-21 · Creación de Landing Page Moderna de Alta Conversión y Accesible | [services/desarrollo-web/serv-21-creacion-de-landing-page-moderna-de-alta-conversion-y-accesible.webp](src/assets/images/services/desarrollo-web/serv-21-creacion-de-landing-page-moderna-de-alta-conversion-y-accesible.webp) | Portada propia del servicio |
| serv-22 · Desarrollo de Sitio Web Corporativo en WordPress (5 Secciones) | [services/desarrollo-web/serv-22-desarrollo-de-sitio-web-corporativo-en-wordpress-5-secciones.webp](src/assets/images/services/desarrollo-web/serv-22-desarrollo-de-sitio-web-corporativo-en-wordpress-5-secciones.webp) | Portada propia del servicio |
| serv-23 · Optimización de Velocidad y Auditoría de Accesibilidad Web WCAG | [services/desarrollo-web/serv-23-optimizacion-de-velocidad-y-auditoria-de-accesibilidad-web-wcag.webp](src/assets/images/services/desarrollo-web/serv-23-optimizacion-de-velocidad-y-auditoria-de-accesibilidad-web-wcag.webp) | Portada propia del servicio |
| serv-24 · Maquetación Responsive HTML5/CSS3 desde Diseño de Figma | [services/desarrollo-web/serv-24-maquetacion-responsive-html5-css3-desde-diseno-de-figma.webp](src/assets/images/services/desarrollo-web/serv-24-maquetacion-responsive-html5-css3-desde-diseno-de-figma.webp) | Portada propia del servicio |
| serv-25 · Ilustración de Mascota o Personaje Corporativo de Marca | [services/ilustracion-arte/serv-25-ilustracion-de-mascota-o-personaje-corporativo-de-marca.webp](src/assets/images/services/ilustracion-arte/serv-25-ilustracion-de-mascota-o-personaje-corporativo-de-marca.webp) | Portada propia del servicio |
| serv-26 · Pack de 15 Iconos Vectoriales Personalizados para Web y App | [services/ilustracion-arte/serv-26-pack-de-15-iconos-vectoriales-personalizados-para-web-y-app.webp](src/assets/images/services/ilustracion-arte/serv-26-pack-de-15-iconos-vectoriales-personalizados-para-web-y-app.webp) | Portada propia del servicio |
| serv-27 · Diseño de Infografía Educativa y Visual de Gran Formato | [services/ilustracion-arte/serv-27-diseno-de-infografia-educativa-y-visual-de-gran-formato.webp](src/assets/images/services/ilustracion-arte/serv-27-diseno-de-infografia-educativa-y-visual-de-gran-formato.webp) | Portada propia del servicio |
| serv-28 · Pack de Stickers Digitales Personalizados para WhatsApp y Telegram | [services/ilustracion-arte/serv-28-pack-de-stickers-digitales-personalizados-para-whatsapp-y-telegram.webp](src/assets/images/services/ilustracion-arte/serv-28-pack-de-stickers-digitales-personalizados-para-whatsapp-y-telegram.webp) | Portada propia del servicio |
| serv-29 · Pack de 5 Reels / TikToks con Subtítulos Dinámicos y Efectos | [services/edicion-video/serv-29-pack-de-5-reels-tiktoks-con-subtitulos-dinamicos-y-efectos.webp](src/assets/images/services/edicion-video/serv-29-pack-de-5-reels-tiktoks-con-subtitulos-dinamicos-y-efectos.webp) | Portada propia del servicio |
| serv-30 · Subtitulado Accesible y Sincronizado para Videos de Hasta 15 Minutos | [services/edicion-video/serv-30-subtitulado-accesible-y-sincronizado-para-videos-de-hasta-15-minutos.webp](src/assets/images/services/edicion-video/serv-30-subtitulado-accesible-y-sincronizado-para-videos-de-hasta-15-minutos.webp) | Portada propia del servicio |
| serv-31 · Edición Completa de Video Institucional o Entrevista (Hasta 5 Min) | [services/edicion-video/serv-31-edicion-completa-de-video-institucional-o-entrevista-hasta-5-min.webp](src/assets/images/services/edicion-video/serv-31-edicion-completa-de-video-institucional-o-entrevista-hasta-5-min.webp) | Portada propia del servicio |
| serv-32 · Creación de Video Promocional Animado para Redes Sociales (30 seg) | [services/edicion-video/serv-32-creacion-de-video-promocional-animado-para-redes-sociales-30-seg.webp](src/assets/images/services/edicion-video/serv-32-creacion-de-video-promocional-animado-para-redes-sociales-30-seg.webp) | Portada propia del servicio |

## Ocho categorías

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Diseño Gráfico | [categories/diseno-grafico.png](src/assets/images/categories/diseno-grafico.png) | Diseño aprobado conservado |
| Sistemas & Soporte TI | [categories/sistemas-ti.webp](src/assets/images/categories/sistemas-ti.webp) | Imagen existente; reemplazable por separado |
| Contabilidad & Facturación | [categories/contabilidad-finanzas.webp](src/assets/images/categories/contabilidad-finanzas.webp) | Imagen existente; reemplazable por separado |
| Digitación & Archivo de Datos | [categories/digitacion-datos.webp](src/assets/images/categories/digitacion-datos.webp) | Imagen existente; reemplazable por separado |
| Redes Sociales & Contenido | [categories/redes-sociales.webp](src/assets/images/categories/redes-sociales.webp) | Imagen existente; reemplazable por separado |
| Desarrollo Web & Landing Pages | [categories/desarrollo-web.webp](src/assets/images/categories/desarrollo-web.webp) | Imagen existente; reemplazable por separado |
| Ilustración & Arte Digital | [categories/ilustracion-arte.webp](src/assets/images/categories/ilustracion-arte.webp) | Imagen existente; reemplazable por separado |
| Edición Audiovisual & Subtítulos | [categories/edicion-video.webp](src/assets/images/categories/edicion-video.webp) | Imagen existente; reemplazable por separado |

Las fotos del inicio se actualizaron el 26 de octubre de 2026 con los diez PNG recibidos en la carpeta home. Se conserva además una foto de ASHICO en la galería. Los PNG se copiaron íntegros, sin recompresión ni reducción de tamaño; Astro genera sus versiones WebP. Las imágenes sustituidas y la relación de archivos recibidos están en `archive/home-images-before-2026-10-26/`.

## Dos fotos del inicio

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Foto principal | [home/hero/principal.png](src/assets/images/home/hero/principal.png) | Imagen seleccionada |
| Foto secundaria | [home/hero/secundaria.png](src/assets/images/home/hero/secundaria.png) | Imagen seleccionada |

## Nueve posiciones de galería

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Posición 1 | [home/gallery/01-trabajo-computadora.png](src/assets/images/home/gallery/01-trabajo-computadora.png) | Imagen seleccionada |
| Posición 2 | [home/gallery/02-plantines-equipo.png](src/assets/images/home/gallery/02-plantines-equipo.png) | Imagen seleccionada |
| Posición 3 | [home/gallery/03-actividad-ashico.png](src/assets/images/home/gallery/03-actividad-ashico.png) | Imagen seleccionada |
| Posición 4 | [home/gallery/04-reparacion-madera.png](src/assets/images/home/gallery/04-reparacion-madera.png) | Imagen seleccionada |
| Posición 5 | [home/gallery/05-colaboracion-trabajo.png](src/assets/images/home/gallery/05-colaboracion-trabajo.png) | Imagen seleccionada |
| Posición 6 | [home/gallery/06-diseno-grafico.png](src/assets/images/home/gallery/06-diseno-grafico.png) | Imagen seleccionada |
| Posición 7 | [home/gallery/07-emprendimiento-reposteria.png](src/assets/images/home/gallery/07-emprendimiento-reposteria.png) | Imagen seleccionada |
| Posición 8 | [home/gallery/08-inventario-archivo.png](src/assets/images/home/gallery/08-inventario-archivo.png) | Imagen seleccionada |
| Posición 9 | [home/gallery/09-taller-informatica.png](src/assets/images/home/gallery/09-taller-informatica.png) | Imagen seleccionada |

## Retratos de los 19 perfiles

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Valeria Morales Terán | [profiles/valeria-morales.png](src/assets/images/profiles/valeria-morales.png) | Retrato actual conservado |
| Javier Mercado Rocha | [profiles/javier-mercado.jpg](src/assets/images/profiles/javier-mercado.jpg) | Retrato actual conservado |
| Camila Rojas Claure | [profiles/camila-rojas.jpg](src/assets/images/profiles/camila-rojas.jpg) | Retrato actual conservado |
| Diego Siles Montaño | [profiles/diego-siles.png](src/assets/images/profiles/diego-siles.png) | Retrato actual conservado |
| Lucía Salazar Pinto | [profiles/lucia-salazar.png](src/assets/images/profiles/lucia-salazar.png) | Retrato actual conservado |
| Mateo Peñaranda Alarcón | [profiles/mateo-penaranda.jpg](src/assets/images/profiles/mateo-penaranda.jpg) | Retrato actual conservado |
| Andrea Torrico Suárez | [profiles/andrea-torrico.png](src/assets/images/profiles/andrea-torrico.png) | Retrato actual conservado |
| Alex Quispe Mamani | [profiles/alex-quispe.jpg](src/assets/images/profiles/alex-quispe.jpg) | Retrato actual conservado |
| Rodrigo Vargas Choque | [profiles/rodrigo-vargas.jpg](src/assets/images/profiles/rodrigo-vargas.jpg) | Retrato actual conservado |
| Fernando Gutiérrez Rios | [profiles/fernando-gutierrez.jpg](src/assets/images/profiles/fernando-gutierrez.jpg) | Retrato actual conservado |
| Gabriela Choque Flores | [profiles/gabriela-choque.png](src/assets/images/profiles/gabriela-choque.png) | Retrato actual conservado |
| Luis Mendoza Albarracín | [profiles/luis-mendoza-albarracin.png](src/assets/images/profiles/luis-mendoza-albarracin.png) | Retrato actual conservado |
| Juan Pablo Claros | [profiles/juan-pablo-claros.png](src/assets/images/profiles/juan-pablo-claros.png) | Retrato actual conservado |
| Claudia Arce Montaño | [profiles/claudia-arce.jpg](src/assets/images/profiles/claudia-arce.jpg) | Retrato actual conservado |
| María René Morales | [profiles/maria-rene-morales.png](src/assets/images/profiles/maria-rene-morales.png) | Retrato actual conservado |
| Melissa Arteaga Tórrez | [profiles/melissa-arteaga.jpg](src/assets/images/profiles/melissa-arteaga.jpg) | Retrato actual conservado |
| Patricia Soliz Guzmán | [profiles/patricia-soliz.jpg](src/assets/images/profiles/patricia-soliz.jpg) | Retrato actual conservado |
| Carlos Mendoza Villarroel | [profiles/carlos-mendoza.jpg](src/assets/images/profiles/carlos-mendoza.jpg) | Retrato actual conservado |
| Sergio Mamani Calle | [profiles/sergio-mamani.jpg](src/assets/images/profiles/sergio-mamani.jpg) | Retrato actual conservado |

## Portadas de los 19 perfiles

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Valeria Morales Terán | [profiles/covers/valeria-morales-teran.png](src/assets/images/profiles/covers/valeria-morales-teran.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Javier Mercado Rocha | [profiles/covers/javier-mercado-rocha.png](src/assets/images/profiles/covers/javier-mercado-rocha.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Camila Rojas Claure | [profiles/covers/camila-rojas-claure.png](src/assets/images/profiles/covers/camila-rojas-claure.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Diego Siles Montaño | [profiles/covers/diego-siles-montano.png](src/assets/images/profiles/covers/diego-siles-montano.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Lucía Salazar Pinto | [profiles/covers/lucia-salazar-pinto.png](src/assets/images/profiles/covers/lucia-salazar-pinto.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Mateo Peñaranda Alarcón | [profiles/covers/mateo-penaranda-alarcon.png](src/assets/images/profiles/covers/mateo-penaranda-alarcon.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Andrea Torrico Suárez | [profiles/covers/andrea-torrico-suarez.png](src/assets/images/profiles/covers/andrea-torrico-suarez.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Alex Quispe Mamani | [profiles/covers/alex-quispe-mamani.png](src/assets/images/profiles/covers/alex-quispe-mamani.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Rodrigo Vargas Choque | [profiles/covers/rodrigo-vargas-choque.png](src/assets/images/profiles/covers/rodrigo-vargas-choque.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Fernando Gutiérrez Rios | [profiles/covers/fernando-gutierrez-rios.png](src/assets/images/profiles/covers/fernando-gutierrez-rios.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Gabriela Choque Flores | [profiles/covers/gabriela-choque-flores.png](src/assets/images/profiles/covers/gabriela-choque-flores.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Luis Mendoza Albarracín | [profiles/covers/luis-mendoza-albarracin.png](src/assets/images/profiles/covers/luis-mendoza-albarracin.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Juan Pablo Claros | [profiles/covers/juan-pablo-claros.png](src/assets/images/profiles/covers/juan-pablo-claros.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Claudia Arce Montaño | [profiles/covers/claudia-arce-montano.png](src/assets/images/profiles/covers/claudia-arce-montano.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| María René Morales | [profiles/covers/maria-rene-morales.png](src/assets/images/profiles/covers/maria-rene-morales.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Melissa Arteaga Tórrez | [profiles/covers/melissa-arteaga-torrez.png](src/assets/images/profiles/covers/melissa-arteaga-torrez.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Patricia Soliz Guzmán | [profiles/covers/patricia-soliz-guzman.png](src/assets/images/profiles/covers/patricia-soliz-guzman.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Carlos Mendoza Villarroel | [profiles/covers/carlos-mendoza-villarroel.png](src/assets/images/profiles/covers/carlos-mendoza-villarroel.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |
| Sergio Mamani Calle | [profiles/covers/sergio-mamani-calle.png](src/assets/images/profiles/covers/sergio-mamani-calle.png) | Misma portada en el perfil completo y en todos sus paneles de autónomo |

## Cuatro casos de éxito

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| Luis Mendoza | [stories/luis-mendoza.png](src/assets/images/stories/luis-mendoza.png) | Imagen actual conservada |
| María René Morales | [stories/maria-rene-morales.png](src/assets/images/stories/maria-rene-morales.png) | Imagen actual conservada |
| Juan Pablo Claros | [stories/juan-pablo-claros.png](src/assets/images/stories/juan-pablo-claros.png) | Imagen actual conservada |
| Carla Rodríguez Vaca | [stories/historia-destacada-bolivia.png](src/assets/images/stories/historia-destacada-bolivia.png) | Imagen actual conservada |

## Capturas de la plataforma

| Uso | Archivo maestro | Estado |
| --- | --- | --- |
| publicar.png | [platform/publicar.png](src/assets/images/platform/publicar.png) | Se renovará con el sitio terminado |
| postulaciones.png | [platform/postulaciones.png](src/assets/images/platform/postulaciones.png) | Se renovará con el sitio terminado |
| perfil.png | [platform/perfil.png](src/assets/images/platform/perfil.png) | Se renovará con el sitio terminado |
| empleos.png | [platform/empleos.png](src/assets/images/platform/empleos.png) | Se renovará con el sitio terminado |
| detalle.png | [platform/detalle.png](src/assets/images/platform/detalle.png) | Se renovará con el sitio terminado |
| contratar.png | [platform/contratar.png](src/assets/images/platform/contratar.png) | Se renovará con el sitio terminado |

## Cómo se optimizan

`SiteImage.astro` utiliza `getImage()` de `astro:assets`: genera archivos WebP, `srcset`, `sizes`, dimensiones y carga diferida según cada uso. La primera foto del inicio tiene prioridad de carga. Los avatares se generan cuadrados; las portadas de servicios conservan su proporción 12:5. En imágenes con `object-fit: cover` se tiene en cuenta la resolución necesaria para cubrir también la altura, sin cambiar el encuadre del resto de la interfaz.

Los SVG siguen siendo vectores y el favicon conserva `/favicon.svg`. El logotipo para Open Graph se genera en PNG. No se sirven los maestros de fotos directamente desde `public/`.

El manifiesto de imágenes permite que los filtros, los perfiles dinámicos, los autores y el menú cambien juntos `src`, `srcset` y `sizes`. También reconoce las rutas antiguas guardadas en el navegador. Las URLs externas y las fotos aportadas en tiempo de ejecución mantienen su fuente propia y limpian las variantes de una foto anterior; no se procesan durante una compilación en la que todavía no existen.

Los metadatos de estado provisional son documentación; reemplazar el archivo cambia su imagen sin modificar los componentes. Los nombres y textos alternativos deben seguir describiendo el contenido que se publique.

## Verificación

- `npm run build`: debe terminar sin errores.
- `node scripts/verify-image-optimization.mjs`: comprueba páginas compiladas, perfiles, servicios, filtros, nuevas publicaciones, compatibilidad con sesiones previas, fuentes aportadas por usuarios y tamaños descargados a densidades 1× y 2×.
- Resultados y mediciones: `artifacts/image-optimization/verification.json`.
- Las capturas de esa carpeta son pruebas internas; no sustituyen las capturas finales del inicio.
