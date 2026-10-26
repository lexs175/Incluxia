# Eco: evaluación del estado actual y plan de funcionamiento

Plan e implementación actualizados el 23 de octubre de 2026 con las indicaciones y referencias de Lex.

## 1. Qué se está evaluando y qué se está proponiendo

Se evalúa la simulación que ya existe: qué muestra, cómo se navega, qué ocurre al ingresar y qué tareas permite completar.

No se descuenta puntuación por la falta de un sistema real de cuentas, una base de datos compartida o un servidor que gestione la actividad. En esta etapa es válido utilizar datos de ejemplo y guardar información en el navegador.

Sí se evalúa la coherencia. Si se confirma que una oferta fue publicada, esa oferta debe poder encontrarse dentro de la demostración.

Este documento distingue:

- **Estado actual:** lo que existe en el proyecto.
- **Problema y corrección:** qué falta o debe reorganizarse y cómo resolverlo.
- **Plan acordado:** cómo deben funcionar las pantallas después de implementar los cambios.

La evaluación de la sección 3 y la nota de la sección 14 corresponden a la revisión anterior, del 22 de octubre. Se conservan como referencia del punto de partida. La sección 15 explica qué se implementó después sobre el diseño existente.

La puntuación final corresponde a la implementación evaluada, no a las ideas nuevas de este documento.

## 2. El objetivo y la cuenta común

Eco conecta a personas con hipoacusia en Bolivia con oportunidades de trabajo y con quienes necesitan contratar su talento. La comunicación debe poder realizarse por escrito, sin exigir llamadas telefónicas.

**Una misma cuenta permite buscar trabajo, postular, ofrecer servicios, publicar una oferta y contratar a otra persona.**

Ejemplo: una diseñadora puede postular a un empleo, ofrecer diseño de catálogos y publicar un encargo para contratar ayuda. Utiliza la misma cuenta para las tres cosas.

No hay dos registros separados ni un cambio obligatorio entre «modo trabajador» y «modo empresa». Los datos de una organización se completan cuando la persona necesita actuar en su nombre.

## 3. Estado evaluado antes de los cambios: problemas y correcciones

| Parte | Cómo está hoy | Qué problema tiene o qué cambio se pide | Cómo corregirlo |
| --- | --- | --- | --- |
| **Portada después de ingresar** | Se conserva la presentación grande y el menú público después del acceso simulado. | Ingresar no lleva directamente a buscar oportunidades. | Abrir el Inicio interior, que es el propio listado de empleos en tarjetas. |
| **Menú público** | Incluye Inicio, Ofertas de Empleo, Contratar, Perfiles, Casos de Éxito y Blog, además del acceso y la publicación. | Mezcla presentación y herramientas de uso; no coincide con el esquema nuevo. | Mostrar Inicio y Casos de éxito, con Ingresar y Crear cuenta como acciones de acceso. |
| **Explicación de la plataforma en la portada** | El encabezado se centra en trabajos para personas con hipoacusia y después aparecen bloques de comunicación, ofertas y contratación. | Falta organizar la presentación para que explique primero qué es Eco y después cómo se utiliza cada función desde la misma cuenta. | Presentar la plataforma en el hero; explicar después por qué contratar talento con hipoacusia y mostrar cómo buscar trabajo, contratar y publicar mediante textos breves y capturas de las pantallas. |
| **Blog** | Tiene componentes, páginas, enlaces en el menú y presencia en la portada. | Lex ha decidido dejarlo fuera de la navegación activa por ahora. Es un cambio de alcance, no un defecto del contenido. | Retirar sus accesos de la experiencia prevista y conservar los componentes y contenidos para reutilizarlos en el futuro. |
| **Registro** | Pide elegir entre «Busco Trabajo» y «Soy Empresa». | Puede hacer pensar que hay que elegir una actividad y renunciar a la otra. | Usar un registro común; trabajar, contratar y publicar siguen disponibles desde la misma cuenta. |
| **Listado de empleos** | Presenta una lista estrecha de ofertas a la izquierda y el detalle seleccionado al lado, con búsqueda y filtros en la zona del listado. | Ese formato no corresponde a la nueva referencia de tarjetas. | Mostrar seis tarjetas de resumen, con filtros a la derecha. El detalle se abre en otra página. |
| **Detalle de una oferta** | Existe tanto información dentro del listado dividido como una página individual de empleo. | El recorrido principal debe distinguir claramente la exploración del detalle. | Usar la tarjeta como resumen y la página individual como lugar para leer toda la oferta y confirmar la postulación. |
| **Contratar y Perfiles** | Hay accesos separados a profesionales, servicios y perfiles. | No está suficientemente definida la relación entre encontrar a alguien y consultar su perfil. | Organizar la búsqueda desde Contratar y conectar cada resultado con su detalle y perfil. |
| **Crear una oferta** | El formulario guarda información en el navegador y confirma que la oferta está publicada. En la comprobación no apareció en el listado enlazado. | La confirmación no se puede comprobar dentro de la propia simulación. | Conectar la publicación con Inicio y con Mis publicaciones dentro de Publicar. |
| **Administrar publicaciones** | No hay una sección completa para administrar todas las publicaciones propias. | Falta un lugar para volver, editar, pausar o cerrar lo publicado. | Reunir la creación y la administración en Publicar, incluyendo empleos, encargos y servicios. |
| **Postulaciones** | Los botones permiten contactar por WhatsApp, pero falta el seguimiento personal completo. | No se puede comprobar dentro de Eco qué postulaciones se hicieron ni cuáles recibió una publicación propia. | Crear Postulaciones con enviadas y recibidas, relacionadas con cada oferta. |
| **Perfil propio** | Existen perfiles de ejemplo y el enlace de la cabecera apunta a uno concreto de demostración. | No representa la consulta y edición del perfil de quien ingresó. | Vincular Perfil con la persona que ingresó y permitir editar sus datos y muestras de trabajo. |
| **Casos de éxito** | Tienen páginas propias, acceso desde el menú y presencia en la portada. | Son compatibles con la presentación pública acordada. | Conservar su acceso público y sus páginas de lectura. |

### Comprobaciones de la revisión anterior

1. Se ingresó desde la portada mediante el acceso de demostración. El encabezado principal y los enlaces del menú se mantuvieron después de entrar.
2. Se creó una oferta desde el formulario. Se mostró éxito y se guardó información en el navegador, pero la oferta no apareció al abrir el listado de empleos desde el enlace ofrecido.

El problema de la publicación no es utilizar el navegador para guardar datos. El problema es que la demostración confirma una publicación y después no permite encontrarla.

## 4. La parte pública

### 4.1. Menú antes de ingresar

**Inicio · Casos de éxito**

**Acciones de acceso: Ingresar · Crear cuenta**

Inicio abre la página de presentación. Casos de éxito abre su página con las historias y sus detalles.

### 4.2. Contenido dentro de la página Inicio

La presentación pública es una sola página. Su primera pantalla explica qué es Eco; al bajar se entiende por qué existe y cómo se utiliza. Este es el orden de contenido:

| Orden | Bloque dentro de Inicio público | Qué debe entender la persona |
| --- | --- | --- |
| **1** | **Presentación principal o hero** | Qué es Eco, para quién sirve y qué permite hacer. Debe quedar claro que una misma cuenta permite trabajar, contratar y publicar. Incluye Crear cuenta e Ingresar. |
| **2** | **Por qué contratar a una persona con hipoacusia** | Cómo conocer su talento, experiencia y muestras de trabajo, y cómo coordinar por escrito. Se aprovecha y ajusta la explicación de contratación que ya existe. |
| **3** | **Cómo encontrar trabajo y postular** | Que al ingresar se ven ofertas en tarjetas, se pueden filtrar y se abre el detalle antes de confirmar una postulación. Se acompaña con capturas del listado y del detalle. |
| **4** | **Cómo contratar profesionales o servicios** | Cómo explorar especialidades, revisar un perfil o un servicio y comenzar una consulta por escrito. Se acompaña con una captura de Contratar y del resultado que se está explicando. |
| **5** | **Cómo publicar** | Cómo se publica a nombre de una empresa, como persona o para ofrecer un servicio. Se muestra la pantalla común de Publicar y las diferencias de cada opción. |
| **6** | **Cómo empezar y seguir la actividad** | Crear la cuenta, completar Perfil y utilizar las funciones. Explica brevemente dónde administrar las publicaciones y consultar las postulaciones. |
| **7** | **Historias y resultados** | Una selección de casos de éxito, con acceso a su página pública. Los ejemplos de demostración se identifican como tales. |
| **8** | **Invitación final a empezar** | Crear cuenta para utilizar la plataforma o Ingresar si ya se tiene una. Ambas acciones mantienen el registro común. |

**Todos estos bloques están dentro de Inicio público. No son nuevas opciones del menú, páginas independientes ni tipos de cuenta.** El menú sigue siendo Inicio y Casos de éxito.

#### El hero presenta la plataforma

El hero es el bloque inicial con el título, una explicación breve y las acciones de acceso. Su función principal es decir qué es Eco. No necesita explicar en detalle cada formulario ni convertir trabajar y contratar en dos registros diferentes.

Ejemplo de explicación para desarrollar al redactar la página: «Una plataforma para encontrar trabajo, ofrecer tus servicios y contratar talento con hipoacusia en Bolivia, con comunicación por escrito».

La acción para empezar es Crear cuenta y lleva al mismo registro para todas las personas. Ingresar sirve para quien ya tiene cuenta.

#### Después del hero se explica por qué contratar talento con hipoacusia

Esta explicación aparece inmediatamente después de la presentación. Retoma el propósito de los bloques que ya existen, pero se centra en las capacidades profesionales, la experiencia, las muestras de trabajo y la coordinación escrita.

Debe ayudar a comprender cómo valorar a una persona por lo que sabe hacer y cómo acordar tareas y condiciones de comunicación. Puede mostrar trabajos o perfiles de ejemplo que respalden la explicación.

No se atribuyen capacidades o ventajas laborales a todas las personas por tener hipoacusia. Las cualidades de cada profesional se muestran mediante su información y sus trabajos, sin estereotipos ni promesas de resultados garantizados.

#### Las siguientes secciones enseñan el uso con ejemplos

Cada bloque combina una explicación breve, los pasos de una tarea y una imagen de la pantalla correspondiente. La persona debe poder relacionar lo que lee con lo que verá al ingresar.

En la explicación de Publicar se distinguen estos ejemplos:

- **Como empresa:** indicar la organización y publicar una vacante o un encargo.
- **Como persona:** describir una necesidad de contratación a nombre propio.
- **Ofrecer un servicio:** explicar el trabajo que se ofrece realizar, sus entregables, precio y plazo.

Son acciones disponibles desde la misma cuenta. La portada explica esas posibilidades; los formularios completos y la administración de la actividad se utilizan después de ingresar.

### 4.3. Capturas de Eco para las imágenes de ejemplo

Las imágenes que enseñan cómo funciona la plataforma serán capturas de las propias pantallas de Eco. El agente que implemente la página preparará esas capturas con el navegador, utilizando Playwright según las reglas del proyecto.

| Captura que se preparará | Qué debe permitir reconocer |
| --- | --- |
| **Inicio interior** | Las seis tarjetas de empleo y los filtros a la derecha. |
| **Detalle de una oferta** | La información completa y la tarjeta de postulación. |
| **Contratar** | La búsqueda de profesionales y servicios y la información que se revisa antes de contactar. |
| **Publicar** | El acceso común para publicar como empresa, como persona u ofrecer un servicio, y la parte del formulario que se esté explicando. |
| **Publicaciones y postulaciones** | Dónde encontrar lo que se publicó y las postulaciones enviadas o recibidas. |
| **Perfil** | Dónde completar la presentación profesional y las muestras de trabajo. |

Se tomarán cuando las pantallas estén implementadas y coincidan con este plan. No se utilizará una captura del listado antiguo dividido para explicar el nuevo listado de tarjetas. Si una pantalla cambia después, se actualizará su imagen de ejemplo.

Las capturas deben centrarse en la parte que se está explicando, con texto y controles legibles también en celular. Una sección puede utilizar más de un recorte cuando necesite mostrar dos pasos.

Los datos de las capturas serán ejemplos de demostración. Las referencias de Contra orientan la organización, pero no se colocan como si fueran imágenes de Eco. Las imágenes que muestran funciones deben corresponder a la interfaz construida, no a una imagen inventada de una pantalla que no existe.

**Las capturas ya se prepararon con las propias pantallas de Eco y están incorporadas en la portada. Se pueden abrir para ampliarlas. Se conservan el estilo y los componentes del proyecto.**

### 4.4. El Blog queda reservado para más adelante

Por decisión de Lex, el Blog no aparece en el menú público, en el menú interior ni como acceso en el pie de página. Tampoco se incluye como una sección activa de la portada en este plan.

Se conservan sus componentes y contenidos, sin borrarlos ni rehacerlos, por si se decide utilizarlos en otra etapa. El Blog ya se retiró de los menús, del pie de página y de las secciones activas de Inicio. Sus archivos siguen disponibles.

## 5. Qué ocurre al crear la cuenta o ingresar

Hay un solo registro. Se solicitan los datos básicos de la cuenta y un medio de contacto escrito.

| Situación | Resultado esperado |
| --- | --- |
| La persona crea su cuenta o ingresa sin otra acción pendiente. | Abre Inicio interior: el listado de empleos con tarjetas y filtros. |
| Ingresa para continuar una acción concreta. | Retoma esa acción, por ejemplo una publicación pendiente. |
| Abre la plataforma con la sesión activa. | Entra al listado de empleos, sin repetir la presentación pública. |
| Cierra sesión. | Vuelve a Inicio público, la página de presentación. |

La información profesional se completa en Perfil. Si se publica a nombre de una empresa, se añaden los datos de esa organización al preparar la publicación.

## 6. El menú después de ingresar

**Inicio · Contratar · Publicar · Postulaciones · Perfil**

| Opción | Qué contiene |
| --- | --- |
| **Inicio** | El listado de empleos y encargos en tarjetas, con búsqueda y filtros. Es la pantalla de entrada y también la pantalla para buscar trabajo. |
| **Contratar** | Profesionales y servicios que la persona puede consultar y contratar. |
| **Publicar** | La creación de publicaciones como empresa, como persona o como profesional que ofrece servicios. También permite administrar lo publicado. |
| **Postulaciones** | Las postulaciones enviadas por la persona y las recibidas en sus ofertas. |
| **Perfil** | La información de quien ingresó, su experiencia, habilidades y muestras de trabajo. |

**No se añade otro enlace llamado Buscar trabajo que repita Inicio.** Buscar empleo ya es la función del propio Inicio interior.

Todas las opciones están disponibles desde la misma cuenta. También existe una acción clara para cerrar sesión.

## 7. Inicio interior: seis tarjetas y filtros a la derecha

### 7.1. Distribución de la pantalla

En computadora amplia, la zona principal presenta **seis tarjetas en tres columnas y dos filas**. A su derecha hay una columna con filtros.

No se mantiene una lista estrecha de ofertas con el detalle de una oferta seleccionado a su lado. La pantalla de exploración muestra resúmenes y filtros; la lectura completa ocurre en otra página.

En tamaños intermedios las tarjetas pueden pasar a dos columnas. En celular se presenta una columna de tarjetas y un botón Filtros junto al buscador que abre las mismas opciones. No se reduce toda la distribución de computadora hasta volverla ilegible.

Si hay más resultados, una paginación permite ver los siguientes grupos de seis. Si un filtro devuelve menos de seis, se muestran los resultados disponibles; no se rellenan huecos con ofertas repetidas.

### 7.2. Qué contiene cada tarjeta

Las tarjetas son compactas, como en la referencia de Lex. Permiten comparar rápidamente sin leer la descripción completa.

| Información | Qué se muestra |
| --- | --- |
| **Quién publica** | Nombre de la empresa o de la persona, con imagen o inicial cuando corresponda. |
| **Puesto o encargo** | Nombre claro del trabajo. |
| **Sueldo o presupuesto** | Importe y forma de pago: por mes, por hora o por proyecto, según corresponda. No se inventa una cantidad cuando no está informada. |
| **Datos breves** | Ubicación y modalidad; se pueden resumir en una línea. |
| **Acción** | Botón Postular, ubicado de forma consistente en todas las tarjetas. |

No se incluye la descripción extensa, la lista de requisitos ni un formulario dentro de cada tarjeta.

Al pulsar una tarjeta, su título o el botón Postular se abre la página de detalle de esa misma oferta. **Ese primer clic no envía una postulación.**

### 7.3. Qué hacen los filtros

La búsqueda permite localizar un puesto, una especialidad o quien publica. Los filtros de la columna derecha permiten limitar por ubicación, modalidad, empleo o proyecto por encargo, especialidad y sueldo o presupuesto cuando el dato exista.

Debe ser posible reconocer los filtros aplicados, quitarlos y volver a ver todas las ofertas. Al cambiarlos, se actualizan las tarjetas y la cantidad de resultados.

Si no hay coincidencias se explica la situación y se ofrece limpiar los filtros.

## 8. Detalle de una oferta: página completa

### 8.1. Distribución basada en la referencia

El detalle se abre como **una página propia**, con un enlace claro para volver a las ofertas.

En computadora, el contenido amplio queda a la izquierda y una tarjeta compacta para postular queda a la derecha. Esta tarjeta de postulación no es la columna de filtros del listado: corresponde a otra pantalla y tiene otra función.

| Zona | Contenido |
| --- | --- |
| **Encabezado** | Nombre del puesto o encargo, quién publica y datos principales. Puede tener una imagen de cabecera si ayuda a la presentación. |
| **Contenido principal, a la izquierda** | Presentación de quien publica, descripción del trabajo, tareas, requisitos, modalidad, plazos y condiciones de comunicación escrita. |
| **Tarjeta de postulación, a la derecha** | Sueldo o presupuesto, ubicación o modalidad, datos breves relevantes y botón Postular a esta oferta. |

En celular se conserva una lectura ordenada y la acción de postular queda fácil de encontrar, sin superponer ni ocultar el texto.

Se aprovecha la página individual de empleo que ya existe y se adapta a este recorrido. No hace falta crear otra ficha diferente con información duplicada.

### 8.2. Cuándo se registra la postulación

| Paso | Qué ocurre |
| --- | --- |
| **Postular desde una tarjeta del listado** | Abre el detalle. Todavía no registra ni envía nada. |
| **Postular a esta oferta desde el detalle** | Permite revisar los datos del perfil que se compartirán y completar la información necesaria. |
| **Confirmar la postulación** | Registra el resultado dentro de la simulación y lo muestra en Postulaciones. |

Si falta información del perfil, se indica qué completar y después se permite continuar con la misma oferta.

Se toma de la imagen la organización del contenido y de la acción. No se copian requisitos de la referencia como grabar un video o realizar una presentación oral. La comunicación de Eco mantiene su objetivo de acceso por escrito.

### 8.3. Volver al listado

Al volver a las ofertas se conservan la búsqueda, los filtros y la página de resultados que se estaba viendo. No se obliga a empezar otra vez.

## 9. Contratar, Publicar, Postulaciones y Perfil

### 9.1. Contratar

Permite explorar profesionales y servicios. Cada resultado conecta con la experiencia, las muestras de trabajo y las condiciones del servicio.

El panel lateral de detalles que existe para contratar puede conservarse si facilita esa consulta. La decisión de abrir los empleos en una página propia no obliga a cambiar también la exploración de servicios.

### 9.2. Publicar: empresa, persona o servicio

Desde Publicar se puede iniciar una publicación de estas tres formas:

| Forma de publicar | Para qué sirve | Ejemplo |
| --- | --- | --- |
| **Como empresa** | Publicar una vacante o un encargo a nombre de una organización. | Una empresa necesita un auxiliar contable. |
| **Como persona** | Publicar una necesidad de contratación a nombre propio. | Una persona necesita que alguien diseñe su catálogo. |
| **Ofrecer un servicio** | Presentar un trabajo que el propio profesional ofrece realizar. | Una diseñadora ofrece un catálogo con precio, plazo y entregables definidos. |

Estas opciones eligen qué se publica y a nombre de quién. No cambian el tipo de cuenta ni se convierten en tres registros diferentes.

Dentro de Publicar se distingue **Crear publicación** de **Mis publicaciones**. En Mis publicaciones se consultan y administran las ofertas y servicios propios: editar, pausar, cerrar o volver a publicar según corresponda.

Los empleos y encargos se muestran en Inicio. Los servicios ofrecidos se muestran en Contratar y en el Perfil de su autor.

### 9.3. Postulaciones

Se distinguen dos apartados:

- **Enviadas por mí:** las ofertas a las que postuló la persona y el estado de cada postulación.
- **Recibidas en mis ofertas:** los candidatos que postularon a sus publicaciones, agrupados por oferta.

Desde una publicación propia también se puede abrir la vista de sus candidatos. No se mezclan las postulaciones enviadas con las recibidas.

### 9.4. Perfil

Muestra y permite editar la información de quien ingresó: presentación, experiencia, habilidades, ubicación, disponibilidad, muestras de trabajo y preferencias de comunicación escrita.

Los servicios propios pueden verse en el perfil, pero se crean y administran desde Publicar. Si hay un acceso a Crear servicio en el perfil, lleva a ese mismo formulario de Publicar.

La información que otros pueden consultar se distingue de los datos privados y de las opciones de edición. Si la persona representa a una organización, puede completar sus datos sin perder las demás funciones de la cuenta.

## 10. Oferta y servicio: diferencia que se debe conservar

| Contenido | Quién lo publica | Dónde se consulta |
| --- | --- | --- |
| **Empleo:** se necesita cubrir un puesto. | Una empresa o una persona que contrata. | En las tarjetas de Inicio y en su página de detalle. |
| **Encargo:** se necesita realizar un trabajo concreto. | Una empresa o una persona que contrata. | En las tarjetas de Inicio y en su página de detalle. |
| **Servicio:** un profesional ofrece realizar un trabajo. | El profesional que lo ofrece. | En Contratar y en su Perfil. |

Buscar oportunidades y contratar talento son funciones distintas que la misma persona puede utilizar desde su cuenta. No se mezclan los servicios a la venta con las vacantes en el mismo listado de empleos.

## 11. Recorridos completos que debe demostrar el proyecto

| Tarea | Recorrido |
| --- | --- |
| **Encontrar trabajo** | Ingresar → Inicio con tarjetas → buscar o filtrar → abrir el detalle → revisar y confirmar la postulación → consultarla en Postulaciones. |
| **Publicar una vacante o un encargo** | Publicar → elegir como empresa o como persona → completar y revisar → confirmar → encontrarla en Mis publicaciones y en Inicio → revisar candidatos. |
| **Ofrecer un servicio** | Publicar → Ofrecer un servicio → completar precio, plazo y entregables → confirmar → encontrarlo en Mis publicaciones, Contratar y Perfil. |
| **Contratar a alguien** | Contratar → revisar profesional o servicio → consultar condiciones → iniciar contacto o solicitud por escrito. |
| **Actualizar la información personal** | Perfil → editar → guardar → ver los datos actualizados en el mismo perfil. |

Abrir WhatsApp no confirma que se envió un mensaje, se recibió una postulación o se contrató un servicio. Los botones deben identificar al destinatario y los mensajes distinguir el contacto de esos resultados.

No hace falta construir un chat interno, pagos ni contratos reales para demostrar estos recorridos.

## 12. Orden de corrección

1. Separar Inicio público de Inicio interior y aplicar los menús acordados. Organizar la portada con el hero de presentación, la explicación de por qué contratar talento con hipoacusia y las secciones de uso. Retirar el Blog de la navegación activa conservando sus componentes.
2. Hacer que el acceso lleve directamente a Inicio interior y unificar el registro.
3. Cambiar el listado dividido de empleos por seis tarjetas con filtros a la derecha.
4. Conectar cada tarjeta con su página de detalle y separar abrir una oferta de confirmar una postulación.
5. Reunir creación y administración en Publicar, con las opciones de empresa, persona y servicio.
6. Conectar las publicaciones con los listados y las postulaciones con sus ofertas.
7. Resolver Perfil para quien ingresó y revisar los recorridos completos en computadora y celular.
8. Capturar las pantallas ya ajustadas al plan e incorporar sus imágenes en las explicaciones de la portada pública, comprobando que coincidan con las funciones disponibles.

Se conserva la identidad visual. Los colores, la tipografía y los espacios se toman de los tokens existentes, manteniendo las reglas del proyecto sobre tipografía fluida y contenedores con márgenes seguros.

[Contra](https://contra.com/) y las imágenes compartidas sirven como referencias de organización. La marca, los contenidos, los importes y las condiciones de Eco responden a su propio objetivo.

## 13. Comprobaciones de la simulación implementada

- [x] El menú público muestra Inicio y Casos de éxito, con Ingresar y Crear cuenta como acciones.
- [x] El Blog queda fuera de toda navegación activa y sus componentes se conservan para una etapa futura.
- [x] El hero de Inicio público explica qué es Eco y que una cuenta permite trabajar, contratar y publicar.
- [x] Después del hero aparece la explicación de por qué contratar talento con hipoacusia, centrada en capacidades, trabajos y comunicación escrita.
- [x] Las secciones siguientes explican cómo buscar trabajo, contratar y publicar como empresa, como persona u ofreciendo servicios.
- [x] Esas explicaciones son contenido dentro de Inicio público, sin convertirse en opciones nuevas del menú ni tipos de cuenta.
- [x] Las imágenes de uso son capturas legibles de las pantallas de Eco ya ajustadas al plan y coinciden con lo que se está explicando.
- [x] Existe una cuenta común para trabajar, contratar y publicar.
- [x] El menú interior es Inicio, Contratar, Publicar, Postulaciones y Perfil.
- [x] Inicio interior es el listado de empleo; no hay otra entrada duplicada de Buscar trabajo.
- [x] En computadora amplia se ven seis tarjetas distribuidas en tres columnas y dos filas, con los filtros a la derecha.
- [x] Cada tarjeta resume quién publica, el puesto o encargo, el sueldo o presupuesto y los datos breves necesarios.
- [x] Postular desde la tarjeta abre el detalle sin registrar automáticamente una postulación.
- [x] El detalle tiene contenido principal y una tarjeta de postulación, siguiendo la organización de la referencia.
- [x] Confirmar la postulación en el detalle produce un registro visible en Postulaciones.
- [x] Volver al listado conserva los filtros y la página de resultados.
- [x] Publicar permite hacerlo como empresa, como persona o para ofrecer un servicio, desde la misma cuenta.
- [x] Mis publicaciones permite administrar las ofertas y servicios creados.
- [x] Los empleos aparecen en Inicio; los servicios aparecen en Contratar y Perfil.
- [x] Postulaciones distingue las enviadas por la persona y las recibidas en sus ofertas.
- [x] Perfil muestra y permite editar la información de quien ingresó.
- [x] Los recorridos funcionan en celular y los resultados de ejemplo se reconocen como simulación.

## 14. Puntuación de la implementación evaluada: del 1 al 10

La nota corresponde al proyecto revisado antes de implementar este plan. Cambiar el documento o añadir una referencia visual no cambia la puntuación del código existente.

Es una valoración cualitativa de organización y recorridos, no un estudio con usuarios. Se utilizan cinco criterios de igual peso, con un máximo de dos puntos por criterio.

| Criterio | Puntos actuales | Motivo |
| --- | --- | --- |
| Presentación pública y contenido de orientación | 1,5 de 2 | Hay una portada con información e historias. La navegación todavía mezcla presentación y herramientas. |
| Exploración de empleos, profesionales y servicios | 1,5 de 2 | Existen listados, filtros y detalles aprovechables. Falta conectarlos de forma completa con la actividad de la cuenta. |
| Entrada y navegación después de ingresar | 0,5 de 2 | Cambian algunos elementos de la cabecera, pero se mantiene la portada y el menú público. |
| Cuenta común y perfil propio | 0,5 de 2 | Existe acceso simulado, pero el registro presenta dos categorías y falta administrar el perfil de quien ingresó. |
| Publicación, postulaciones y seguimiento | 1 de 2 | Hay formulario, guardado local y contacto por WhatsApp, pero faltan la aparición de lo publicado y la gestión personal completa. |
| **Total** | **5 de 10** | **Hay una base para explorar contenido; los recorridos personales siguen incompletos.** |

No se descuentan puntos por la falta de un sistema real detrás. El Blog se deja pendiente por decisión de alcance, sin penalizar que sus componentes queden disponibles para el futuro.

**Puntuación de la implementación evaluada: 5/10.**

## 15. Qué quedó implementado sobre el diseño existente

Se conservaron la imagen y el fondo azul del hero, la distribución y los colores de la segunda sección, las categorías de Contratar, la presentación de los perfiles, las páginas de casos de éxito y el diseño del pie de página. Se ajustaron textos y enlaces cuando lo requería el recorrido acordado.

Los botones utilizan el componente del proyecto. Los detalles de empleo y de perfil se separaron en componentes reutilizables conservando su presentación. No se sustituyeron esas pantallas por otro diseño.

| Parte | Funcionamiento implementado |
| --- | --- |
| Antes de ingresar | Inicio y Casos de éxito en el menú; Crear cuenta e Ingresar como acciones. |
| Cuenta | Un registro común. La misma persona puede trabajar, contratar, publicar y ofrecer servicios. |
| Después de ingresar | Inicio abre directamente las ofertas: seis tarjetas por página, con los filtros a la derecha en computadora. |
| Oferta | La tarjeta abre el detalle. La postulación se guarda solo al confirmarla y aparece en Postulaciones. |
| Publicar | Empresa, persona y servicio; revisión antes de confirmar; edición, pausa, cierre y reactivación desde Mis publicaciones. |
| Contratar | Se conservan las categorías, tarjetas y paneles de detalle. Incluye los servicios publicados y la información profesional actualizada. |
| Postulaciones | Enviadas y recibidas. Se puede retirar una postulación y actualizar el estado de los candidatos de una publicación propia. |
| Perfil | Muestra a quien ingresó y permite editar su presentación, habilidades, experiencia, estudios y enlaces de trabajos. También muestra sus servicios y las consultas recibidas. |
| Contacto | La consulta se registra dentro de la demostración. Guardarla no envía automáticamente un mensaje externo. |
| Portada | Explicaciones de uso con capturas de las pantallas reales, siguiendo el estilo existente. |
| Blog | Fuera de la navegación activa; componentes y contenidos conservados. |

### Cómo probarlo sin conocimientos técnicos

1. Entra en Crear cuenta y utiliza datos de prueba, o abre Ingresar y elige Probar como Valeria.
2. Revisa las tarjetas, aplica un filtro y abre una oferta. Comprueba que abrirla todavía no registra una postulación.
3. Confirma la postulación y búscala en Postulaciones.
4. Abre Publicar, crea un encargo como persona y confirma la revisión. Encuéntralo en Inicio y en Mis publicaciones.
5. Crea un servicio y comprueba que aparezca en Contratar y en Perfil.
6. Cierra sesión e ingresa con otra cuenta de prueba para postular a la oferta o consultar el servicio.
7. Vuelve a la cuenta que publicó. Comprueba las postulaciones recibidas y las consultas; cambia el estado de una candidatura.
8. Edita Perfil y vuelve a abrirlo para comprobar que la información quedó guardada.

Toda esta actividad se guarda en el navegador utilizado. No requiere un servidor de cuentas ni envía archivos o mensajes reales.

La comprobación técnica se ejecuta con `npm run build` y `npm run test:platform`. Las pruebas recorren esas acciones, revisan la navegación móvil y comprueban que se conserva el diseño original indicado.

La nota histórica de **5/10** describe el estado anterior a estos cambios. No es una nueva valoración de la implementación actual.

## 16. Revisión de ingreso y creación de cuenta — 26 de octubre de 2026

### Contexto y criterio de producto

Se revisaron el modal de acceso, sus formularios, la lógica de cuentas locales, los accesos desde la cabecera y desde una oferta, la edición posterior del perfil y el sistema de diseño existente. Esta revisión conserva el acuerdo de una sola cuenta para trabajar, contratar, publicar y ofrecer servicios. No se recomienda volver a introducir una elección obligatoria de candidato o empresa en el registro.

La plataforma actual es una simulación local y eso es válido para esta etapa. `src/lib/demo.ts` guarda cuentas y actividad en el navegador; el PIN del formulario no se almacena ni se verifica como una contraseña. La interfaz no debe presentarlo como autenticación de producción. No se configuró un proveedor real de identidad ni se añadió un botón de Google sin conexión funcional.

### Fallos corregidos

| Problema observado | Corrección y resultado |
| --- | --- |
| Abrir Crear cuenta desde un scroll de 1.400 px llevaba la página a 0 px; al cerrar tampoco se recuperaba la posición. | Se eliminó la altura forzada del documento, se conservó su posición y se gestionó el foco sin desplazar la página. Abrir y cerrar conserva exactamente los 1.400 px en los cuatro tamaños comprobados. |
| En móvil, el nombre accesible del diálogo apuntaba a un título oculto en la columna lateral. | El nombre y la descripción del diálogo corresponden ahora al panel visible de ingreso o registro. El foco inicial va a su título, evitando abrir automáticamente el teclado del móvil. |
| Las pestañas tenían roles, pero no el comportamiento completo de teclado. | Se añadió selección con flechas, Inicio y Fin, un único tabulador activo y el retorno del foco al cerrar. El contenido de fondo queda inerte mientras está abierto el modal. |
| Errores generales y validación nativa sin relación clara con cada campo. | Se añadieron mensajes asociados a los campos, `aria-invalid`, conservación de lo escrito y foco en el primer error. Se comprueban vacíos, correo, celular y longitud del PIN de prueba. |
| El enlace de recuperación prometía una función inexistente en la simulación. | Se sustituyó por «Cómo funciona el PIN», con explicación informativa del comportamiento real. El control de mostrar u ocultar PIN actualiza su nombre y su estado accesibles. |
| Controles pequeños y botones de acceso con flechas decorativas. | Se usan los controles normales del sistema de diseño; cierre, pestañas y acciones principales tienen al menos 44 px de altura. Se añadió un token de texto para entradas con mínimo de 16 px y se mejoró la legibilidad del texto lateral. |
| El formulario podía quedar cortado en pantallas bajas. | La cápsula tiene desplazamiento interior y una altura máxima adaptada a la ventana. El botón de envío sigue siendo alcanzable. |
| Un mismo celular con y sin +591 podía reconocerse como dos cuentas. | Se normaliza el número al registrar, buscar una cuenta y comprobar duplicados. |
| La recuperación de sesiones antiguas contenía referencias rotas y abandonaba la migración silenciosamente. | Se reparó la búsqueda y creación de la cuenta anterior; el recorrido de migración se comprobó. |
| El acceso genérico enviaba siempre al inicio. | Se conserva el destino actual, incluida la consulta de la oferta, salvo que la acción indique expresamente otro destino. |

### Decisiones de UX/UI pendientes, ordenadas por impacto

Estas son recomendaciones para la siguiente versión, no funcionalidades que ya se hayan implementado.

| Prioridad | Hallazgo | Recomendación |
| --- | --- | --- |
| P1 antes de admitir cuentas reales | El PIN es decorativo desde el punto de vista de autenticación: se acepta cualquier valor de prueba de cuatro caracteres. | Elegir e integrar autenticación real, con verificación de identidad y sesiones. Si se mantiene una versión de pruebas, no pedir una contraseña personal ni dar a entender que el PIN protege la cuenta. |
| P1 | «Área de interés» aparece en el registro, pero `register()` no guarda su valor. | Retirarlo del alta y solicitarlo al completar el perfil; si se conserva, guardar y reutilizar realmente la elección. No pedir información que el sistema descarta. |
| P1 para la versión pública | Los accesos de ejemplo compiten con el ingreso y pueden hacer dudar sobre la finalidad de la plataforma. | Separar la experiencia de demostración de la experiencia pública. Mientras solo exista la simulación, mantener una explicación breve y honesta; ocultar la etiqueta no convierte el registro en real. Los botones de ejemplo deben nombrar claramente qué cuenta abren. |
| P1 para un registro real | El formulario no ofrece acceso a textos de privacidad y condiciones. | Preparar contenido real y enlaces accesibles antes de recoger datos para cuentas de producción. No colocar enlaces vacíos o documentos inventados. |
| P2 | El alta pide nombre, WhatsApp, ciudad, interés, correo y PIN antes de que la persona pueda continuar. | Reducir el primer paso a Google o correo y los datos mínimos de identidad. Pedir ciudad, teléfono y datos profesionales cuando se necesiten para postular, publicar o contactar. Explicar el motivo de cada dato obligatorio. |
| P2 | Cochabamba y Diseño y Multimedia están preseleccionados aunque la persona no los haya elegido. Además, Beni y Pando son departamentos dentro de un campo llamado Ciudad. | Evitar elecciones silenciosas. Separar departamento y ciudad o utilizar una lista coherente de ciudades; diferir esta selección al perfil si no es imprescindible para el alta. |
| P2 | La columna promocional, el fondo azul intenso y dos columnas de campos dan mucho peso visual al acceso. | En una siguiente composición, usar un formulario compacto en una columna, una introducción breve y una acción principal clara. La identidad de Eco puede mantenerse en tipografía, color y tono sin repetir toda la explicación de la portada. |
| P2 | El soporte lateral muestra un número para copiar, sin una acción directa desde ese texto. | Ofrecer «Ayuda por WhatsApp» como enlace funcional de comunicación escrita, conservando una alternativa visible. |

### Google y flujo recomendado

Google es una alternativa razonable para reducir escritura y gestión de contraseñas, manteniendo el correo como opción para quien no utilice Google. La propuesta es un único «Continuar con Google» válido tanto para registrarse como para ingresar, seguido de una alternativa por correo.

No basta con dibujar el botón: Google Identity Services requiere un ID de cliente y la verificación del token en el sistema que gestione las cuentas. Referencias oficiales: [configuración de Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) y [verificación del token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

Secuencia propuesta:

1. La persona elige Google o correo.
2. Se verifica su identidad con el proveedor real elegido.
3. Si es una cuenta nueva, se solicita solo la información adicional imprescindible.
4. Se vuelve a la oferta o acción desde la que inició el acceso.
5. Al postular o publicar por primera vez, se solicitan los datos de perfil necesarios en ese contexto, conservando el trabajo iniciado.

Si se elige un enlace o código por correo, la pantalla no necesita un campo de contraseña ni un enlace para recuperarla. Si se elige contraseña, deben existir comprobación y recuperación reales. La modalidad de acceso no debe exigir llamadas de voz.

### Verificación y límites

- `npm run build`: completado sin errores, 51 rutas estáticas.
- Playwright con Chromium: 1440 × 1000, 1024 × 600, 390 × 844 y 240 × 720. Sin desborde horizontal del modal; título accesible visible y envío alcanzable en los cuatro tamaños.
- Trece comprobaciones funcionales: conservación del scroll; pestañas y ciclo de foco; fondo inerte; campos vacíos e inválidos; duplicados por correo y teléfono; registro con conservación del destino; cuenta desconocida; ayuda informativa del PIN; mostrar/ocultar PIN; ingreso con celular local; conservación del identificador de oferta; cuenta de ejemplo; migración de sesión anterior.
- Sin errores JavaScript durante esos recorridos. El detector mecánico de diseño no emitió hallazgos en el componente, lo que no sustituye la revisión de producto.
- La evidencia de esta revisión anterior se retiró durante la limpieza del 26 de octubre. El acceso vigente se comprueba con `npm run test:auth`, descrito en la sección 17.
- Los tamaños móviles son ventanas emuladas de Chromium. No se afirma validación en un teléfono físico, Safari/iOS ni certificación de accesibilidad con lectores de pantalla.

La gestión del diálogo sigue el criterio de [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): foco interior, control por teclado, fondo inerte y devolución del foco al cerrar.

## 17. Simplificación del acceso y Google simulado — 26 de octubre de 2026

Esta sección actualiza las recomendaciones de registro de la sección 16. Lex confirmó que el acceso de Google también debe ser una simulación y pidió conservar un botón directo para ingresar como Valeria. No se necesita configurar OAuth en esta etapa.

| Cambio | Resultado |
| --- | --- |
| Modal demasiado ancho | Su contenedor tiene un máximo de 560 px con una regla específica, independiente del contenedor global de la página. En las capturas de escritorio verificadas, la cápsula visible mide entre 464 y 496 px. |
| Registro con campos innecesarios | Quedan nombre y apellido, correo y contraseña. Se retiraron WhatsApp, ciudad y área de interés; los datos profesionales y de contacto se completan en Perfil. Una cuenta nueva muestra «Añade tu ciudad» en lugar de una ciudad asignada o una coma suelta. |
| Ingreso con teléfono e icono incorrecto | El acceso usa correo electrónico y el icono de correo del componente compartido. |
| Textos técnicos del PIN y mensajes que interrumpían el recorrido | Se retiraron el enlace «Cómo funciona el PIN», el campo denominado PIN y la explicación técnica del prototipo dentro del modal. La documentación conserva el alcance real de la simulación. |
| Mostrar y ocultar contraseña | `PasswordField.astro` se reutiliza en los dos formularios. El ojo cambia a tachado al mostrar la contraseña y vuelve al estado inicial al ocultarla, cambiar de pestaña o cerrar. Se actualizan la etiqueta accesible y `aria-pressed`; lo escrito se conserva. |
| Google ausente | «Continuar con Google» aparece en los dos paneles. Al pulsarlo, se abre la cuenta local de Valeria y se conserva el destino solicitado. No se abre una pantalla de Google ni se solicitan credenciales externas. |
| Acceso directo para pruebas | «Ingresar como Valeria» queda visible al pie, separado de la acción principal. |
| Demasiado contenido promocional | Se retiró la columna lateral y el código de éxito sin uso. Se mantienen marca, títulos claros, formularios en una columna, iconos compartidos y controles normales del sistema de diseño. |

### Comprobaciones

`npm run build` genera 51 rutas sin errores. `npm run test:auth` pasó con Chromium en 1440 × 1000, 1024 × 600, 390 × 844 y 240 × 720: ancho acotado, sin desborde horizontal, controles de al menos 44 px, texto de entradas de al menos 16 px, scroll conservado, teclado, errores y duplicados, registro y perfil posterior, Google simulado desde ambos paneles y acceso de Valeria. No se registraron errores JavaScript.

Las capturas y el informe actual se encuentran en `artifacts/auth-simplification/`. No se conectó un servidor de autenticación ni se cambió el acuerdo de utilizar una simulación local.

## 18. Perfil con hover y cuenta al pie del menú móvil — 26 de octubre de 2026

En escritorio, el perfil utiliza el mismo comportamiento de hover que Publicaciones y Postulaciones. Se añadió un puente sobre el espacio entre el disparador y el panel, y un cierre breve diferido para que el cursor pueda alcanzar las opciones. Se conserva la apertura con teclado y toque, el cierre con Escape y la exclusión entre desplegables.

En el menú móvil, la navegación ocupa la parte superior. Avatar, nombre completo y «Mi perfil» aparecen una sola vez al pie, junto a «Cerrar sesión» con la variante de peligro del componente global. Por debajo de 360 px, las acciones se acomodan en dos filas para mantener legibles los nombres y conservar zonas táctiles cómodas. El fondo sigue bloqueado al abrir el menú y se recupera el scroll al cerrarlo.

Se corrigió también el evento de actualización de la cabecera para escuchar `incluxia:auth-changed`, que es el evento emitido por el estado de cuentas.

Verificación inicial: `npm run build` completado con 51 rutas; Playwright comprobó hover, paso al panel, cierre al salir, teclado, toque en pantalla amplia, navegación y cierre de sesión en 768, 390, 320 y 240 px, nombres largos y avatar sin foto. Sin errores JavaScript. La prueba se conserva como `npm run test:header`; genera `artifacts/header/verification.json` y sus capturas.

## 19. Limpieza de archivos y verificación vigente — 26 de octubre de 2026

Se retiraron de las carpetas activas siete componentes sin referencias, tres migraciones de imágenes ya completadas y dos pruebas anteriores dependientes del puerto 4322. Se conservan con su inventario anterior y hashes en `archive/maintenance-2026-10-26/`. La galería temporal de componentes permanece activa.

Se eliminaron 331 archivos regenerables o duplicados, unos 80 MiB. Los 24 PNG originales distintos de los maestros actuales, tres referencias visuales y los registros de procedencia se conservaron en el archivo de mantenimiento. Los originales y referencias pesados quedan fuera de Git. Los archivos anteriores de Blog, Nosotros e imágenes no se alteraron.

`IMAGENES.md` sigue siendo el catálogo vigente. `npm test` agrupa ocho verificaciones sobre `dist/`: recorrido entre cuentas, acceso, ofertas, contratación, gestión, imágenes, cabecera e inicio/historias. Los informes y capturas se regeneran bajo `artifacts/`; el resumen se escribe en `artifacts/verification/summary.json`. Las capturas maestras no se modifican durante una prueba normal.

Las comprobaciones de desborde admiten el espacio reservado por la barra de desplazamiento: fallan cuando el contenido supera el ancho de la ventana. La prueba de funcionamiento utiliza las ocho ofertas, los cuatro enlaces interiores, los menús de estado y el acceso al perfil móvil actuales, sin comparar el código visual con un commit anterior.
