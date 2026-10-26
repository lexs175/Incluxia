# Imágenes de los cuatro servicios de Sistemas y Soporte TI

Cuatro imágenes distintas, ajustadas a la actividad de cada paquete. Generadas con la herramienta integrada `image_gen`; son muestras visuales del servicio, no capturas de trabajos reales de los autores de los perfiles.

| Servicio | Archivo final para el sitio | Contenido |
| --- | --- | --- |
| Mantenimiento de software remoto | [mantenimiento-remoto-v1.webp](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/public/images/services/sistemas-ti/mantenimiento-remoto-v1.webp) | Diagnóstico del sistema, programas de inicio y sesión remota. |
| Configuración de redes LAN y Wi-Fi | [redes-lan-wifi-v1.webp](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/public/images/services/sistemas-ti/redes-lan-wifi-v1.webp) | Router, switch, cableado y configuración de redes de oficina e invitados. |
| Helpdesk mensual por chat | [helpdesk-chat-v1.webp](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/public/images/services/sistemas-ti/helpdesk-chat-v1.webp) | Tickets y conversación de soporte escrito sobre una incidencia de impresión. |
| Instalación de software y antivirus | [instalacion-software-v1.webp](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/public/images/services/sistemas-ti/instalacion-software-v1.webp) | Instalación de programas y configuración de protección y actualizaciones. |

Se conectaron a `serv-5`–`serv-8` en `src/data/hiring.json`, con texto alternativo propio. Las tarjetas y los detalles laterales comparten la imagen correspondiente. Utilizan el mecanismo de portadas específicas ya implementado, sin el degradado azul de las imágenes genéricas.

Los originales PNG se conservan en `originals/`. Las versiones WebP mantienen sus dimensiones de 1942 × 809, sin recorte o alteración del contenido durante la conversión; pesan aproximadamente entre 116 y 152 KB.

- [Prompts de generación](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/artifacts/generated-services/sistemas-ti/v1/prompts.json).
- [Fuentes originales](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/artifacts/generated-services/sistemas-ti/v1/sources.json).
- [Archivos, dimensiones y hashes](D:/Download/02_PROYECTOS_WEB/ASHICO-hipoacusia/artifacts/generated-services/sistemas-ti/v1/manifest.json).

Las ventanas de software forman parte de las imágenes generadas. Las imágenes de Diseño Gráfico, las fotos de las personas y los datos de los paquetes se conservan.

Validación: `npm run build` completado con 51 páginas. Playwright con sesión iniciada a 1440 y 390 px: cuatro portadas y detalles cargados, filtros, vista de todas las categorías y publicación nueva sin heredar la imagen de otro servicio. Sin errores JavaScript ni desbordamiento horizontal. Resultados en `verification.json`; capturas internas de revisión en `servicios-1440.png` y `servicios-390.png`.
