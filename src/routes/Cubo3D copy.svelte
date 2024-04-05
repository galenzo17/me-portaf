<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    window.addEventListener("mousedown", onDocumentMouseDown, false);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Opcional, pero proporciona una experiencia más suave
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2; // Evita que la cámara gire debajo del plano horizontal

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

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
    cubes.forEach((cube, index) => {
      const sprite = createTextSprite(`Cubo ${index + 1}`);
      sprite.position.copy(cube.position).add(new THREE.Vector3(0, 1.5, 0)); // Posiciona el texto encima del cubo
      scene.add(sprite);
    });
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
    // const geometry = new THREE.SphereGeometry(80, 60, 40);
    // geometry.scale(-0.1, 0.1, 0.1); // Invierte la geometría para que la textura se aplique en el interior
    // const material = new THREE.MeshBasicMaterial({
    //   map: new THREE.TextureLoader().load("src/routes/esfera.png"),
    // });
    // const sphere = new THREE.Mesh(geometry, material);

    // scene.add(sphere);

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
    scene.add(tailSystem);
    const positions = tailSystem.geometry.attributes.position.array;
    console.log("positions", positions);
    const sizes = tailSystem.geometry.attributes.size.array;
    let particleGeometry = tailSystem.geometry;
    function animate() {
      requestAnimationFrame(animate);
      // Obtén el tiempo transcurrido para controlar la velocidad de la animación
      elapsedTime += clock.getDelta();

      // Actualiza la posición de cada cubo orbitante
      orbitingCubes.forEach((orbitingCube, index) => {
        // Puedes ajustar la velocidad de la órbita modificando el multiplicador de elapsedTime
        const angle =
          elapsedTime * 0.5 + Math.PI * 2 * (index / orbitingCubes.length);
        orbitingCube.position.x =
          cubes[index].position.x + radius * Math.cos(angle);
        orbitingCube.position.z =
          cubes[index].position.z + radius * Math.sin(angle);

        if (tailLifetimes[particleIndex] <= 0) {
          const positionIndex = particleIndex * 3;
          positions[positionIndex] = orbitingCube.position.x;
          positions[positionIndex + 1] = orbitingCube.position.y;
          positions[positionIndex + 2] = orbitingCube.position.z;
          tailLifetimes[particleIndex] = tailLifetime - particleIndex;
          console.log(
            "tailLifetimes[particleIndex]",
            tailLifetimes[particleIndex]
          );
        }
        particleIndex = (particleIndex + 1) % particleCount;
      });
      // Calcula el delta de tiempo
      const delta = clock.getDelta();
      // Actualiza el tiempo de vida y el tamaño de las partículas
      for (let i = 0; i < particleCount; i++) {
        if (tailLifetimes[i] > 0) {
          tailLifetimes[i] -= delta;
          // Opcional: Ajusta el tamaño de la partícula basado en el tiempo de vida restante
          sizes[i] = Math.max(0, 5 * (tailLifetimes[i] / tailLifetime)); // Ejemplo de disminución de tamaño
        }
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.size.needsUpdate = true;

      const now = Date.now();

      particleSystems.forEach((particleSystemData, index) => {
        if (now - particleSystemData.startTime > 2000) {
          // Tiempo de vida de las partículas
          particleSystems.splice(index, 1);
          return;
        }

        const positions =
          particleSystemData.system.geometry.attributes.position.array;
        particleSystemData.velocities.forEach((velocity, i) => {
          positions[i * 3] += velocity.x;
          positions[i * 3 + 1] += velocity.y;
          positions[i * 3 + 2] += velocity.z;
        });
        particleSystemData.system.geometry.attributes.position.needsUpdate = true;
      });
      renderer.render(scene, camera);
    }

    animate();

    function render() {
      requestAnimationFrame(render);
      controls.update(); // Solo necesario si enableDamping o autoRotate están habilitados
      renderer.render(scene, camera);
    }
    render();

    return () => {
      //renderer.domElement.removeEventListener("click", moveToNextCube);
      container.removeChild(renderer.domElement);
    };
  });

  function createTextSprite(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256; // Ajusta según el tamaño de tu texto
    canvas.height = 128; // Ajusta según el tamaño de tu texto
    context.font = "Bold 40px Arial";
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    context.fillText(text, 50, 50); // Ajusta según necesidad

    // Crea la textura y el sprite
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    return sprite;
  }

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

<div bind:this={container}></div>
