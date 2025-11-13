# CodePen Setup for Z-Fold Gift Card

## External Scripts/Pens to Add

In CodePen Settings → JS → Add External Scripts/Pens, add:

```
https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.min.js
```

**Important:** Set JS preprocessor to **TypeScript**

---

## HTML

```html
<!-- Loading state -->
<div class="card-loader" id="loader">
  <div class="card-loader__spinner"></div>
</div>

<!-- Three.js canvas -->
<canvas id="canvas" aria-label="Interactive 3D gift card" role="img"></canvas>
```

---

## CSS (SCSS)

```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #f5f5f5; // Light background for CodePen
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  cursor: pointer;
  touch-action: none;
}

// Loading state styles
.card-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  pointer-events: none;

  &.loaded {
    opacity: 0;
  }

  &__spinner {
    position: relative;
    width: 40px;
    height: 40px;

    &::before {
      content: '';
      display: block;
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## JavaScript (TypeScript)

**IMPORTANT:** You must host the SVG files externally since CodePen free doesn't support assets.
Options:
1. **GitHub** (recommended): Push your SVG files to a public GitHub repo and use raw.githubusercontent.com URLs
2. **Imgur**: Upload as images and use direct links
3. **Data URI**: Convert SVGs to data URIs at https://dopiaza.org/tools/datauri/ (may make code very long)

Replace `YOUR_USERNAME` and `YOUR_REPO` in the code below with your actual GitHub info

```typescript
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Group,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  Color,
  FrontSide,
  BackSide,
  TextureLoader,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  NeutralToneMapping,
  AmbientLight,
  RectAreaLight
} from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.min.js';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

enum CardState {
  FOLDED = 'folded',
  UNFOLDED = 'unfolded'
}

interface ICardConfig {
  canvasSelector: string;
  duration: number;
  cameraDistance: number;
  enableShadows: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setupLighting(scene: Scene): void {
  const ambientLight = new AmbientLight(new Color(0xffffff), 1.4);
  scene.add(ambientLight);

  const rectLight = new RectAreaLight(new Color(0xffffff), 4.0, 2000, 400);
  rectLight.position.set(0, 500, 1200);
  rectLight.lookAt(0, 0, 0);
  scene.add(rectLight);
}

// ============================================================================
// MAIN CARD CLASS
// ============================================================================

class ZFoldCard {
  private state: CardState = CardState.FOLDED;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private cardGroup: Group;
  private topPanelGroup: Group;
  private middlePanel: Group;
  private bottomPanelGroup: Group;
  private config: ICardConfig;
  private isAnimating = false;
  private readonly PANEL_WIDTH = 794;
  private readonly PANEL_HEIGHT = 374.33;
  private readonly UNFOLDED_HEIGHT = 374.33 * 3;
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
    this.createCardPanels();
    setupLighting(this.scene);
    this.attachEventListeners();
    this.applyInitialState();
    this.startRenderLoop();
  }

  private onTextureLoad(): void {
    this.texturesLoaded++;
    
    if (this.texturesLoaded === this.totalTextures) {
      setTimeout(() => {
        if (this.loaderElement) {
          this.loaderElement.classList.add('loaded');
          setTimeout(() => {
            this.loaderElement?.remove();
          }, 400);
        }
        
        this.fadeInCard(() => {
          setTimeout(() => {
            this.toggle();
          }, 200);
        });
      }, 100);
    }
  }
  
  private fadeInCard(onComplete?: () => void): void {
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
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

  private initThreeJS(): void {
    const canvas = document.querySelector(this.config.canvasSelector) as HTMLCanvasElement;
    
    if (!canvas) {
      throw new Error(`Canvas element not found: ${this.config.canvasSelector}`);
    }

    this.scene = new Scene();
    
    const aspect = window.innerWidth / window.innerHeight;
    const fov = 50;
    this.camera = new PerspectiveCamera(fov, aspect, 0.1, 10000);
    
    const distance = 1400;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.renderer.useLegacyLights = false;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    if (this.config.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;
    }
  }

  private createCardPanels(): void {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const thickness = 2;
    
    const panelGeometry = new BoxGeometry(panelWidth, panelHeight, thickness, 32, 16, 1);
    const textureLoader = new TextureLoader();
    
    const whiteMaterial = new MeshStandardMaterial({
      color: new Color(0xffffff),
      roughness: 0.7,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    this.topPanelGroup = new Group();
    this.middlePanel = new Group();
    this.bottomPanelGroup = new Group();

    // Note: SVG files must be hosted externally (GitHub Pages, Imgur, CloudFlare R2, etc.)
    // or converted to data URIs using a converter like: https://dopiaza.org/tools/datauri/
    // Replace these placeholder URLs with your actual image URLs
    const topTexture = textureLoader.load(
      'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/src/svg/gift-card-top.svg',
      () => this.onTextureLoad()
    );
    topTexture.colorSpace = SRGBColorSpace;
    
    const topMaterials = [
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      new MeshStandardMaterial({
        map: topTexture,
        roughness: 0.65,
        metalness: 0.0
      }),
      whiteMaterial
    ];
    
    const topMesh = new Mesh(panelGeometry, topMaterials);
    topMesh.position.y = panelHeight / 2;
    topMesh.castShadow = this.config.enableShadows;
    topMesh.receiveShadow = this.config.enableShadows;
    topMesh.renderOrder = 3;
    this.topPanelGroup.add(topMesh);

    const middleTexture = textureLoader.load(
      'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/src/svg/gift-card-middle.svg',
      () => this.onTextureLoad()
    );
    middleTexture.colorSpace = SRGBColorSpace;
    
    const middleMaterials = [
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      new MeshStandardMaterial({
        map: middleTexture,
        roughness: 0.65,
        metalness: 0.0
      }),
      whiteMaterial
    ];
    
    const middleMesh = new Mesh(panelGeometry, middleMaterials);
    middleMesh.castShadow = this.config.enableShadows;
    middleMesh.receiveShadow = this.config.enableShadows;
    middleMesh.renderOrder = 2;
    this.middlePanel.add(middleMesh);

    const bottomTexture = textureLoader.load(
      'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/src/svg/gift-card-bottom.svg',
      () => this.onTextureLoad()
    );
    bottomTexture.colorSpace = SRGBColorSpace;
    
    const bottomMaterials = [
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      whiteMaterial,
      new MeshStandardMaterial({
        map: bottomTexture,
        roughness: 0.65,
        metalness: 0.0
      }),
      whiteMaterial
    ];
    
    const bottomMesh = new Mesh(panelGeometry, bottomMaterials);
    bottomMesh.position.y = -panelHeight / 2;
    bottomMesh.castShadow = this.config.enableShadows;
    bottomMesh.receiveShadow = this.config.enableShadows;
    bottomMesh.renderOrder = 1;
    this.bottomPanelGroup.add(bottomMesh);

    this.cardGroup = new Group();
    this.cardGroup.add(this.topPanelGroup, this.middlePanel, this.bottomPanelGroup);
    
    this.cardGroup.traverse((child) => {
      if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.transparent = true;
            mat.opacity = 0;
          });
        } else {
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      }
    });
    
    this.scene.add(this.cardGroup);
  }

  private attachEventListeners(): void {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    window.addEventListener('resize', () => this.onResize());
    
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cardGroup.children, true);
      
      const wasHovering = this.isHovering;
      this.isHovering = intersects.length > 0;
      
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
    
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.state === CardState.UNFOLDED) {
        this.toggle();
      }
    });
  }

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

  public toggle(): void {
    if (this.isAnimating) return;

    this.state = this.state === CardState.FOLDED 
      ? CardState.UNFOLDED 
      : CardState.FOLDED;
    
    this.animate();
  }

  private animate(): void {
    this.isAnimating = true;

    const halfHeight = this.PANEL_HEIGHT / 2;
    const slightlyClosed = Math.PI / 12;
    const targetState = this.state === CardState.UNFOLDED
      ? { topRotation: slightlyClosed, topY: halfHeight, topZ: 2, middleZ: 0, bottomRotation: -slightlyClosed, bottomY: -halfHeight, bottomZ: -2 }
      : { topRotation: Math.PI, topY: halfHeight, topZ: 10, middleZ: -30, bottomRotation: -Math.PI, bottomY: -halfHeight, bottomZ: -5 };

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
      bottomY: this.bottomPanelGroup.position.y,
      bottomZ: this.bottomPanelGroup.position.z
    };

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      const topDelay = this.state === CardState.UNFOLDED ? 0 : delay;
      const bottomDelay = this.state === CardState.UNFOLDED ? delay : 0;
      
      const topElapsed = Math.max(0, elapsed - topDelay);
      const topProgress = Math.min(topElapsed / duration, 1);
      const topEased = easeInOutCubic(topProgress);
      
      this.topPanelGroup.rotation.x = lerp(startRotations.top, targetState.topRotation, topEased);
      this.topPanelGroup.position.y = lerp(startPositions.topY, targetState.topY, topEased);
      this.topPanelGroup.position.z = lerp(startPositions.topZ, targetState.topZ, topEased);

      const bottomElapsed = Math.max(0, elapsed - bottomDelay);
      const bottomProgress = Math.min(bottomElapsed / duration, 1);
      const bottomEased = easeInOutCubic(bottomProgress);
      
      this.bottomPanelGroup.rotation.x = lerp(startRotations.bottom, targetState.bottomRotation, bottomEased);
      this.bottomPanelGroup.position.y = lerp(startPositions.bottomY, targetState.bottomY, bottomEased);
      this.bottomPanelGroup.position.z = lerp(startPositions.bottomZ, targetState.bottomZ, bottomEased);

      if (topProgress < 1 || bottomProgress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        this.isAnimating = false;
      }
    };

    requestAnimationFrame(animateFrame);
  }

  private onCanvasClick(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardGroup.children, true);

    if (intersects.length > 0) {
      this.toggle();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private onHoverStart(): void {
    if (this.isAnimating) return;
    const targetRotation = this.state === CardState.FOLDED ? 0.3 : 0.15;
    this.animatePreview(targetRotation);
  }

  private onHoverEnd(): void {
    if (this.isAnimating) return;
    this.animatePreview(0);
  }

  private animatePreview(targetOffset: number): void {
    const duration = 200;
    const startTime = performance.now();
    const startTop = this.topPanelGroup.rotation.x;
    const startBottom = this.bottomPanelGroup.rotation.x;
    
    const slightlyClosed = Math.PI / 12;
    
    let targetTop: number;
    let targetBottom: number;
    
    if (this.state === CardState.FOLDED) {
      targetTop = targetOffset === 0 ? Math.PI : Math.PI - (targetOffset * 1.5);
      targetBottom = -Math.PI;
    } else {
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

  private onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private startRenderLoop(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      
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
}

// ============================================================================
// INITIALIZE
// ============================================================================

const config: ICardConfig = {
  canvasSelector: '#canvas',
  duration: 800,
  cameraDistance: 1000,
  enableShadows: false
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ZFoldCard(config);
  });
} else {
  new ZFoldCard(config);
}
1. **Host your SVG files** (see options below)
2. **Create New Pen on CodePen**
3. **Settings → JS:**
   - Preprocessor: **TypeScript**
   - External Scripts: `https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.min.js`
4. **Replace URLs** in JavaScript section:
   - For GitHub: Replace `YOUR_USERNAME/YOUR_REPO` with your actual repo
   - For others: Replace entire URLs with your hosted file URLs
5. **Paste HTML, CSS, JS** from above
6. **Save & Share** 🎉

### Hosting Options (Free Accounts):

**GitHub (Recommended):**
```bash
# 1. Create public repo or use existing
# 2. Push your SVGs
git add src/svg/*.svg
git commit -m "Add gift card SVGs"
git push

# 3. Get raw URLs (right-click "Raw" button on GitHub file viewer)
https://raw.githubusercontent.com/USERNAME/REPO/main/src/svg/gift-card-top.svg
```

**Imgur:**
- Upload SVGs as images
- Get direct link (ends in .svg)

**Data URI Converter:**
- Visit https://dopiaza.org/tools/datauri/
- Paste SVG code
- Copy data URI (warning: makes code very long!)
   - Preprocessor: **TypeScript**
   - External Scripts: `https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.min.js`
3. **Upload SVG files** (CodePen Assets or use external CDN)
4. **Replace URLs** in JavaScript section (search for `🔥 REPLACE`)
5. **Paste HTML, CSS, JS** from above
6. **Save & Share** 🎉

---

## Notes

- Card auto-fades in then unfolds after loading
- Click card to toggle fold/unfold
- Mouse panning for parallax effect
- Hover for preview animation
- Keyboard: Space/Enter = toggle, Esc = close
- Matte paper finish (roughness 0.65-0.7)
- Transparent background ready

