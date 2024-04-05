import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface Shader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform };
}

export class Sketch {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  particlesGeometry: THREE.BufferGeometry;
  checkpoints: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.ShaderMaterial,
    THREE.Object3DEventMap
  >[];
  composer;
  constructor(container: HTMLElement) {
    this.initScene(container);
    this.configureControls();
    this.initPostProcessing();

    this.createParticles();
    this.createCheckpoints();
    this.setupEventListeners();
    this.animate();
  }

  // constructor(container: HTMLElement) {
  //   this.scene = new THREE.Scene();
  //   this.camera = new THREE.PerspectiveCamera(
  //     75,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     1000
  //   );
  //   this.camera.position.z = 5;

  //   this.renderer = new THREE.WebGLRenderer({ antialias: true });
  //   this.renderer.setSize(window.innerWidth, window.innerHeight);
  //   this.renderer.setPixelRatio(window.devicePixelRatio);
  //   container.appendChild(this.renderer.domElement);

  //   this.scene.background = new THREE.Color(0x202020); // Gris oscuro

  //   this.configureControls();

  //   // Configuración de EffectComposer y passes
  //   this.composer = new EffectComposer(this.renderer);
  //   this.composer.addPass(new RenderPass(this.scene, this.camera));

  //   const bloomPass = new UnrealBloomPass(
  //     new THREE.Vector2(window.innerWidth, window.innerHeight),
  //     1.5,
  //     0.4,
  //     0.85
  //   );
  //   bloomPass.threshold = 0.21;
  //   bloomPass.strength = 1.5; // Ajusta estos valores según sea necesario
  //   bloomPass.radius = 0.55;
  //   this.composer.addPass(bloomPass);
  //   this.particlesGeometry = new THREE.BufferGeometry();
  //   // Continuar con la creación de partículas y checkpoints
  //   this.createParticles();
  //   this.createCheckpoints();

  //   // Añade un escuchador de eventos para el movimiento del mouse
  //   window.addEventListener("mousemove", this.onMouseMove, false);

  //   // Iniciar la animación
  //   this.animate();
  // }
  initScene(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x202020); // Gris oscuro
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.21;
    bloomPass.strength = 1.5; // Ajusta estos valores según sea necesario
    bloomPass.radius = 0.55;
    this.composer.addPass(bloomPass);
  }
  setupEventListeners() {
    window.addEventListener("mousemove", this.onMouseMove, false);
  }

  configureControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Restringir el movimiento vertical
    this.controls.minPolarAngle = Math.PI / 2; // Impide el movimiento hacia arriba
    this.controls.maxPolarAngle = Math.PI / 2; // Impide el movimiento hacia abajo

    // Deshabilitar zoom y desplazamiento panorámico
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    // Configuraciones adicionales de los controles aquí si es necesario

    // Asegurar que los controles se actualicen en cada frame
    this.controls.update();
  }

  onMouseMove = (event) => {
    // Convertir la posición del mouse a coordenadas normalizadas para Three.js
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Actualizar el raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.checkpoints);

    const tooltip = document.getElementById("tooltip");
    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0].object;
      tooltip.style.display = "block";
      tooltip.innerHTML = firstIntersectedObject.userData.info; // Usa la información almacenada en userData
      tooltip.style.left = event.clientX + "px";
      tooltip.style.top = event.clientY + "px";
    } else {
      tooltip.style.display = "none";
    }
  };

  createCheckpoints() {
    const checkpointCount = 5; // Número de checkpoints
    const checkpoints = []; // Almacenará los cubos// Material blanco
    const vertexShaderCode = `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    const fragmentShaderCode = `
    uniform vec3 glowColor;
    void main() {
        gl_FragColor = vec4(glowColor, 1.0); // Color sólido
    }
    `;

    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      uniforms: {
        glowColor: { value: new THREE.Color(0xffffff) }, // Cambiado a blanco
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < checkpointCount; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1); // Tamaño del cubo
      const checkpoint = new THREE.Mesh(geometry, glowMaterial);

      checkpoint.position.x = i * 2 - (checkpointCount - 1); // Organizados de izquierda a derecha
      checkpoint.position.y = Math.random() * 4 - 2; // Posición Y aleatoria
      checkpoint.position.z = -i * 2; // Ordenados en Z según su inclusión
      checkpoint.userData = {
        info: "Información relevante aquí", // Asegúrate de personalizar esto para cada checkpoint
      };

      this.scene.add(checkpoint); // Asumiendo que 'this.scene' es tu escena de Three.js
      checkpoints.push(checkpoint);
    }

    this.checkpoints = checkpoints; // Almacena la referencia a los checkpoints si necesitas acceder a ellos más tarde
  }

  createParticles(): void {
    this.particlesGeometry = new THREE.BufferGeometry();
    const count = 200; // Número de partículas

    const positions = new Float32Array(count * 3); // x, y, z para cada partícula
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20; // x, amplía el rango para más ancho
      positions[i + 1] = (Math.random() - 0.5) * 10; // y, ajusta según necesites
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    this.particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Aquí debes reemplazar vertexShaderCode y fragmentShaderCode
    // con el código GLSL de tus shaders.
    const vertexShaderCode = `// vertexShader.glsl
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = .09 * (300.0 / -mvPosition.z); // Ajusta el tamaño de la partícula según la distancia
        gl_Position = projectionMatrix * mvPosition;
    }
    
    `; // Tu código GLSL para el vertex shader
    const fragmentShaderCode = `// fragmentShader.glsl
    uniform vec3 color;
    void main() {
        float distance = length(gl_PointCoord - vec2(0.5, 0.5));
        float alpha = 1.0 - smoothstep(0.3, 0.5, distance); // Suaviza el borde de la partícula
        gl_FragColor = vec4(color * alpha, alpha);
    }
    
    `; // Tu código GLSL para el fragment shader

    // Material con shader de brillo
    const particlesMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      uniforms: {
        color: { value: new THREE.Color(0xffffff) }, // Color blanco, ajusta según necesites
      },
      transparent: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(
      this.particlesGeometry,
      particlesMaterial
    );
    this.scene.add(particles);
  }
  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  animate = (): void => {
    requestAnimationFrame(this.animate);
    // Necesario si enableDamping = true
    this.controls.update();
    const positions = this.particlesGeometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      // Mover partículas diagonalmente
      positions[i] -= 0.01; // Mueve en X
      positions[i + 1] -= 0.01; // Mueve en Y

      // Reiniciar posición si la partícula sale de un límite visible
      if (positions[i] < -5 || positions[i + 1] < -5) {
        positions[i] = Math.random() * 5;
        positions[i + 1] = Math.random() * 5 + 5; // Asegura que se reinicien arriba a la derecha
      }
    }

    this.particlesGeometry.attributes.position.needsUpdate = true;
    this.composer.render();
  };

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  applyShaderToObject(object: THREE.Mesh, shader: Shader): void {
    const material = new THREE.ShaderMaterial({
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      uniforms: shader.uniforms,
    });

    object.material = material;
  }
}
