# 📜 Z-Fold Gift Card — Technical Whitepaper

**Project:** Interactive Z-Fold Gift Card  
**Version:** 0.2.0 (Clean Slate)  
**Last Updated:** November 13, 2025  
**Status:** 🚀 STACK FINALIZED — Three.js + Motion.dev + TypeScript  
**Stack:** Three.js (WebGLRenderer), Motion.dev, TypeScript, SCSS, Vite  
**Bundle Target:** ~150-200KB (Three.js ~125KB + Motion.dev ~12KB + app code)  
**Card Dimensions:** 200mm × 210mm (custom size, three 70mm horizontal panels)  
**Output:** Single HTML file (inline CSS/JS for portability)

---

## 🎯 CONCEPT

A **realistic, interactive, animated z-fold gift card** that mimics a physical paper card folded in Z-shape (horizontal tri-fold). The card exists in two states:

1. **FOLDED** (default) — Three stacked panels (200mm × 70mm each), middle panel visible from front
2. **UNFOLDED** (on click) — Full card spread (200mm × 210mm), panels aligned vertically

**UX Flow:**
- **Idle:** Card sits folded, subtle shadow, visible panel edges
- **Hover (folded):** Scales up slightly, shadow deepens, panels shift (micro-unfold preview)
- **Click (folded):** Unfolds smoothly, zooms to fullscreen (maintains A4 aspect ratio), background blurs
- **Hover (unfolded):** Scales slightly, shadow pulses (indicates click will fold back)
- **Click (unfolded):** Folds back to original state, background unblurs

---

## 🏗️ ARCHITECTURE

### **Core Principles**
1. **Three.js WebGL Rendering:** PhotorealisticPBR materials (MeshStandardMaterial) with physically-based lighting
2. **Object3D Hierarchy:** Hinge rotations via parent-child pivot point simulation (no transform-origin issues)
3. **TypeScript State Machine:** `FOLDED` ↔ `UNFOLDED` with smooth spring-physics transitions
4. **Motion.dev Integration:** Animation timing orchestration (not direct Three.js property animation)
5. **Click-Only Interaction:** Simple fold/unfold toggle (no drag-to-rotate complexity)
6. **Tree-Shaken Bundle:** Named imports only (`import { WebGLRenderer, Scene } from 'three'`) for optimal size

### **Project Structure**

```
js-z-fold-gift-card/
├── src/
│   ├── index.html              # Entry point (canvas element)
│   ├── styles/
│   │   ├── main.scss           # Minimal layout (canvas fullscreen, body reset)
│   │   └── _variables.scss     # Background colors, z-index
│   ├── scripts/
│   │   ├── main.ts             # Entry point (instantiate ZFoldCard + Three.js scene)
│   │   ├── ZFoldCard.ts        # Core class (Three.js scene, state machine, animations)
│   │   ├── types.ts            # TypeScript interfaces (ICardConfig, CardState enum)
│   │   └── utils.ts            # Three.js helpers (createPanelMesh, setupLighting)
│   └── assets/
│       └── textures/           # Paper texture maps (optional PBR textures)
├── dist/                       # Build output (single index.html)
├── vite.config.ts              # Vite build configuration
├── package.json                # Dependencies: three, @types/three, motion
├── tsconfig.json               # TypeScript config (ES2020, strict)
├── bun.lock
├── CHANGELOG.md
├── docs/
│   ├── WHITEPAPER.md           # This file
│   └── TODO.md                 # Implementation roadmap
└── .github/
    ├── copilot-instructions.md # AI agent rules
    └── persona.md              # AI personality config
```

---

## 🎨 VISUAL DESIGN

### **Dimensions & Aspect Ratio**
- **Card Size:** 200mm × 210mm (custom dimensions for compact gift card)
- **Each panel:** 200mm wide × 70mm tall (card height ÷ 3)
- **Total unfolded height:** 210mm (3 panels × 70mm)
- **Viewport scaling:** Card scales to fit 90% of viewport (maintains aspect ratio)

### **Color Palette**
```scss
$color-bg: #ffffff;           // Card background
$color-text: #000000;         // Text/borders
$color-accent: #EA5B10;       // Highlights (optional — future use)
$color-border: #363635;       // Panel edges
$color-shadow: rgba(0,0,0,0.2); // Drop shadow
```

### **Three.js Scene Structure**

```typescript
// Object3D hierarchy for hinge rotation simulation
Scene
 └─ CardGroup (container, world rotation if needed)
     ├─ TopPanelGroup (Object3D, pivot at bottom edge)
     │   └─ TopMesh (PlaneGeometry 200×70mm, MeshStandardMaterial)
     ├─ MiddlePanel (Object3D, pivot at center, remains flat)
     │   └─ MiddleMesh (PlaneGeometry 200×70mm, paper material)
     └─ BottomPanelGroup (Object3D, pivot at top edge)
         └─ BottomMesh (PlaneGeometry 200×70mm, paper material)
```

**Folded state transforms:**
```typescript
// Top panel rotates 180° around bottom edge (folds backward)
topPanelGroup.rotation.x = Math.PI; // 180°
topPanelGroup.position.y = 35; // Half panel height (keeps edge connected)
topPanelGroup.position.z = 2;  // Slight thickness offset

// Middle stays flat (reference/anchor)
middlePanel.rotation.x = 0;
middlePanel.position.y = 0;
middlePanel.position.z = 0;

// Bottom rotates -180° around top edge (folds backward from inside)
bottomPanelGroup.rotation.x = -Math.PI;
bottomPanelGroup.position.y = -35; // Half panel height (keeps edge connected)
bottomPanelGroup.position.z = -2;  // Slight thickness offset
```

**Unfolded state transforms:**
```typescript
// All panels flat, edges connected (Y positions stay at half-height offsets)
topPanelGroup.rotation.x = 0;
topPanelGroup.position.y = 35;  // Keeps top edge of top panel connected to middle
topPanelGroup.position.z = 0;

middlePanel.rotation.x = 0;
middlePanel.position.y = 0;
middlePanel.position.z = 0;

bottomPanelGroup.rotation.x = 0;
bottomPanelGroup.position.y = -35; // Keeps bottom edge of bottom panel connected to middle
bottomPanelGroup.position.z = 0;
```

### **Materials & Lighting**

**Paper Material (PBR — Physically Based Rendering):**
```typescript
import { MeshStandardMaterial, Color } from 'three';

const paperMaterial = new MeshStandardMaterial({
  color: new Color(0xffffff),  // White paper
  roughness: 0.8,               // Matte finish (not glossy)
  metalness: 0.0,               // Non-metallic
  flatShading: false,           // Smooth normals
  side: DoubleSide              // Visible from both sides
});
```

**Lighting Setup:**
```typescript
import { AmbientLight, DirectionalLight } from 'three';

// Soft ambient light (prevents pure black shadows)
const ambientLight = new AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Main directional light (simulates sun/desk lamp)
const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 3, 4); // Top-right-front
directionalLight.castShadow = true;     // Enable shadows
scene.add(directionalLight);
```

**Shadow Rendering:**
```typescript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap; // Soft shadow edges

// Configure shadow properties per light
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
```

**References:**
- [MeshStandardMaterial Docs](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
- [PBR Guide by Meta Horizon](https://developers.meta.com/horizon/documentation/web/iwsdk-concept-three-basics-meshes-geometry-materials)
- [Physically Based Rendering by Discover Three.js](https://discoverthreejs.com/book/first-steps/physically-based-rendering/)

---

## ⚙️ TECHNICAL IMPLEMENTATION

### **State Machine (Three.js Implementation)**

```typescript
import { Scene, WebGLRenderer, PerspectiveCamera, Group, PlaneGeometry, Mesh } from 'three';

enum CardState {
  FOLDED = 'folded',
  UNFOLDED = 'unfolded'
}

interface ICardConfig {
  canvasSelector: string;     // Canvas element query
  duration: number;           // Animation duration (ms)
  cameraDistance: number;     // Camera Z position
}

class ZFoldCard {
  private state: CardState = CardState.FOLDED;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private cardGroup: Group;
  private topPanelGroup: Group;
  private middlePanel: Group;
  private bottomPanelGroup: Group;
  
  constructor(config: ICardConfig) {
    this.initThreeJS(config.canvasSelector);
    this.createCardPanels();
    this.setupLighting();
    this.attachEventListeners();
    this.applyInitialState();
    this.startRenderLoop();
  }
  
  private initThreeJS(selector: string): void {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    
    // Scene setup
    this.scene = new Scene();
    this.scene.background = new Color(0xf0f0f0);
    
    // Camera setup (orthographic for card-like view)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 600); // Front-facing view
    this.camera.lookAt(0, 0, 0);
    
    // Renderer setup
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }
  
  private createCardPanels(): void {
    const panelGeometry = new PlaneGeometry(99, 210); // A4 thirds
    const paperMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.0
    });
    
    // Create panel groups (for pivot simulation)
    this.topPanelGroup = new Group();
    this.middlePanel = new Group();
    this.bottomPanelGroup = new Group();
    
    // Create meshes and offset geometry for pivot points
    const topMesh = new Mesh(panelGeometry, paperMaterial);
    topMesh.position.y = -105; // Pivot at bottom edge
    this.topPanelGroup.add(topMesh);
    
    const middleMesh = new Mesh(panelGeometry, paperMaterial);
    this.middlePanel.add(middleMesh);
    
    const bottomMesh = new Mesh(panelGeometry, paperMaterial);
    bottomMesh.position.y = 105; // Pivot at top edge
    this.bottomPanelGroup.add(bottomMesh);
    
    // Add to card group
    this.cardGroup = new Group();
    this.cardGroup.add(this.topPanelGroup, this.middlePanel, this.bottomPanelGroup);
    this.scene.add(this.cardGroup);
  }
  
  private attachEventListeners(): void {
    window.addEventListener('click', () => this.toggle());
    window.addEventListener('resize', () => this.onResize());
  }
  
  public toggle(): void {
    this.state = this.state === CardState.FOLDED 
      ? CardState.UNFOLDED 
      : CardState.FOLDED;
    this.animate();
  }
  
  private startRenderLoop(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
```

### **Animation Strategy**

**Approach:** Use `requestAnimationFrame` for smooth Three.js object property interpolation (Motion.dev not directly compatible with Three.js objects).

```typescript
private animate(): void {
  const targetState = this.state === CardState.UNFOLDED
    ? { top: 0, topY: 210, bottom: 0, bottomY: -210 }
    : { top: Math.PI, topY: 105, bottom: -Math.PI, bottomY: -105 };
  
  // Simple lerp-based animation
  const duration = 800; // ms
  const startTime = performance.now();
  const startRotations = {
    top: this.topPanelGroup.rotation.x,
    bottom: this.bottomPanelGroup.rotation.x
  };
  const startPositions = {
    topY: this.topPanelGroup.position.y,
    bottomY: this.bottomPanelGroup.position.y
  };
  
  const animateFrame = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing (cubic-bezier approximation)
    const eased = this.easeInOutCubic(progress);
    
    // Interpolate rotations
    this.topPanelGroup.rotation.x = this.lerp(
      startRotations.top,
      targetState.top,
      eased
    );
    this.bottomPanelGroup.rotation.x = this.lerp(
      startRotations.bottom,
      targetState.bottom,
      eased
    );
    
    // Interpolate positions
    this.topPanelGroup.position.y = this.lerp(
      startPositions.topY,
      targetState.topY,
      eased
    );
    this.bottomPanelGroup.position.y = this.lerp(
      startPositions.bottomY,
      targetState.bottomY,
      eased
    );
    
    // Continue or finish
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    }
  };
  
  requestAnimationFrame(animateFrame);
}

private lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

private easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

**Alternative: Motion.dev for Camera Animation**
```typescript
import { animate, spring } from 'motion';

// Animate camera zoom during unfold (not Three.js objects)
private animateCameraZoom(): void {
  const targetZ = this.state === CardState.UNFOLDED ? 400 : 600;
  
  animate(
    (progress) => {
      this.camera.position.z = this.lerp(this.camera.position.z, targetZ, progress);
    },
    { duration: 0.8, easing: spring({ stiffness: 300, damping: 30 }) }
  );
}
```

### **Hover Effects**
```typescript
private onHoverStart(): void {
  if (this.state === CardState.FOLDED) {
    // Micro-preview: panels shift slightly
    animate(this.panels[0], { rotateY: -5 }, { duration: 0.2 });
    animate(this.panels[2], { rotateY: 5 }, { duration: 0.2 });
    animate(this.element, { scale: 1.05 }, { duration: 0.2 });
  } else {
    // Pulse effect when unfolded
    animate(this.element, { scale: 1.85 }, { duration: 0.2 });
  }
}

private onHoverEnd(): void {
  // Return to current state (folded or unfolded)
  this.applyState(this.state, { duration: 0.2 });
}
```

---

## 🛠️ BUILD SYSTEM

### **Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        inlineDynamicImports: true // Single JS bundle
      }
    }
  },
  plugins: [
    viteSingleFile() // Inline CSS/JS into HTML
  ]
});
```

**Tree-Shaking Three.js:**
```typescript
// ✅ CORRECT: Named imports (enables tree-shaking)
import { WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry } from 'three';

// ❌ WRONG: Namespace import (bundles entire library)
import * as THREE from 'three';
```

### **HTML Template (Three.js Canvas)**
```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Z-Fold Gift Card</title>
  <link rel="stylesheet" href="./styles/main.scss">
</head>
<body>
  <canvas id="canvas"></canvas>
  <script type="module" src="./scripts/main.ts"></script>
</body>
</html>
```

**Minimal SCSS:**
```scss
// src/styles/main.scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #f0f0f0;
}

#canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
```

### **Package Manager & Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

**Using Bun (faster than npm):**
```bash
bun dev          # Start dev server with HMR
bun run build    # Production build (single HTML file)
bun run preview  # Preview production build
```

---

## 📦 DEPENDENCIES

### **Runtime (included in bundle)**
- `three` — Three.js WebGL library (~500KB unminified, ~125KB gzipped with tree-shaking)
- `@types/three` — TypeScript definitions (dev only)
- `motion` (optional) — Motion.dev for camera animations (~12KB gzipped)

### **Build-time (devDependencies)**
- `vite` — Dev server + bundler (already installed)
- `vite-plugin-singlefile` — Inline assets into single HTML
- `typescript` — Type checking (already installed)
- `sass` — SCSS processor (already installed)

### **Installation:**
```bash
bun add three
bun add -d @types/three vite-plugin-singlefile
```

### **Bundle Size Expectations:**
- **Three.js core:** ~125KB gzipped (WebGLRenderer, Scene, Camera, PlaneGeometry, MeshStandardMaterial, lights)
- **Motion.dev:** ~12KB gzipped (optional)
- **Application code:** ~15-30KB gzipped
- **Total:** ~150-200KB (acceptable tradeoff for photorealistic rendering)

---

## 🎭 INTERACTION MODES

### **Mode 1: Auto-Animate (Optional)**
- Card auto-unfolds 2 seconds after page load
- Use case: Showcase/demo mode

### **Mode 2: Click-to-Unfold (Default)**
- User must click to unfold
- Use case: Interactive gift card (recipient opens it)

### **Mode 3: Scroll-Triggered (Future)**
- Unfolds when scrolled into view
- Use case: Landing page section

---

## 🧪 TESTING CHECKLIST

- [ ] FOLDED state renders correctly (3 panels visible, stacked)
- [ ] UNFOLDED state scales to fit viewport (maintains A4 aspect ratio)
- [ ] Hover effects work in both states
- [ ] Click toggle works (folded ↔ unfolded)
- [ ] Background blur applies/removes correctly
- [ ] Animations are smooth (60fps, no jank)
- [ ] Works without Motion.dev (CSS fallback)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Single HTML file output (<100KB)

---

## 🚀 FUTURE ENHANCEMENTS

1. **SVG Panel Overlays:** Custom graphics per panel (birthday, holiday themes)
2. **Sound Effects:** Subtle paper rustling sound on unfold
3. **Custom Easing Presets:** User-configurable spring physics
4. **3D Flip Mode:** Rotate card 180° to reveal backside message
5. **Multi-Card Grid:** Display multiple gift cards in a gallery
6. **Export to PNG/PDF:** Download rendered card as image

---

## 📚 REFERENCES

**Three.js Documentation:**
- Three.js Official Docs: https://threejs.org/docs/
- MeshStandardMaterial: https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
- PlaneGeometry: https://threejs.org/docs/#api/en/geometries/PlaneGeometry
- Object3D (parent-child hierarchy): https://threejs.org/docs/#api/en/core/Object3D

**PBR & Lighting:**
- Physically Based Rendering by Discover Three.js: https://discoverthreejs.com/book/first-steps/physically-based-rendering/
- Meta Horizon PBR Materials Guide: https://developers.meta.com/horizon/documentation/web/iwsdk-concept-three-basics-meshes-geometry-materials

**Three.js Community Examples:**
- Stack Overflow: Three.js rotation pivot points
- Reddit r/threejs: Paper folding simulation discussions
- Codrops: 3D folding animation tutorials

**Bundle Optimization:**
- Web.dev Tree-Shaking Guide: https://web.dev/reduce-javascript-payloads-with-tree-shaking/
- Nolan Lawson: Three.js Bundle Size Analysis

**Z-Fold Mechanics:**
- Physical z-fold card tutorials (YouTube crafting community)
- Origami simulation research papers

---

**END OF WHITEPAPER**

_Docs generated with Copilot Claude Sonnet 4.5_