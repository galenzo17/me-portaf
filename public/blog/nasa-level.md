# 🚀 La búsqueda (imposible) del NASA level code

Hace un tiempo me crucé con *The Power of 10*, las reglas que Gerard Holzmann escribió en el JPL para código de misiones espaciales. Sin recursión. Loops con cota fija. Asignación dinámica solo al inicio. Funciones cortas. Asserts en todos lados. Dos analizadores estáticos compitiendo, ambos con warnings activados.

Lo leí desde un lugar incómodo: yo no escribo software de naves. Trabajo en healthtech, en una startup chica, manteniendo un sistema RFID que vive en hospitales de Latinoamérica. No es Marte. Pero tampoco es trivial: si una etiqueta UDI se parsea mal, alguien puede terminar usando el lente equivocado en una cirugía. 🏥

Desde ahí empezó algo que no me animaría a llamar *"aplicar NASA level code"*. Sería pretencioso. Es más una búsqueda. Un norte difuso al que apuntar sabiendo que no se llega.

---

## ✅ Lo que sí pude integrar

- 🔁 **Loops acotados.** Todo iterador sobre datos externos tiene una cota dura. No confío en que un GS1 mal formado no me mande a un `while` infinito.
- 🚨 **Validación temprana, falla explícita.** Si un código de barras llega raro, prefiero loguear el raw y devolver datos parciales antes que adivinar.
- ✂️ **Funciones cortas, una responsabilidad.** Mi parser empezó como un monolito de casi 2000 líneas. Hoy lo estoy descomponiendo. No porque sea elegante: porque cuando algo falla en producción, quiero saber dónde mirar en menos de un minuto.
- 📝 **Logs tempranos, no tardíos.** Registro el input crudo antes de tocarlo. Aprendí esto a la mala, persiguiendo bugs que dependían de un caracter invisible que ya nadie tenía.
- 🧪 **Tests con datos reales.** Tengo una colección de etiquetas IOL reales que rompieron el parser alguna vez. Cada bug nuevo entra como test antes de arreglarse.

---

## 🚧 Lo que no puedo aplicar (todavía o nunca)

No tengo verificación formal. No tengo dos analizadores estáticos compitiendo. No escribo en C ni nada cercano. Mi stack (TypeScript, Bun, CouchDB) no fue diseñado para garantías estrictas de memoria.

Y está bien.

---

## 💡 La pregunta que sí me sirve

La pregunta no es *"¿estoy llegando al NASA level?"*. Es: *"¿qué de todo eso sobrevive el viaje hasta una startup de healthtech, con plazos reales y un equipo chico?"*.

> La respuesta, hasta ahora, es: la actitud más que la regla. Asumir que el código va a fallar. Asumir que el input va a venir roto. Asumir que el próximo que lea esto en seis meses voy a ser yo, y no me voy a acordar de nada.

---

## 🦫 Próximos pasos: por qué Go y por qué un scanner

Hay una pieza que en TypeScript me incomoda y que creo que vale la pena mover de stack: el parseo y validación de códigos de salud. GS1, HIBC, UDI, identificadores nacionales (RUT, CPF, CNPJ), HL7v2. Todo eso es exactamente el tipo de problema donde uno quiere garantías fuertes, una superficie chica, y binarios sin runtime que pesen.

Ahí Go encaja bien:

- 📦 **Tipado estático estricto y compilación a binario único.** Un CLI de validación que cualquiera puede correr sin instalar nada.
- ⚠️ **Errores como valores.** Cada llamada que puede fallar te obliga a recibir el `error` y decidir qué hacer ahí mismo. No hay excepciones que se escapen silenciosas tres frames más arriba. La fricción de escribir `if err != nil` después de cada llamada, para este tipo de problema, se vuelve una fortaleza: rima con asumir que el input va a venir roto y que el código va a fallar.
- 🔬 **Tests y fuzzing nativos.** Para parsers de formatos hostiles (los códigos de barras médicos lo son), fuzzing no es un lujo: es la única forma de dormir tranquilo.
- ⚡ **Concurrencia simple.** Cuando el scanner tenga que correr sobre un lote grande de etiquetas o consultar fuentes de recall, no quiero pelear con un event loop.
- 🧰 **Stdlib que cubre el caso.** Para parsers y validadores, lo que Go trae de fábrica (encoding, regexp, testing, fuzz) alcanza para la mayor parte. El árbol de dependencias se mantiene chico por la forma del problema, lo que hace más simple sostener la librería en el tiempo.

La idea es construir una librería abierta, MIT, que exponga primero validadores de identificadores LATAM y después parsers de los estándares de salud que más nos cuestan en la práctica. Un solo `validate` por formato, una sola fuente de verdad. Que el día que alguien en otra startup de la región tenga que parsear un GS1 raro, no tenga que reescribirlo desde cero. 🌎

El scanner viene después: un binario que toma una etiqueta cruda, la clasifica, y devuelve qué pudo extraer y con qué nivel de confianza. La pieza que hoy vive enterrada dentro de mi parser de TypeScript, sacada a la luz y endurecida.

No es NASA level. Pero es un paso en esa dirección: mover lo crítico a un terreno donde las reglas estrictas cuestan menos de aplicar.

---

*No estoy escribiendo código de naves. Pero alguien en un quirófano está confiando en que mi parser entienda bien una fecha de vencimiento. Eso ya es bastante peso para tomarse en serio el oficio.* 🛡️
