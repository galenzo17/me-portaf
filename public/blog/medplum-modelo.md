# 🏥 Medplum como modelo

Llevo meses metido en interoperabilidad en salud. En el trabajo paso buena parte del día con GS1/UDI, parseando códigos de barras de productos médicos; en paralelo armo `health-interop`, un toolkit en Go para identificadores y mensajería clínica en LATAM. Y en algún momento, leyendo specs de FHIR a las once de la noche, me cansé de inventar la rueda en mi cabeza y empecé a leer Medplum en serio. Después empecé a contribuir — y en las últimas dos semanas terminé mandando PRs no solo ahí, sino también a OHIF Viewers y a Bun.

Este post es sobre eso: por qué Medplum se volvió mi referencia cuando quiero entender cómo se *hace bien* HL7/FHIR, y qué me enseñó meterme en su repo.

## 📦 Qué es Medplum, en una línea

Una plataforma FHIR-native, open source, escrita en TypeScript, con servidor, SDK, componentes de React y CLI. Apache 2.0. Para alguien construyendo en healthtech, es de los pocos lugares donde podés leer código de producción real implementando el estándar, sin tener que firmar un NDA ni pagar licencia.

## 🔍 Por qué la tomo como modelo

Hay un patrón que se repite cuando uno trabaja con HL7: la spec es enorme, ambigua en partes, y cada implementador resuelve los huecos como puede. El resultado típico es que cada empresa tiene su propio dialecto de FHIR, y nadie tiene tiempo de escribir cómo lo resolvieron.

Medplum hace algo distinto: las decisiones están en el código, los tests son la documentación más honesta, y los issues son una clase magistral abierta sobre los casos borde del estándar. Algunas cosas que aprendí solo leyéndolo:

- Cómo modelar `Bundle` de tipo `transaction` sin que se te caiga el servidor cuando hay referencias circulares.
- Cómo construir queries FHIR-search que no terminen siendo SQL inviable.
- Cuándo conviene un `Subscription` y cuándo es overkill.
- Qué se gana usando `Resource.meta.tag` para multi-tenancy en serio (algo que en Bitua, con nuestro modelo CouchDB multi-cliente, resuena fuerte).

No estoy diciendo "copien Medplum". Estoy diciendo: si querés entender FHIR como lo entiende alguien que lo implementó en producción, ahí está, abierto, leíble.

## 🪞 Lo que encontré (y no esperaba)

Entré al repo de Medplum pensando que iba a encontrar cosas para "mejorar". Lo que encontré fue otra cosa:

- Decisiones de diseño que al principio me parecieron raras y que, tres días después, entendí que eran exactamente correctas porque resolvían un caso del estándar que yo ni sabía que existía.
- Tests que cubren escenarios que en mi carrera nunca había considerado (¿qué pasa cuando una `Observation` referencia un `Patient` que fue mergeado en otro recurso? Spoiler: hay una respuesta canónica y Medplum la conoce).
- PRs viejos donde el equipo discute, durante días, una decisión que en mi cabeza habría tardado diez minutos en tomar mal.

Hay un punto donde uno tiene que decidir si quiere parecer experto o serlo. Leer este repo me forzó a aceptar que en FHIR yo recién estoy empezando, y que la experiencia general en software no compra tanto como uno cree.

## 🔧 Los PRs

Contribuir, aunque sea con cosas chicas, cambia cómo leés tu propio código. En las últimas dos semanas mandé cuatro PRs a tres repos distintos. Escribiendo este post me di cuenta de que comparten una espina dorsal que no había visto antes.

- ✅ [**Medplum #9131**](https://github.com/medplum/medplum/pull/9131) — El Agent esperaba quince segundos con un timeout silencioso cuando el release artifact no existía para el OS. El fix pre-valida y devuelve un error accionable. Mi primer "Fusionado" en healthcare open source.
- 🔄 [**Medplum #9170**](https://github.com/medplum/medplum/pull/9170) — Las rutas de email devolvían un 403 genérico que mezclaba "feature no habilitada" con "no sos admin". El PR separa las condiciones en dos mensajes específicos. Empatía con el siguiente integrador.
- 🔄 [**OHIF Viewers #6009**](https://github.com/OHIF/Viewers/pull/6009) — El `DicomWebDataSource` no asignaba las URLs cross-service después de construir el cliente. Tres strings mal seteados, requests saliendo contra el endpoint equivocado. El tipo de bug que solo aparece cuando integrás contra infraestructura DICOM real.
- 🔄 [**Bun #30561**](https://github.com/oven-sh/bun/pull/30561) — El polyfill built-in de `undici` es un stub incompleto que rompe paquetes que usan HTTP avanzado. El PR propone removerlo y resolver al paquete real de npm.

### 🧩 El patrón

Los cuatro PRs son sobre **claridad operacional**. Ninguno agrega features. Hacen que el error se entienda, que el routing apunte donde corresponde, que el comportamiento sea el que el usuario espera. Es trabajo aburrido y es exactamente el tipo de trabajo que un contribuidor externo puede aportar sin necesidad de "diseñar nada nuevo". También es el camino más corto para entender una base de código grande: arreglar un error message te obliga a leer todos los caminos por los que se llega a ese error.

Lo que cambió en mí después:

- 🧪 Empecé a escribir tests pensando en el caso borde primero, no al final.
- 📖 Cuando reviso código en Bitua, ahora pregunto "¿qué dice el estándar?" antes de "¿cómo lo resolvemos?".
- ⚖️ Aprendí a leer specs como quien lee jurisprudencia: con paciencia, asumiendo que cada palabra está ahí por algo.
- 🤝 Y aprendí a aceptar feedback de maintainers que no tienen tiempo para tu ego. Te dicen "esto no", seco, y tenés que entender que es generosidad disfrazada de brevedad.

## 🌎 Por qué importa, más allá de mí

En LATAM tenemos un problema concreto: muy poca gente con experiencia real en HL7/FHIR, muchísimos sistemas de salud que necesitan integrarse, y un mercado que está despertando. Cada persona que se sumerge en Medplum, o en HAPI, o en cualquier implementación open source seria, sube el piso técnico de toda la región.

No hace falta contribuir con algo grande. Documentar un caso de uso latino, traducir un ejemplo, abrir un issue bien escrito reportando un comportamiento ambiguo: todo eso es contribución. Y todo eso, en mi experiencia, te enseña más que diez cursos pagos.

## 🚪 Cierre

Sigo siendo un junior en FHIR pretendiendo ser senior en software. Medplum me lo recuerda cada vez que abro su repo — pero también me dio el primer "Fusionado" en healthcare open source. OHIF me enseñó que lo invisible importa. Bun me enseñó que los proyectos jóvenes también tienen estándar de review serio.

Por mi lado, vengo construyendo [`health-interop`](https://github.com/galenzo17/health-interop): un toolkit MIT en Go para interoperabilidad sanitaria en LATAM. Arrancó con validación de identificadores (RUT chileno, CPF/CNPJ brasileños) y el roadmap incluye GS1, HIBC, HL7v2, MLLP, FHIR y terminología. Está abierto a issues y contribuciones — si te interesa el espacio, sumate.

Si trabajás en salud y todavía no contribuiste a nada open source, mi consejo es simple: arrancá por un error message mal redactado. Es la puerta más chica y la que más rápido te mete en la base de código. No por el currículum. Por lo que te deja después.

---

✍️ **Agustin Bereciartua Castillo**
