# Páginas archivadas

Archivadas el 25 de octubre de 2026 por indicación de Lex. «Nosotros» y «Blog» quedan fuera del sitio activo.

Se conservan 20 archivos, con su contenido intacto y las rutas originales reflejadas dentro de esta carpeta:

- `src/pages/nosotros.astro` y `src/pages/blog/`: páginas y detalles de artículos.
- `src/components/nosotros/`, `src/components/blog/`, `src/components/home/HomeBlog.astro` y `src/components/cards/BlogCard.astro`: componentes exclusivos de esas páginas.
- `src/data/articles.json`: los seis artículos.
- `public/images/blog/`: las seis imágenes exclusivas de los artículos.

El archivo `manifest.json` registra las rutas y los hashes SHA256 comprobados después de mover cada archivo. Se archivó el contenido guardado, incluidos los cambios que ya existían.

Las imágenes que seguía utilizando Inicio se conservaron. Después se migraron a `src/assets/images/home/gallery/` junto con el resto de imágenes activas; sus ubicaciones actuales están en `IMAGENES.md` y sus equivalencias antiguas en `src/data/image-aliases.json`. Los enlaces a «Nosotros» se retiraron del pie de página y su cuadrícula se ajustó a cuatro columnas.

## Restaurar

Devolver los archivos a sus rutas originales en la raíz del proyecto, conservando la estructura de `src/` y `public/`. Comprobar antes si hay archivos nuevos en esos destinos para evitar sobrescribirlos. Reincorporar los enlaces solo si esas páginas vuelven a utilizarse y ejecutar `npm run build`.
