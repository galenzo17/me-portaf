<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

  let container;
  // Asume una cantidad significativa de partículas para crear un efecto de cola visible
  const particleCount = 500; // Ajusta según la densidad deseada del tail
  let particleIndex = 0; // Este índice rotará a través de las partículas para reciclarlas
  const tailLifetimes = new Float32Array(particleCount); // Tiempos de vida de las partículas
  const tailLifetime = 2; // Tiempo en segundos que cada partícula será visible

  // Inicializa los tiempos de vida a 0
  for (let i = 0; i < particleCount; i++) {
    tailLifetimes[i] = 0;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const scene = new THREE.Scene();
  let meteorite;
  onMount(() => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.01;
    bloomPass.strength = 1.5; // Intensidad del glow
    bloomPass.radius = 0.55;

    const renderer = new THREE.WebGLRenderer();
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    window.addEventListener("mousedown", onDocumentMouseDown, false);
    function createMeteorite(x, y, z) {
      const geometry = new THREE.SphereGeometry(0.5, 4, 4); // Low poly sphere
      const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
      meteorite = new THREE.Mesh(geometry, material);

      // Posiciona el meteorito fuera de la vista inicialmente
      meteorite.position.set(x, y, z);

      scene.add(meteorite);
    }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener("mousemove", onMouseMove, false);

    function showTooltip(point, text) {
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "block";
      tooltip.innerHTML = text;

      const canvasBounds = renderer.domElement.getBoundingClientRect();
      const x = ((point.x + 1) / 2) * canvasBounds.width;
      const y = (-(point.y - 1) / 2) * canvasBounds.height;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Opcional, pero proporciona una experiencia más suave
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2; // Evita que la cámara gire debajo del plano horizontal

    function createStar(x, y, z, color) {
      const starGeometry = new THREE.SphereGeometry(0.5, 12, 12);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
      });
      const star = new THREE.Mesh(starGeometry, glowMaterial);
      star.position.set(x, y, z);
      scene.add(star);
      return star;
    }

    const worleyShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
      fragmentShader: /* glsl */ `
        // Incluye aquí tu GLSL para el shader de fragmento con ruido de Worley
        void main() {
            // Calcula el ruido de Worley y aplícalo como color
            gl_FragColor = vec4(vec3(1.0), 1.0); // Placeholder para el color
        }
    `,
      uniforms: {
        // Define aquí los uniforms necesarios para tu shader
      },
    });
    const cubes = [];
    const distance = 20; // Incrementa la separación entre cada cubo
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
      });
      const cube = new THREE.Mesh(geometry, worleyShaderMaterial);
      cube.position.z = -i * distance; // Ajusta la posición basándose en la nueva separación
      cube.rotation.x = Math.random() * 0.5; // Rotaciones leves para visibilidad
      cube.rotation.y = Math.random() * 0.5;
      scene.add(cube);
      cubes.push(cube);
    }
    function checkIntersects() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object === cubes[0]) {
          showTooltip(intersects[i].point, "Texto del cartelito");
          break;
        } else {
          console.log("HEREEE");
          const tooltip = document.getElementById("tooltip");
          tooltip.style.display = "none";
        }
      }
    }
    // cubes.forEach((cube, index) => {
    //   const sprite = createTextSprite(`↪ Buk ➡ https://buk.cl/
    //   mayo 2022-actualidad
    //   ● Diseño e implementación de la arquitectura del software e infraestructura (Paas , Saas)
    //   ● Planificación, ejecución e integración de nuevas features con sus respectivas
    //   pruebas (TDD)
    //   ● Monitoreo y análisis de rendimiento ${index + 1}`);
    //   sprite.position.copy(cube.position).add(new THREE.Vector3(0, 1.5, 0)); // Posiciona el texto encima del cubo
    //   //scene.add(sprite);
    //   updateSignPosition(cube, index);
    // });
    function updateSignPosition(cube, index) {
      const vector = new THREE.Vector3();
      cube.getWorldPosition(vector);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

      const info = document.getElementById(`info${index}`);
      if (info) {
        info.style.left = `${x}px`;
        info.style.top = `${y}px`;
        info.style.transform = "translate(-50%, -50%)";
      }
    }

    function updateTextPositions() {
      const vector = new THREE.Vector3(); // Vector para almacenar la posición proyectada

      // Suponiendo que `cube` es el objeto 3D al que quieres asociar el texto
      cubes[0].updateWorldMatrix(true, false);
      cubes[0].getWorldPosition(vector);
      vector.project(camera);

      // Convierte las coordenadas normalizadas (-1 a +1) a coordenadas de píxeles
      const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
      const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;

      // Actualiza la posición del elemento HTML
      const info = document.getElementById("info");
      console.log("info", info);
      //info.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    }
    //updateTextPositions();
    // Suponiendo que `cubes` es un arreglo que contiene tus cubos principales
    const orbitingCubes = [];
    const radius = 3; // Radio de la órbita alrededor del cubo principal

    cubes.forEach((cube, index) => {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Tamaño más pequeño para los cubos orbitantes
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const orbitingCube = new THREE.Mesh(geometry, material);

      // Posicionar el cubo orbitante inicialmente
      // Calcula la posición usando trigonometría
      const angle = Math.PI * 2 * (index / cubes.length); // Distribuye los cubos uniformemente en el círculo
      orbitingCube.position.x = cube.position.x + radius * Math.cos(angle);
      orbitingCube.position.y = cube.position.y; // Mantén el cubo orbitante en el mismo plano Y que el cubo principal
      orbitingCube.position.z = cube.position.z + radius * Math.sin(angle);

      scene.add(orbitingCube);
      orbitingCubes.push(orbitingCube); // Guarda los cubos orbitantes para la animación
    });

    function onDocumentMouseDown(event) {
      event.preventDefault();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(orbitingCubes);

      if (intersects.length > 0) {
        // Suponiendo que la primera intersección es el cubo que queremos
        emitParticles(intersects[0].object);
      }
    }
    let particleSystems = [];
    function emitParticles(orbitingCube) {
      const particleCount = 100; // Número de partículas a emitir
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
      });
      const velocities = []; // Almacenará las velocidades de las partículas

      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        // Inicializa las partículas en la posición del cubo
        positions[i * 3] = orbitingCube.position.x;
        positions[i * 3 + 1] = orbitingCube.position.y;
        positions[i * 3 + 2] = orbitingCube.position.z;

        // Asigna una velocidad aleatoria a cada partícula
        velocities.push(
          new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          )
            .normalize()
            .multiplyScalar(Math.random())
        );
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      const particleSystem = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );

      scene.add(particleSystem);

      // Programa la eliminación del sistema de partículas
      setTimeout(() => {
        scene.remove(particleSystem);
      }, 2000); // Ajusta el tiempo según la duración deseada del efecto

      // Añade la lógica para actualizar las partículas en tu ciclo de animación
      particleSystems.push({
        system: particleSystem,
        velocities: velocities,
        startTime: Date.now(),
      });
    }

    // let model;

    // const loader = new GLTFLoader();
    // loader.load(
    //   "src/routes/model.glb",
    //   (gltf) => {
    //     model = gltf.scene;
    //     scene.add(model);
    //     model.position.set(4, 0, 0);
    //     model.scale.set(3, 3, 3);
    //   },
    //   undefined,
    //   (error) => {
    //     console.error(error);
    //   }
    // );

    const stars = createStars();
    scene.add(stars);
    // for(const star of stars){

    // }
    // stars.forEach((star) => {
    //   const glowSize = 10; // Tamaño del resplandor
    //   const glowSprite = createGlowSprite(glowSize, star.material.color);
    //   star.add(glowSprite); // Añade el sprite de glow como hijo del objeto de la estrella
    // });
    //scene.add(stars);
    // const geometry = new THREE.SphereGeometry(80, 60, 40);
    // geometry.scale(-0.1, 0.1, 0.1); // Invierte la geometría para que la textura se aplique en el interior
    // const material = new THREE.MeshBasicMaterial({
    //   map: new THREE.TextureLoader().load("src/routes/esfera.png"),
    // });
    // const sphere = new THREE.Mesh(geometry, material);

    //

    camera.position.set(0, 1, 2); // Ajusta según la escala y posición de tu modelo
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    //scene.add(light);

    // Ajusta la posición inicial de la cámara para tener en cuenta la mayor separación
    camera.position.set(0, 5, 10);
    camera.lookAt(cubes[0].position);

    let currentTarget = 0;
    const clock = new THREE.Clock();
    let elapsedTime = 0;
    //const particleSystem = createTailForOrbitCube();
    //const particleCount = 1000;
    //const sizes = new Float32Array(particleCount);
    //scene.add(particleSystem);
    const tailSystem = createTailForOrbitCube();
    //scene.add(tailSystem);
    const positions = tailSystem.geometry.attributes.position.array;
    const sizes = tailSystem.geometry.attributes.size.array;
    let particleGeometry = tailSystem.geometry;
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    //scene.add(line);

    function animate() {
      requestAnimationFrame(animate);
      //pulseMaterial.uniforms.time.value += 0.2;
      // scene.children.forEach((child) => {
      //   if (child.isPoints && child !== tailSystem) {
      //     // Asegúrate de no animar la cola de los cubos
      //     child.rotation.y += 0.0001;
      //   }
      // });
      // Obtén el tiempo transcurrido para controlar la velocidad de la animación
      // elapsedTime += clock.getDelta();

      // // Actualiza la posición de cada cubo orbitante
      // orbitingCubes.forEach((orbitingCube, index) => {
      //   // Puedes ajustar la velocidad de la órbita modificando el multiplicador de elapsedTime
      //   const angle =
      //     elapsedTime * 0.5 + Math.PI * 2 * (index / orbitingCubes.length);
      //   orbitingCube.position.x =
      //     cubes[index].position.x + radius * Math.cos(angle);
      //   orbitingCube.position.z =
      //     cubes[index].position.z + radius * Math.sin(angle);

      //   if (tailLifetimes[particleIndex] <= 0) {
      //     const positionIndex = particleIndex * 3;
      //     positions[positionIndex] = orbitingCube.position.x;
      //     positions[positionIndex + 1] = orbitingCube.position.y;
      //     positions[positionIndex + 2] = orbitingCube.position.z;
      //     tailLifetimes[particleIndex] = tailLifetime - particleIndex;
      //   }
      //   // Mueve el meteorito
      //   // if (meteorite) {
      //   //   meteorite.position.x += -0.01;
      //   //   meteorite.position.z += -0.1;
      //   //   if (meteorite.position.x > 50) {
      //   //     // Suponiendo que 10 está fuera de la vista en el otro lado
      //   //     meteorite.position.x = -100; // Reinicia la posición para que parezca que pasa continuamente
      //   //   }
      //   // }
      //   particleIndex = (particleIndex + 1) % particleCount;
      // });
      // Calcula el delta de tiempo
      // const delta = clock.getDelta();
      // // Actualiza el tiempo de vida y el tamaño de las partículas
      // for (let i = 0; i < particleCount; i++) {
      //   if (tailLifetimes[i] > 0) {
      //     tailLifetimes[i] -= delta;
      //     // Opcional: Ajusta el tamaño de la partícula basado en el tiempo de vida restante
      //     sizes[i] = Math.max(0, 5 * (tailLifetimes[i] / tailLifetime)); // Ejemplo de disminución de tamaño
      //   }
      // }

      // particleGeometry.attributes.position.needsUpdate = true;
      // particleGeometry.attributes.size.needsUpdate = true;

      // const now = Date.now();

      // particleSystems.forEach((particleSystemData, index) => {
      //   if (now - particleSystemData.startTime > 2000) {
      //     // Tiempo de vida de las partículas
      //     particleSystems.splice(index, 1);
      //     return;
      //   }

      //   const positions =
      //     particleSystemData.system.geometry.attributes.position.array;
      //   particleSystemData.velocities.forEach((velocity, i) => {
      //     positions[i * 3] += velocity.x;
      //     positions[i * 3 + 1] += velocity.y;
      //     positions[i * 3 + 2] += velocity.z;
      //   });
      //   particleSystemData.system.geometry.attributes.position.needsUpdate = true;
      // });
      // cubes.forEach((cube, index) => {
      //   updateSignPosition(cube, index);
      // });
    }

    animate();

    function render() {
      requestAnimationFrame(render);
      controls.update(); // Solo necesario si enableDamping o autoRotate están habilitados
      //renderer.render(scene, camera);
      composer.render();
    }
    render();

    return () => {
      //renderer.domElement.removeEventListener("click", moveToNextCube);
      //container.removeChild(renderer.domElement);
    };
  });

  function createChecpointCube() {
    const cubes = [];
    const distance = 20; // Incrementa la separación entre cada cubo
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.z = -i * distance; // Ajusta la posición basándose en la nueva separación
      cube.rotation.x = Math.random() * 0.5; // Rotaciones leves para visibilidad
      cube.rotation.y = Math.random() * 0.5;
      scene.add(cube);
      cubes.push(cube);
    }
  }

  function createOrbitCube() {}

  function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
    });
    const starsCount = 10000;

    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    return stars;
  }

  function createTailForOrbitCube() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount).fill(5); // Inicializa todas las partículas con un tamaño base

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Configura el material como antes, asegurándote de que sea adecuado para partículas
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    return particleSystem;
  }

  function createModel() {}
</script>

<div bind:this={container}>
  <div
    id="tooltip"
    style="display: none; position: absolute; pointer-events: none; background-color: rgba(255, 255, 255, 0.5); backdrop-filter: blur(10px); border-radius: 8px; padding: 8px;"
  >
    Texto del cartelito
  </div>
</div>

<style>
</style>
