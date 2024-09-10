import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import GUI from "lil-gui";

interface Shader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [uniform: string]: THREE.IUniform };
}

export class Sketch {
  scene: THREE.Scene | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  controls: OrbitControls | null = null;
  particlesGeometry: THREE.BufferGeometry | null = null;
  checkpoints:
    | THREE.Mesh<
        THREE.BoxGeometry,
        THREE.ShaderMaterial,
        THREE.Object3DEventMap
      >[]
    | null = null;
  composer: EffectComposer | null = null;
  currentIntersected = null;
  currentlyHovered: THREE.Object3D<THREE.Object3DEventMap> | null = null;
  lastMouseMove: number;
  mouseMoveInterval: number;
  uniforms;
  uniformsPlane;
  clock = new THREE.Clock();
  terrainGeometry: THREE.PlaneGeometry;
  planeMaterial;
  gui: GUI;
  checkpointsGroup: THREE.Group;
  detailGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationClip;
  lastTime: number = 0;
  checkpointMaterial;
  constructor(container: HTMLElement) {
    this.initScene(container);
    this.configureControls();

    this.createParticles();
    this.createCheckpoints();
    this.setupEventListeners();
    this.addTerrain();
    //this.initPostProcessing();
    //window.addEventListener("mousemove", this.onMouseMove, false);
    this.currentlyHovered = null;
    this.lastMouseMove = 0;
    this.mouseMoveInterval = 100; // Intervalo en ms, ajusta según necesidad
    container.addEventListener("mousemove", this.throttledOnMouseMove, false);
    this.animate();
  }

  throttledOnMouseMove = (event) => {
    const now = Date.now();

    if (now - this.lastMouseMove >= this.mouseMoveInterval) {
      this.lastMouseMove = now;
      this.onMouseMove(event);
    }
  };

  initScene(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = -27;
    this.camera.position.x = -133;
    this.camera.position.y = 16;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Color negro completamente transparente

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    //this.scene.background = new THREE.Color(0x202020); // Gris oscuro

    //this.addCameraGUI();
  }
  printCameraValues() {
    console.log("Camera Position:", this.camera.position);
    console.log("Camera Rotation:", this.camera.rotation);
    console.log("Camera Quaternion:", this.camera.quaternion); // La rotación a menudo se maneja mejor a través de cuaterniones
  }

  addCameraGUI() {
    this.gui = new GUI();
    const cameraFolder = this.gui.addFolder("Camera");
    cameraFolder
      .add(this.camera.position, "x", -200, 200)
      .name("Position X")
      .listen();
    cameraFolder
      .add(this.camera.position, "y", -200, 200)
      .name("Position Y")
      .listen();
    cameraFolder
      .add(this.camera.position, "z", -200, 200)
      .name("Position Z")
      .listen();
    const self = this;

    const rotation = {
      get x() {
        return THREE.MathUtils.radToDeg(self.camera.rotation.x);
      },
      set x(deg) {
        self.camera.rotation.x = THREE.MathUtils.degToRad(deg);
      },
      get y() {
        return THREE.MathUtils.radToDeg(self.camera.rotation.y);
      },
      set y(deg) {
        self.camera.rotation.y = THREE.MathUtils.degToRad(deg);
      },
      get z() {
        return THREE.MathUtils.radToDeg(self.camera.rotation.z);
      },
      set z(deg) {
        self.camera.rotation.z = THREE.MathUtils.degToRad(deg);
      },
    };

    // Agrega controles de rotación a la GUI usando el objeto `rotation` modificado
    cameraFolder.add(rotation, "x", -180, 180).name("Rotation X").listen();
    cameraFolder.add(rotation, "y", -180, 180).name("Rotation Y").listen();
    cameraFolder.add(rotation, "z", -180, 180).name("Rotation Z").listen();

    cameraFolder.open();
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
    bloomPass.strength = 0.3; // Ajusta estos valores según sea necesario
    bloomPass.radius = 0.55;
    this.composer.addPass(bloomPass);
  }

  setupEventListeners() {
    window.addEventListener("click", this.onMouseClick, false);

    window.addEventListener("mousemove", this.onMouseMove, false);
  }

  configureControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Restringir el movimiento vertical
    // this.controls.minPolarAngle = Math.PI / 2; // Impide el movimiento hacia arriba
    //this.controls.maxPolarAngle = Math.PI / 2; // Impide el movimiento hacia abajo

    // Deshabilitar zoom y desplazamiento panorámico
    this.controls.enableZoom = true;
    this.controls.enablePan = true;

    // Configuraciones adicionales de los controles aquí si es necesario

    // Asegurar que los controles se actualicen en cada frame
    this.controls.update();
  }

  onMouseMove = (event) => {
    if (this.renderer !== null) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Actualizar el raycaster
      const raycaster = new THREE.Raycaster();
      if (!this.camera) return;
      raycaster.setFromCamera(mouse, this.camera);
      if (!this.checkpoints) return;
      const intersects = raycaster.intersectObjects(this.checkpoints);

      const tooltip = document.getElementById("tooltip");
      if (!tooltip) return;
      if (intersects.length > 0) {
        console.log("intersects[0].object", intersects[0].object);
        if (!intersects[0].object.userData.info) return;
        tooltip.style.display = "block";
        tooltip.innerHTML = intersects[0].object.userData.info; // Usa la información almacenada en userData
        tooltip.style.left = event.clientX + "px";
        tooltip.style.top = event.clientY + "px";
      } else {
        tooltip.style.display = "none";
      }
      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (this.currentlyHovered !== intersected) {
          // Marcar el nuevo checkpoint como actualmente seleccionado
          this.currentlyHovered = intersected;
        }
      } else if (this.currentlyHovered) {
        // Restablecer si el mouse no está sobre ningún checkpoint
        this.currentlyHovered = null;
      }
    }
  };
  onMouseClick = (event) => {
    // Reutiliza la lógica del raycaster de onMouseMove
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.checkpoints);

    if (intersects.length > 0) {
      const targetCheckpoint = intersects[0].object;
      this.moveCameraToCheckpoint(targetCheckpoint);
    }
  };
  moveCameraToCheckpoint = (checkpoint) => {
    const targetY = checkpoint.position.y + 16; // Ajusta este valor para cambiar la altura de la cámara
    const targetPosition = checkpoint.position
      .clone()
      .add(new THREE.Vector3(0, targetY, 5)); // Ajusta este vector para cambiar la posición final de la cámara

    // Interpolar suavemente hacia la posición objetivo
    const duration = 4000; // Duración de la animación en milisegundos
    const startTime = Date.now();

    const animateCameraMove = () => {
      const elapsedTime = Date.now() - startTime;
      const fraction = elapsedTime / duration;

      if (fraction < 1) {
        // Interpolar la posición de la cámara
        this.camera.position.lerpVectors(
          this.camera.position,
          targetPosition,
          fraction
        );
        requestAnimationFrame(animateCameraMove);
      } else {
        // Asegurarse de que la cámara llegue a la posición objetivo
        this.camera.position.copy(targetPosition);
      }
      this.controls.target.copy(checkpoint.position);
      this.controls.update();
      //this.camera.lookAt(checkpoint.position); // Asegura que la cámara siempre mire al checkpoint
    };

    animateCameraMove();
  };

  createMaterial() {
    const vertexShader = `
    varying vec2 vUv;
  
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    //   const fragmentShader = `
    //   varying vec2 vUv;
    //   uniform float time;

    //   // Función simple para generar ruido
    //   float random (vec2 st) {
    //     return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    //   }

    //   void main() {
    //     // Generar ruido basado en la posición del fragmento y el tiempo
    //     float noise = random(vUv + time);
    //     vec3 color = vec3(noise, noise, noise); // Color gris basado en el ruido
    //     gl_FragColor = vec4(color, 1.0);
    //   }
    // `;
    const fragmentShader = `
      varying vec2 vUv;
      uniform float time;

      float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        float noise = random(vUv + time);
        // Base color azul para mejor visualización
        vec3 baseColor = vec3(0.1, 0.2, 0.5);
        vec3 color = mix(baseColor, vec3(1.0, 1.0, 1.0), noise); // Mezclar base con blanco basado en el ruido
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.checkpointMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        time: { value: 0.0 },
        glowColor: { value: new THREE.Color(0x7f8fa6) }, // Azul medio gris
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  setPositionAndScale(
    checkpoint: THREE.Mesh,
    index: number,
    totalCount: number
  ): THREE.Mesh {
    checkpoint.position.x = index * 4 - totalCount * 2;
    checkpoint.position.y = Math.random() * 4 - 2; // Esto establece la altura Y aleatoriamente
    checkpoint.position.z = -index * 9; // Esto coloca el objeto a lo largo del eje Z
    return checkpoint;
  }

  setCheckpointData(checkpoint: THREE.Object3D): void {
    checkpoint.userData = {
      info: "Información relevante aquí", // Aquí puedes expandir con más datos según sea necesario
    };
  }

  createGeometricShape() {
    const shapes = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5), // Cubo
      new THREE.ConeGeometry(0.5, 1, 4), // Pirámide (cono con 4 caras)
      new THREE.SphereGeometry(0.5, 32, 32), // Esfera
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32), // Cilindro
    ];
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff,
    });
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return new THREE.Mesh(shape, material);
  }

  createLine(checkpoint: THREE.Mesh, geometricShape: THREE.Mesh) {
    const material = new THREE.LineBasicMaterial({ color: 0x00000f }); // Azul, o elige tu color
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(
        checkpoint.position.x,
        checkpoint.position.y,
        checkpoint.position.z
      ),
      new THREE.Vector3(
        geometricShape.position.x,
        geometricShape.position.y,
        geometricShape.position.z
      ),
    ]);
    const line = new THREE.Line(geometry, material);
    return line;
  }

  tipTopDetailAnim() {
    const positionKeyframes = new THREE.VectorKeyframeTrack(
      ".position", // propiedad a animar
      [0, 1, 2], // tiempos de keyframe
      [0, 0, 0, 15, 0, 0, 0, 0, 0], // valores (ida y vuelta en el eje X)
      THREE.InterpolateSmooth // Tipo de interpolación
    );

    const rotationKeyframes = new THREE.QuaternionKeyframeTrack(
      ".quaternion", // propiedad a animar
      [0, 1, 2], // tiempos de keyframe
      [0, 0, 0, 1, 0, Math.sqrt(0.5), 0, Math.sqrt(0.5), 0, 0, 0, 1], // valores (rotación de 180 grados en el eje Y y vuelta)
      THREE.InterpolateLinear
    );
    this.animationClip = new THREE.AnimationClip("MyAnimation", -1, [
      positionKeyframes,
      rotationKeyframes,
    ]);
  }
  playAnim(mesh) {
    this.mixer = new THREE.AnimationMixer(mesh);
    this.tipTopDetailAnim();

    const action = this.mixer.clipAction(this.animationClip);
    action.play();
  }
  createCheckpoints() {
    if (!this.scene) return;
    const checkpointCount = 40; // Número de vida que llevo
    this.checkpointsGroup = new THREE.Group();
    this.detailGroup = new THREE.Group();
    const glowMaterial = this.createMaterial();
    const linesGroup = new THREE.Group();
    for (let i = 0; i < checkpointCount; i++) {
      const baseSize = 1;
      const sizeIncrement = i * 0.01;
      const width = baseSize + sizeIncrement;
      const height = baseSize + i;
      const depth = baseSize + i * 0.1;

      const geometry = new THREE.BoxGeometry(width, height, depth);

      const checkpoint = new THREE.Mesh(geometry, glowMaterial);
      this.setPositionAndScale(checkpoint, i, checkpointCount); // Configura posición y escala
      this.setCheckpointData(checkpoint); // Configura la información del checkpoint
      const geometricShape = this.createGeometricShape();
      geometricShape.userData.amplitude = Math.random();
      geometricShape.userData.originalY = checkpoint.position.y + 6;
      geometricShape.position.x = checkpoint.position.x;
      geometricShape.position.z = checkpoint.position.z;
      const line = this.createLine(checkpoint, geometricShape); // Crear línea entre checkpoint y figura geométrica

      linesGroup.add(line);
      this.checkpointsGroup.add(checkpoint);
      this.detailGroup.add(geometricShape);
    }
    this.scene.add(linesGroup);
    this.checkpointsGroup.add(this.detailGroup);
    this.scene.add(this.checkpointsGroup);
    //if (!this.checkpoints) return;
    this.checkpoints = this.checkpointsGroup.children;
    console.log("checkpointsGroup", this.detailGroup.children[0].userData);
  }

  createParticles(): void {
    this.particlesGeometry = new THREE.BufferGeometry();
    const count = 200; // Número de partículas

    const positions = new Float32Array(count * 3); // x, y, z para cada partícula
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80; // x, amplía el rango para más ancho
      positions[i + 1] = (Math.random() - 0.5) * 10; // y, ajusta según necesites
      positions[i + 2] = (Math.random() - 0.5) * 1;
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

  addTerrain() {
    // vertex shader for detailed noise

    const vertexShaderCode = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 3.0);
    }
    
    `;

    const fragmentShaderCode = `
    uniform float time;
    uniform float amplitude;
    varying vec2 vUv;
    
    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
        float ruido = random(vUv + time);
        gl_FragColor = vec4(vec3(ruido * amplitude), 1.0);
    }
    
    `;
    // Uniforms para pasar al shader
    this.uniformsPlane = {
      time: { type: "f", value: 0.0 },
      amplitude: { type: "f", value: 1.0 }, // Ajusta este valor según sea necesario
    };
    // Creación del material con los shaders
    this.planeMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniformsPlane,
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      wireframe: true,
    });

    // Creación de una malla de plano y aplicación del material de shader
    this.terrainGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
    const planeMesh = new THREE.Mesh(this.terrainGeometry, this.planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.position.y = 0;
    this.scene.add(planeMesh);
  }

  animate = (): void => {
    requestAnimationFrame(this.animate);

    const time = Date.now() * 0.002; // Ajusta la velocidad de la animación modificando este valor
    const amplitude = 2; // Máxima altura de la oscilación
    this.detailGroup.children.forEach((detail) => {
      //console.log("detail", detail);
    });
    // this.checkpointMaterial.uniforms.time.value += 0.05;
    // this.detailGroup.children.forEach((detail) => {
    //   if (detail) {
    //     // Oscilación suave de ida y vuelta usando sin
    //     const targetY = Math.sin(time) * amplitude;
    //     const target = new THREE.Vector3(
    //       detail.position.x,
    //       targetY,
    //       detail.position.z
    //     );
    //     detail.position.lerp(target, 0.05); // Ajusta el alpha para controlar la suavidad
    //   }
    // });
    this.detailGroup.children.forEach((geometricShape) => {
      if (geometricShape) {
        //console.log("geometricShape.userData", geometricShape);
        const originalY = geometricShape.userData.originalY;
        const amplitude = geometricShape.userData.amplitude;
        geometricShape.position.y = originalY + Math.sin(time) * amplitude;
      }
    });
    //this.composer.render();
    this.renderer.render(this.scene, this.camera);
    this.lastTime = time;
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
