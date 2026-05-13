# Medplum como modelo: por qué leer (y contribuir a) su repo me hace más sabio y humilde

Llevo meses metido en interoperabilidad en salud. En el trabajo paso buena parte del día con GS1/UDI, parseando códigos de barras de productos médicos; en paralelo armo `health-interop`, un toolkit en Go para identificadores y mensajería clínica en LATAM. Y en algún momento, leyendo specs de FHIR a las once de la noche, me cansé de inventar la rueda en mi cabeza y empecé a leer Medplum en serio. Después empecé a contribuir — y en las últimas dos semanas terminé mandando PRs no solo ahí, sino también a OHIF Viewers y a Bun.

Este post es sobre eso: por qué Medplum se volvió mi referencia cuando quiero entender cómo se *hace bien* HL7/FHIR, y por qué meterme en su repo me bajó varios cambios de revoluciones al ego.

## Qué es Medplum, en una línea

Una plataforma FHIR-native, open source, escrita en TypeScript, con servidor, SDK, componentes de React y CLI. Apache 2.0. Para alguien construyendo en healthtech, es de los pocos lugares donde podés leer código de producción real implementando el estándar, sin tener que firmar un NDA ni pagar licencia.

## Por qué la tomo como modelo

Hay un patrón que se repite cuando uno trabaja con HL7: la spec es enorme, ambigua en partes, y cada implementador resuelve los huecos como puede. El resultado típico es que cada empresa tiene su propio dialecto de FHIR, y nadie tiene tiempo de escribir cómo lo resolvieron.

Medplum hace algo distinto: las decisiones están en el código, los tests son la documentación más honesta, y los issues son una clase magistral abierta sobre los casos borde del estándar. Algunas cosas que aprendí solo leyéndolo:

- Cómo modelar `Bundle` de tipo `transaction` sin que se te caiga el servidor cuando hay referencias circulares.
- Cómo construir queries FHIR-search que no terminen siendo SQL inviable.
- Cuándo conviene un `Subscription` y cuándo es overkill.
- Qué se gana usando `Resource.meta.tag` para multi-tenancy en serio (algo que en Bitua, con nuestro modelo CouchDB multi-cliente, resuena fuerte).

No estoy diciendo "copien Medplum". Estoy diciendo: si querés entender FHIR como lo entiende alguien que lo implementó en producción, ahí está, abierto, leíble.

## La parte humilde

Acá viene lo incómodo y lo bueno.

Yo tengo quince años escribiendo software. Pasé por IoT, ML, fintech, y ahora healthtech. Tengo opiniones fuertes sobre arquitectura, sobre TypeScript, sobre cómo se modelan dominios. Y entré al repo de Medplum pensando que iba a encontrar cosas para "mejorar".

Lo que encontré fue otra cosa. Encontré:

- Decisiones de diseño que al principio me parecieron raras y que, tres días después, entendí que eran exactamente correctas porque resolvían un caso del estándar que yo ni sabía que existía.
- Tests que cubren escenarios que en mi carrera nunca había considerado (¿qué pasa cuando una `Observation` referencia un `Patient` que fue mergeado en otro recurso? Spoiler: hay una respuesta canónica y Medplum la conoce).
- PRs viejos donde el equipo discute, durante días, una decisión que en mi cabeza habría tardado diez minutos en tomar mal.

Hay un punto donde uno tiene que decidir si quiere parecer experto o serlo. Leer este repo me forzó a aceptar que en FHIR yo recién estoy empezando, y que mi "experiencia general en software" no me compra tanto como creía. Eso es humildad, y es la única vía de entrada al aprendizaje real.

## La parte sabia

Contribuir, aunque sea con cosas chicas, cambia cómo leés tu propio código. En las últimas dos semanas mandé cuatro PRs a tres repos distintos. Los dejo acá con detalle porque, escribiendo este post, me di cuenta de que comparten una espina dorsal que no había visto antes.

### [Medplum #9131](https://github.com/medplum/medplum/pull/9131) — `fix(agent): return explicit error when upgrade artifact is missing` (mergeado)

El Medplum Agent — el cliente on-prem que conecta sistemas hospitalarios al servidor — spawneaba un proceso hijo para autoactualizarse y esperaba quince segundos con un timeout genérico cuando el release artifact no existía para el OS actual. El fix pre-valida que el artifact exista *antes* de spawnear y devuelve un error legible del tipo `No download URL found for release 'v4.2.5' for win32`. Quince segundos de espera silenciosa transformados en una línea de error accionable. Es la diferencia entre "esto está roto, no sé por qué" y "esto está roto, esto hay que arreglar". Mergeado a los pocos días, y ese badge de "Contribuyente" en el repo de Medplum es de las pocas cosas que me dejaron sonriendo solo frente a la pantalla.

### [Medplum #9170](https://github.com/medplum/medplum/pull/9170) — `fix(email): improve error messages when email feature is unavailable` (abierto)

Las rutas de email devolvían un `forbidden` combinado que mezclaba dos casos distintos: el proyecto no tiene la feature de email habilitada, y el usuario no es administrador. El PR los separa en dos mensajes específicos: `"Email feature is not enabled for this project"` cuando falta la feature, y un mensaje claro de permisos cuando falta el rol. El código original "funciona" — devuelve 403 — pero cualquier integrador que recibe ese 403 sin contexto pierde una hora intentando entender qué le falta. Separar las condiciones es trabajo de empatía con el siguiente desarrollador.

### [OHIF Viewers #6009](https://github.com/OHIF/Viewers/pull/6009) — `fix(DicomWebDataSource): set correct cross-service URLs on DICOMweb clients` (abierto)

OHIF es el viewer DICOM open source de referencia en imagen médica. Su `DicomWebDataSource` no asignaba las URLs cross-service (`wadoURL`, `qidoURL`, `stowURL`) después de construir el cliente, así que cuando `qidoRoot` y `wadoRoot` apuntan a paths distintos — clásico `/qidors/` versus `/wadors/` en despliegues reales — los requests salían contra el endpoint equivocado. Tres strings mal seteados, un bug silencioso, y exactamente el tipo de detalle que solo aparece cuando integrás contra infraestructura DICOM seria. Mandar el PR me obligó a leer cómo OHIF maneja sus DataSources, qué asume y qué no, y a aceptar que muchas decisiones de la base de código tienen veinte issues atrás que yo no había leído.

### [Bun #30561](https://github.com/oven-sh/bun/pull/30561) — `undici: remove polyfill, resolve to real npm package` (abierto)

Bun trae un polyfill built-in de `undici` (el HTTP client de Node) que es un stub incompleto: le faltan `Agent.compose()`, los interceptors reales, un `Dispatcher` que se comporte como el de upstream. Resultado: paquetes como `@distube/ytdl-core` o cualquier cosa que use HTTP avanzado se rompen silenciosamente cuando corren en Bun. El PR propone remover el polyfill y dejar que `require("undici")` resuelva al paquete real de npm. Menos código en Bun, más correcto, menos sorpresas para quien viene de Node esperando paridad. Lo interesante de mandarlo es que te obliga a leer cómo Bun maneja Node-compat — qué decisiones tomaron sobre qué polyfilear, dónde está la frontera entre "stub útil" y "stub que miente".

### El patrón

Escribiendo esto recién noté lo obvio: los cuatro PRs son sobre **claridad operacional**. Ninguno agrega features. Hacen que el error se entienda, que el routing apunte donde corresponde, que el comportamiento sea el que el usuario espera. Es trabajo aburrido. Es exactamente el tipo de trabajo que los mantainers no tienen tiempo de hacer y que un contribuidor externo puede aportar sin necesidad de "diseñar nada nuevo". También es el camino más corto para entender una base de código grande: arreglar un error message te obliga a leer todos los caminos por los que se llega a ese error.

Lo que noté de mí mismo después de empezar a mandar PRs:

- Empecé a escribir tests pensando en el caso borde primero, no al final.
- Cuando reviso código en Bitua, ahora pregunto "¿qué dice el estándar?" antes de "¿cómo lo resolvemos?". A veces no hay estándar, pero el reflejo de buscarlo te ahorra deuda futura.
- Aprendí a leer specs como quien lee jurisprudencia: con paciencia, asumiendo que cada palabra está ahí por algo.
- Y aprendí a aceptar feedback de mantainers que no tienen tiempo para tu ego. Te dicen "esto no", seco, y tenés que entender que es generosidad disfrazada de brevedad.

## Por qué importa, más allá de mí

En LATAM tenemos un problema concreto: muy poca gente con experiencia real en HL7/FHIR, muchísimos sistemas de salud que necesitan integrarse, y un mercado que está despertando. Cada persona que se sumerge en Medplum, o en HAPI, o en cualquier implementación open source seria, sube el piso técnico de toda la región.

No hace falta contribuir con algo grande. Documentar un caso de uso latino, traducir un ejemplo, abrir un issue bien escrito reportando un comportamiento ambiguo: todo eso es contribución. Y todo eso, en mi experiencia, te enseña más que diez cursos pagos.

## Cierre

Sigo siendo un junior en FHIR pretendiendo ser senior en software. Medplum me lo recuerda cada vez que abro su repo — pero también me dio el primer "Fusionado" en healthcare open source, y eso lo voy a recordar. OHIF me enseñó humildad en infraestructura médica: lo invisible importa, y la gente que mantiene esos viewers lo sabe mejor que yo. Bun me enseñó que los proyectos jóvenes y rápidos también tienen estándar de review serio.

Por mi lado, vengo construyendo [`health-interop`](https://github.com/galenzo17/health-interop): un toolkit MIT en Go para interoperabilidad sanitaria en LATAM. Arrancó con validación de identificadores (RUT chileno, CPF/CNPJ brasileños) y el roadmap incluye GS1, HIBC, HL7v2, MLLP, FHIR y terminología. Está abierto a issues y contribuciones — si te interesa el espacio, sumate.

Si trabajás en salud y todavía no contribuiste a nada open source, mi consejo es simple: arrancá por un error message mal redactado. Es la puerta más chica y la que más rápido te mete en la base de código. No por el currículum. Por la humildad que te entrega, y por la claridad que te deja después.

---

✍️ **Agustin Bereciartua Castillo**
