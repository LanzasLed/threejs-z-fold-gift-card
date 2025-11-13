import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Group,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  Color,
  DoubleSide,
  FrontSide,
  BackSide,
  PCFSoftShadowMap,
  TextureLoader,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  NeutralToneMapping
} from 'three';
import { CardState, ICardConfig } from './types';
import { lerp, easeInOutCubic, setupLighting } from './utils';

/**
 * Z-Fold Gift Card - Three.js implementation
 * 
 * Renders a photorealistic A4 z-fold card with click-to-unfold interaction.
 * Uses Object3D hierarchy for hinge rotation simulation.
 */
export class ZFoldCard {
  private state: CardState = CardState.FOLDED;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private cardGroup!: Group;
  private topPanelGroup!: Group;
  private middlePanel!: Group;
  private bottomPanelGroup!: Group;
  private config: ICardConfig;
  private isAnimating = false;
  private readonly PANEL_WIDTH = 794;
  private readonly PANEL_HEIGHT = 374.33;
  private readonly UNFOLDED_HEIGHT = 374.33 * 3; // 1123
  private mouseX = 0;
  private mouseY = 0;
  private isHovering = false;
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private texturesLoaded = 0;
  private totalTextures = 3;
  private loaderElement: HTMLElement | null = null;

  constructor(config: ICardConfig) {
    this.config = config;
    this.loaderElement = document.getElementById('loader');
    this.initThreeJS();
    this.createCardPanels(); // Textures load here
    this.setupLighting();
    this.attachEventListeners();
    this.applyInitialState();
    this.startRenderLoop();
  }

  /**
   * Handle texture loading completion
   */
  private onTextureLoad(): void {
    this.texturesLoaded++;
    
    if (this.texturesLoaded === this.totalTextures) {
      // All textures loaded - hide loader and animate card in
      setTimeout(() => {
        if (this.loaderElement) {
          this.loaderElement.classList.add('loaded');
          // Remove from DOM after fade out
          setTimeout(() => {
            this.loaderElement?.remove();
          }, 400);
        }
        
        // Fade in card quickly (300ms)
        this.fadeInCard(() => {
          // After fade-in, wait 200ms then unfold
          setTimeout(() => {
            this.toggle();
          }, 200);
        });
      }, 100);
    }
  }
  
  /**
   * Fade in the card group
   */
  private fadeInCard(onComplete?: () => void): void {
    const duration = 300; // Quick fade-in
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      // Fade in all materials
      this.cardGroup.traverse((child) => {
        if (child instanceof Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.opacity = eased;
            });
          } else {
            child.material.opacity = eased;
          }
        }
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, make materials non-transparent
        this.cardGroup.traverse((child) => {
          if (child instanceof Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1;
            }
          }
        });
        
        if (onComplete) onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Initialize Three.js scene, camera, and renderer
   */
  private initThreeJS(): void {
    const canvas = document.querySelector(this.config.canvasSelector) as HTMLCanvasElement;
    
    if (!canvas) {
      throw new Error(`Canvas element not found: ${this.config.canvasSelector}`);
    }

    // Scene setup
    this.scene = new Scene();
    // No background color - transparent

    // Camera setup (perspective for realistic depth)
    const aspect = window.innerWidth / window.innerHeight;
    const fov = 50;
    this.camera = new PerspectiveCamera(fov, aspect, 0.1, 10000);
    
    // Simple fixed distance that fits the card well
    const distance = 1400;
    
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true }); // alpha: true for transparency
    this.renderer.setClearColor(0x000000, 0); // Fully transparent background
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    
    // Set output color space to sRGB for accurate color reproduction
    this.renderer.outputColorSpace = SRGBColorSpace;
    
    // Use Neutral tone mapping for accurate color reproduction without darkening
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.2; // Slightly increase exposure for brightness
    
    if (this.config.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;
    }
  }

  /**
   * Create the three panel geometries with Object3D hierarchy for hinges
   */
  private createCardPanels(): void {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    
    const panelGeometry = new PlaneGeometry(panelWidth, panelHeight, 32, 16);
    
    // Texture loader for SVG images
    const textureLoader = new TextureLoader();

    this.topPanelGroup = new Group();
    this.middlePanel = new Group();
    this.bottomPanelGroup = new Group();

    const topTexture = textureLoader.load('/svg/gift-card-top.svg', () => this.onTextureLoad());
    topTexture.colorSpace = SRGBColorSpace;
    topTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    topTexture.minFilter = 1006;
    topTexture.magFilter = 1006;
    
    const topMaterial = new MeshStandardMaterial({
      map: topTexture,
      roughness: 0.65,
      metalness: 0.0,
      side: FrontSide
    });
    
    const topMesh = new Mesh(panelGeometry, topMaterial);
    topMesh.position.y = panelHeight / 2;
    topMesh.renderOrder = 3;
    this.topPanelGroup.add(topMesh);
    
    const topBackGeometry = new PlaneGeometry(panelWidth, panelHeight, 32, 16);
    const topBackMaterial = new MeshStandardMaterial({
      color: new Color(0xffffff),
      roughness: 0.7,
      metalness: 0.0,
      side: BackSide
    });
    const topBack = new Mesh(topBackGeometry, topBackMaterial);
    topBack.position.y = panelHeight / 2;
    topBack.position.z = -0.01;
    topBack.renderOrder = 3;
    this.topPanelGroup.add(topBack);

    const middleTexture = textureLoader.load('/svg/gift-card-middle.svg', () => this.onTextureLoad());
    middleTexture.colorSpace = SRGBColorSpace;
    middleTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    middleTexture.minFilter = 1006;
    middleTexture.magFilter = 1006;
    
    const middleMaterial = new MeshStandardMaterial({
      map: middleTexture,
      roughness: 0.65,
      metalness: 0.0,
      side: FrontSide
    });
    
    const middleMesh = new Mesh(panelGeometry, middleMaterial);
    middleMesh.renderOrder = 2;
    this.middlePanel.add(middleMesh);
    
    const middleBackGeometry = new PlaneGeometry(panelWidth, panelHeight, 32, 16);
    const middleBackMaterial = new MeshStandardMaterial({
      color: new Color(0xffffff),
      roughness: 0.7,
      metalness: 0.0,
      side: BackSide
    });
    const middleBack = new Mesh(middleBackGeometry, middleBackMaterial);
    middleBack.position.z = -0.01;
    middleBack.renderOrder = 2;
    this.middlePanel.add(middleBack);

    const bottomTexture = textureLoader.load('/svg/gift-card-bottom.svg', () => this.onTextureLoad());
    bottomTexture.colorSpace = SRGBColorSpace;
    bottomTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    bottomTexture.minFilter = 1006;
    bottomTexture.magFilter = 1006;
    
    const bottomMaterial = new MeshStandardMaterial({
      map: bottomTexture,
      roughness: 0.65,
      metalness: 0.0,
      side: FrontSide
    });
    
    const bottomMesh = new Mesh(panelGeometry, bottomMaterial);
    bottomMesh.position.y = -panelHeight / 2;
    bottomMesh.renderOrder = 1;
    this.bottomPanelGroup.add(bottomMesh);
    
    const bottomBackGeometry = new PlaneGeometry(panelWidth, panelHeight, 32, 16);
    const bottomBackMaterial = new MeshStandardMaterial({
      color: new Color(0xffffff),
      roughness: 0.7,
      metalness: 0.0,
      side: BackSide
    });
    const bottomBack = new Mesh(bottomBackGeometry, bottomBackMaterial);
    bottomBack.position.y = -panelHeight / 2;
    bottomBack.position.z = -0.01;
    bottomBack.renderOrder = 1;
    this.bottomPanelGroup.add(bottomBack);

    // Add to card group
    this.cardGroup = new Group();
    this.cardGroup.add(this.topPanelGroup, this.middlePanel, this.bottomPanelGroup);
    
    // Start invisible for fade-in animation
    this.cardGroup.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }
    });
    
    this.scene.add(this.cardGroup);
  }

  /**
   * Setup lighting using utility function
   */
  private setupLighting(): void {
    setupLighting(this.scene, this.config.enableShadows);
  }

  /**
   * Attach event listeners for interaction and resize
   */
  private attachEventListeners(): void {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mousemove', (e) => {
      // Calculate mouse position for raycasting
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cardGroup.children, true);
      
      const wasHovering = this.isHovering;
      this.isHovering = intersects.length > 0;
      
      // Trigger hover events
      if (this.isHovering && !wasHovering) {
        this.onHoverStart();
      } else if (!this.isHovering && wasHovering) {
        this.onHoverEnd();
      }
    });
    
    canvas.addEventListener('mouseleave', () => {
      if (this.isHovering) {
        this.isHovering = false;
        this.onHoverEnd();
      }
    });
    
    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.state === CardState.UNFOLDED) {
        this.toggle();
      }
    });
  }

  /**
   * Apply initial folded state transforms
   */
  private applyInitialState(): void {
    const halfHeight = this.PANEL_HEIGHT / 2;
    
    this.topPanelGroup.rotation.x = Math.PI;
    this.topPanelGroup.position.y = halfHeight;
    this.topPanelGroup.position.z = 10;

    this.middlePanel.rotation.x = 0;
    this.middlePanel.position.y = 0;
    this.middlePanel.position.z = -30;

    this.bottomPanelGroup.rotation.x = -Math.PI;
    this.bottomPanelGroup.position.y = -halfHeight;
    this.bottomPanelGroup.position.z = -5;
  }

  /**
   * Toggle between folded and unfolded states
   */
  public toggle(): void {
    if (this.isAnimating) return;

    this.state = this.state === CardState.FOLDED 
      ? CardState.UNFOLDED 
      : CardState.FOLDED;
    
    this.animate();
  }

  /**
   * Animate card state transition using requestAnimationFrame with sequential delays
   */
  private animate(): void {
    this.isAnimating = true;

    const halfHeight = this.PANEL_HEIGHT / 2;
    const slightlyClosed = Math.PI / 12;
    
    const targetState = this.state === CardState.UNFOLDED
      ? {
          topRotation: slightlyClosed,
          topY: halfHeight,
          topZ: 2,
          middleZ: 0,
          bottomRotation: -slightlyClosed,
          bottomY: -halfHeight,
          bottomZ: -2
        }
      : {
          topRotation: Math.PI,
          topY: halfHeight,
          topZ: 10,
          middleZ: -30,
          bottomRotation: -Math.PI,
          bottomY: -halfHeight,
          bottomZ: -5
        };

    const duration = this.config.duration;
    const delay = 150;
    const startTime = performance.now();
    
    const startRotations = {
      top: this.topPanelGroup.rotation.x,
      bottom: this.bottomPanelGroup.rotation.x
    };
    
    const startPositions = {
      topY: this.topPanelGroup.position.y,
      topZ: this.topPanelGroup.position.z,
      middleZ: this.middlePanel.position.z,
      bottomY: this.bottomPanelGroup.position.y,
      bottomZ: this.bottomPanelGroup.position.z
    };

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      const topDelay = this.state === CardState.UNFOLDED ? 0 : delay;
      const bottomDelay = this.state === CardState.UNFOLDED ? delay : 0;
      
      // Top panel animation
      const topElapsed = Math.max(0, elapsed - topDelay);
      const topProgress = Math.min(topElapsed / duration, 1);
      const topEased = easeInOutCubic(topProgress);
      
      this.topPanelGroup.rotation.x = lerp(
        startRotations.top,
        targetState.topRotation,
        topEased
      );
      this.topPanelGroup.position.y = lerp(
        startPositions.topY,
        targetState.topY,
        topEased
      );
      this.topPanelGroup.position.z = lerp(
        startPositions.topZ,
        targetState.topZ,
        topEased
      );
      
      this.middlePanel.position.z = lerp(
        startPositions.middleZ,
        targetState.middleZ,
        topEased
      );

      const bottomElapsed = Math.max(0, elapsed - bottomDelay);
      const bottomProgress = Math.min(bottomElapsed / duration, 1);
      const bottomEased = easeInOutCubic(bottomProgress);
      
      this.bottomPanelGroup.rotation.x = lerp(
        startRotations.bottom,
        targetState.bottomRotation,
        bottomEased
      );
      this.bottomPanelGroup.position.y = lerp(
        startPositions.bottomY,
        targetState.bottomY,
        bottomEased
      );
      this.bottomPanelGroup.position.z = lerp(
        startPositions.bottomZ,
        targetState.bottomZ,
        bottomEased
      );

      if (topProgress < 1 || bottomProgress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        this.isAnimating = false;
      }
    };

    requestAnimationFrame(animateFrame);
  }

  /**
   * Handle canvas click with raycasting to detect card hits
   */
  private onCanvasClick(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with card group
    const intersects = this.raycaster.intersectObjects(this.cardGroup.children, true);

    // Only toggle if we hit the card
    if (intersects.length > 0) {
      this.toggle();
    }
  }

  /**
   * Handle mouse movement for parallax effect
   */
  private onMouseMove(event: MouseEvent): void {
    // Normalize mouse position to -1 to 1
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Handle hover start - slight preview animation
   */
  private onHoverStart(): void {
    if (this.isAnimating) return;
    
    const targetRotation = this.state === CardState.FOLDED ? 0.3 : 0.15;
    
    // Subtle preview animation
    this.animatePreview(targetRotation);
  }

  /**
   * Handle hover end - return to current state
   */
  private onHoverEnd(): void {
    if (this.isAnimating) return;
    
    // Return to neutral position
    this.animatePreview(0);
  }

  /**
   * Animate hover preview effect
   */
  private animatePreview(targetOffset: number): void {
    const duration = 200;
    const startTime = performance.now();
    const startTop = this.topPanelGroup.rotation.x;
    const startBottom = this.bottomPanelGroup.rotation.x;
    
    const slightlyClosed = Math.PI / 12; // 15 degrees
    
    // When folded (closed): ONLY top opens slightly, bottom stays closed
    // When open (slightly closed): hover fully flattens both panels to 0
    let targetTop: number;
    let targetBottom: number;
    
    if (this.state === CardState.FOLDED) {
      // Closed state: only top opens slightly
      targetTop = targetOffset === 0 ? Math.PI : Math.PI - (targetOffset * 1.5);
      targetBottom = -Math.PI; // Bottom stays closed
    } else {
      // Open state: flatten fully to 0 on hover, return to slightlyClosed when not hovering
      targetTop = targetOffset === 0 ? slightlyClosed : 0;
      targetBottom = targetOffset === 0 ? -slightlyClosed : 0;
    }
    
    const animateFrame = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = easeInOutCubic(progress);
      
      this.topPanelGroup.rotation.x = lerp(startTop, targetTop, eased);
      this.bottomPanelGroup.rotation.x = lerp(startBottom, targetBottom, eased);
      
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      }
    };
    
    requestAnimationFrame(animateFrame);
  }

  /**
   * Handle window resize
   */
  private onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      
      // Apply parallax effect based on mouse position
      if (!this.isAnimating) {
        const targetX = this.mouseX * 120;
        const targetY = this.mouseY * 90;
        
        this.camera.position.x = lerp(this.camera.position.x, targetX, 0.05);
        this.camera.position.y = lerp(this.camera.position.y, targetY, 0.05);
        this.camera.lookAt(0, 0, 0);
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  /**
   * Get current card state
   */
  public getState(): CardState {
    return this.state;
  }
}
