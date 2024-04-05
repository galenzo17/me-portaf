<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  let container: HTMLElement;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    const textureLoader = new THREE.TextureLoader();
    // const geometry = new THREE.PlaneGeometry(5, 5);
    // const textureLoader = new THREE.TextureLoader();
    // const texture = textureLoader.load(
    //   "src/routes/Grabacindepantalladesde09-02-24180520-ezgif.com-cut.gif"
    // );

    // const material = new THREE.MeshBasicMaterial({ map: texture });
    // const plane = new THREE.Mesh(geometry, material);
    // scene.add(plane);
    // Suponiendo que ya tienes una escena, cámara y renderer configurados
    let isReturning = false;
    camera.position.z = 5;
    function returnToInitialPosition() {
      isReturning = true;
      const duration = 1000; // Duración de la animación en milisegundos
      const startTime = performance.now();

      function animate() {
        if (!isReturning) return;

        const elapsed = performance.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1); // Asegúrate de que la fracción no exceda 1

        // Interpola la rotación
        camera.quaternion.slerp(initialCameraQuaternion, fraction);

        // Interpola la posición
        camera.position.lerpVectors(
          camera.position,
          initialCameraPosition,
          fraction
        );

        if (fraction < 1) {
          requestAnimationFrame(animate);
        } else {
          // Finaliza la animación
          isReturning = false;
        }

        controls.update();
        renderer.render(scene, camera);
      }

      animate();
    }

    renderer.domElement.addEventListener("mouseup", () => {
      if (!controls.enabled) return;
      isReturning = false; // Detener la animación de retorno si se inicia otra interacción
      returnToInitialPosition();
    });

    renderer.domElement.addEventListener("touchend", () => {
      if (!controls.enabled) return;
      isReturning = false; // Detener la animación de retorno si se inicia otra interacción
      returnToInitialPosition();
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Configurar OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Opcional, pero hace los movimientos más fluidos
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = true; // Habilitar zoom
    controls.enablePan = true; // Habilitar pan

    // Guardar la posición inicial de la cámara para usarla más tarde
    const initialCameraPosition = camera.position.clone();
    const initialCameraQuaternion = camera.quaternion.clone();
    const frames = [];
    const frameCount = 50;
    for (let i = 0; i < frameCount; i++) {
      ///src/routes/gifAnim/b47248fcf51a4141ba8f4e77c31476c13zf7yCtlDuvOOZN4-51.png
      frames.push(
        textureLoader.load(
          `src/routes/gifAnim/b47248fcf51a4141ba8f4e77c31476c13zf7yCtlDuvOOZN4-${i}.png`
        )
      ); // Asegúrate de cargar cada cuadro
    }
    const material = new THREE.MeshBasicMaterial({ map: frames[0] }); // Inicia con el primer cuadro
    const geometry = new THREE.PlaneGeometry(5, 5);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let currentFrame = 0;
    let frameDelay = 100; // Controla la velocidad de la animación (menor es más rápido, mayor es más lento)
    let lastFrameChangeTime = Date.now();
    function animate() {
      requestAnimationFrame(animate);
      let now = Date.now();
      let deltaTime = now - lastFrameChangeTime;

      if (deltaTime >= frameDelay) {
        currentFrame = (currentFrame + 1) % frameCount;
        material.map = frames[currentFrame];
        material.needsUpdate = true;
        lastFrameChangeTime = now;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  });
</script>

<div bind:this={container}></div>
