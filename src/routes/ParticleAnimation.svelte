<!-- ParticleAnimation.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";

  let container: HTMLElement;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    let mouse = {
      x: undefined,
      y: undefined,
    };

    // Actualizar la posición del ratón en movimiento
    container.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Partículas
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const posArray = new Float32Array(particleCount * 3); // x,y,z por partícula
    for (let i = 0; i < particleCount * 3; i++) {
      // Distribución aleatoria de partículas
      posArray[i] = (Math.random() - 0.5) * (Math.random() * 5);
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    // Material de partículas
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.025,
      color: "#white",
    });

    // Sistema de partículas
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotación de partículas para demostrar animación
      particleMesh.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();
  });
</script>

<div bind:this={container}></div>

<style>
  div {
    width: 100%;
    height: 100vh;
  }
</style>
