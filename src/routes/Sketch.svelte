<script lang="ts">
  import { onMount } from "svelte";
  import { Sketch } from "./Sketch.ts";
  let sketch: Sketch;
  onMount(() => {
    const container = document.getElementById("sketch-container");
    if (!container) return;
    sketch = new Sketch(container);
  });
  let todos = [
    { text: "Software Engineer", completed: false },
    { text: "code", completed: false },
    { text: "read", completed: false },
    { text: "born", completed: false },
  ];

  function toggleCompleted(index) {
    todos[index].completed = !todos[index].completed;
  }
  function printCameraInfo() {
    if (sketch) {
      sketch.printCameraValues();
    }
  }
</script>

<div class="overlay">
  <h1 class="title">Agus Dev</h1>
  <ul class="todo-list">
    {#each todos as { text, completed }, index}
      <li
        class:completed
        on:click={() => toggleCompleted(index)}
        on:keydown={(event) => event.key === "Enter" && toggleCompleted(index)}
      >
        {text}
      </li>
    {/each}
  </ul>
</div>
<div id="cameraInfo"></div>

<!-- Contenedor para Three.js -->
<div id="sketch-container">
  <button on:click={printCameraInfo}>Print Camera Info</button>
</div>
<div
  id="tooltip"
  style="position: absolute; display: none; background: #fff; padding: 10px; border-radius: 8px; pointer-events: none; z-index: 100;"
></div>

<style>
  :global(body) {
    margin: 0;
    font-family: "Courier New", Courier, monospace;
    overflow: hidden; /* Evita el desplazamiento si la escena 3D es grande */
  }
  #sketch-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, #ffffff 0%, #dcdcdc 100%);
  }

  .overlay {
    position: absolute;
    top: 20px; /* Espacio desde la parte superior */
    left: 20px; /* Espacio desde la izquierda */
    width: calc(100% - 40px); /* Ajuste de ancho según el espaciado */
    max-width: 300px; /* Máximo ancho del contenedor */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); /* Para soporte en Safari */
    background-color: rgba(
      255,
      255,
      255,
      0.4
    ); /* Fondo gris claro con transparencia */
    color: black;
    padding: 20px;
    box-sizing: border-box;
    transform: rotate(-5deg); /* Rota el contenedor para el efecto diagonal */
    z-index: 2; /* Asegura que esté sobre la escena 3D */
    border-radius: 15px;
  }

  .todo-list {
    list-style-type: none;
    padding: 0;
  }

  .todo-list li {
    margin: 10px 0;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  .todo-list li {
    margin: 10px 0;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .todo-list li.completed {
    text-decoration: line-through; /* Tacha el texto */
    color: #ccc; /* Cambia el color a gris */
  }
</style>
