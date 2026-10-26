# Archivo de mantenimiento — 26 de octubre de 2026

Material retirado de las carpetas activas durante la limpieza del proyecto.
No se importa ni se compila desde aquí.

- `src/`: siete componentes que no tenían referencias desde las rutas activas ni desde la galería temporal.
- `scripts/`: tres migraciones de imágenes ya completadas. No volver a ejecutarlas sobre la estructura actual.
- `tests/`: dos pruebas antiguas dependientes de un servidor en el puerto 4322 y de una interfaz anterior.
- `INVENTARIO_IMAGENES.md`: inventario anterior a Astro Assets. El documento vigente es [IMAGENES.md](../../IMAGENES.md).
- `provenance/`: relaciones entre imágenes recibidas, servicios, archivos y prompts.
- `one-off-tools/`: herramientas puntuales conservadas como referencia; no forman parte de la verificación vigente.
- `media-sources/`: 24 PNG recibidos antes de su conversión a WebP. Se conservan localmente y están excluidos de Git.
- `design-references/`: tres referencias visuales conservadas localmente, también excluidas de Git.

`code-manifest.json` guarda las rutas originales, tamaños y SHA-256 del código trasladado.
`artifact-plan.json` registra cada archivo temporal retirado, su hash y, cuando corresponde, su destino.
`artifact-results.json` confirma las operaciones realizadas. Ocho PNG duplicados se verificaron mediante SHA-256 con sus maestros de `src/assets/images/` antes de retirarlos.

Las capturas antiguas, respaldos de migración y registros regenerables se eliminaron.
La galería temporal y los resultados de las pruebas de esta revisión se conservaron.
Los archivos históricos de Blog, Nosotros e imágenes previas permanecen en sus carpetas anteriores de `archive/`.

La verificación vigente se ejecuta desde la raíz con `npm run build` y `npm test`.
Sus resultados se escriben exclusivamente en `artifacts/`, salvo la renovación de
capturas maestras solicitada expresamente con `npm run test:platform -- --refresh-preview-images`.
