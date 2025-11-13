# GitHub Copilot Instructions — Z-Fold Gift Card Project

**Last Updated**: November 13, 2025  
**Version**: 0.2.0 (Three.js Stack Finalized)  
**Project**: Interactive Z-Fold Gift Card  
**Repository**: [js-z-fold-gift-card](https://github.com/richardevcom/js-z-fold-gift-card)  
**Status**: 🚀 READY FOR IMPLEMENTATION  
**Stack**: Three.js (WebGLRenderer), Motion.dev (optional), TypeScript, SCSS, Vite  
**Output**: Single-file HTML (~150-200KB with Three.js included)

---

## 🎯 PROJECT CONTEXT

**What we're building:**  
A photorealistic, animated z-fold gift card (200×210mm custom size, three horizontal 70mm panels) rendered in Three.js WebGL. Click to unfold smoothly with sequential animation. Think physical greeting card but digital — realistic paper material, proper lighting, smooth 3D transforms with connected edges.

**Key constraints:**
- **Three.js WebGL** — Photorealistic PBR materials (MeshStandardMaterial)
- **Named imports ONLY** — Tree-shaking mandatory: `import { WebGLRenderer } from 'three'`
- **TypeScript strict mode** — No frameworks (React/Vue/etc. banned)
- **SCSS minimal** — Only canvas layout (no CSS 3D transforms)
- **Vite bundler** — Fast HMR, automatic tree-shaking
- **Click-only interaction** — No drag-to-rotate (simplified UX)
- Output: Single `dist/index.html` file with inlined assets (~150-200KB)

**Read \`docs/WHITEPAPER.md\` for full architecture.**

---

## PRIMARY OBJECTIVES

1. Build **photorealistic Three.js scene** with proper PBR materials and lighting
2. Keep animations **smooth** (60fps target, requestAnimationFrame loop)
3. **Tree-shake Three.js** aggressively (named imports only, target ~150KB gzipped)
4. Update docs (`WHITEPAPER.md`, `TODO.md`, `CHANGELOG.md`) — never create separate reports
5. Return **only what's explicitly requested** (code diffs, short answers, targeted questions)

---

## 🚫 HARD RULES (never break)

1. **Never use frameworks** — No React, Vue, Angular, Svelte, etc.
2. **Never use namespace imports for Three.js** — Always `import { X } from 'three'`, never `import * as THREE`
3. **Never invent APIs** — Use `#vscode-websearchforcopilot_webSearch` for Three.js/Motion.dev/browser APIs, cite sources
4. **No report files** — Update `WHITEPAPER.md`, `TODO.md`, or `CHANGELOG.md` only
5. **Keep chat output minimal** — Short answers unless asked for detail
6. **Always ask clarifying questions** before design decisions (animation timing, material properties, camera angles)
7. **Single file output mandate** — Final build MUST be single HTML file with inlined CSS/JS

---

## ANTI-HALLUCINATION RULE (mandatory)

**ALWAYS use `#vscode-websearchforcopilot_webSearch`** for:
- **Three.js API usage** — MeshStandardMaterial properties, Object3D methods, lighting setup
- **PBR materials** — Roughness/metalness values, texture mapping
- **Three.js performance** — Render loop optimization, shadow map settings
- Motion.dev or anime.js API usage/examples
- Browser APIs (Intersection Observer, Pointer Events, etc.)
- TypeScript best practices (2025 standards)

**Research hierarchy:**
1. Search codebase first (`src/` files)
2. Use `#vscode-websearchforcopilot_webSearch` on **official docs** (threejs.org, motion.dev, MDN)
3. Community sources (Stack Overflow, Three.js Discourse, Reddit r/threejs) — cite URL and date

**Citation format:** Include source URL in plan before implementing.

**Three.js-specific:** Always verify property names/methods against official docs (avoid hallucinated APIs like `.pivot` or `.transformOrigin` which don't exist).

---

## CODE STYLE & STANDARDS

### **TypeScript (2025 Best Practices)**

**Naming conventions:**
- Classes: \`PascalCase\` (e.g., \`ZFoldCard\`)
- Functions/methods: \`camelCase\` (e.g., \`animateToUnfolded\`)
- Constants: \`SCREAMING_SNAKE_CASE\` (e.g., \`DEFAULT_DURATION\`)
- Types/Interfaces: \`PascalCase\` with \`I\` prefix for interfaces (e.g., \`ICardConfig\`)
- Enums: \`PascalCase\` (e.g., \`CardState\`)

**Type safety:**
- Never use \`any\` (use \`unknown\` + type guards if needed)
- Prefer interfaces over types for object shapes
- Use \`satisfies\` operator for type narrowing (TS 4.9+)
- Enable strict mode in \`tsconfig.json\`

---

### **SCSS (Minimal — Canvas Layout Only)**

**Three.js renders to canvas, SCSS only handles page layout:**

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
  cursor: pointer; // Indicate clickable
}
```

**No BEM needed** — Three.js handles all visual styling via materials/lights.

---

### **Animation Standards (Three.js)**

**Primary: requestAnimationFrame + lerp interpolation**
```typescript
private animate(): void {
  const targetState = this.state === CardState.UNFOLDED
    ? { topRotation: 0, topY: 210 }
    : { topRotation: Math.PI, topY: 105 };
  
  const duration = 800;
  const startTime = performance.now();
  const startRotation = this.topPanelGroup.rotation.x;
  
  const animateFrame = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = this.easeInOutCubic(progress);
    
    this.topPanelGroup.rotation.x = this.lerp(
      startRotation,
      targetState.topRotation,
      eased
    );
    
    if (progress < 1) requestAnimationFrame(animateFrame);
  };
  
  requestAnimationFrame(animateFrame);
}

private lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
```

**Motion.dev (optional for camera only):**
```typescript
import { animate, spring } from 'motion';

// Animate camera position (not Three.js objects)
animate(
  (progress) => {
    this.camera.position.z = this.lerp(600, 400, progress);
  },
  { duration: 0.8, easing: spring({ stiffness: 300, damping: 30 }) }
);
```

**Performance rules:**
- Use `requestAnimationFrame` for all Three.js object property changes
- Only animate `rotation`, `position`, `scale` (cheap GPU transforms)
- Never animate geometry vertices directly (causes recomputation)
- Keep render loop constant, update only changed properties

---

## PROJECT STRUCTURE (MANDATORY)

\`\`\`
```
js-z-fold-gift-card/
├── src/                           # Source code (editable)
│   ├── index.html                 # HTML with canvas element
│   ├── styles/
│   │   ├── main.scss              # Canvas layout only (minimal)
│   │   └── _variables.scss        # Background colors, z-index
│   ├── scripts/
│   │   ├── main.ts                # Entry point (instantiate ZFoldCard)
│   │   ├── ZFoldCard.ts           # Core class (Three.js scene, state machine)
│   │   ├── types.ts               # TypeScript interfaces/enums
│   │   └── utils.ts               # Three.js helpers (createPanelMesh, setupLighting)
│   └── assets/
│       └── textures/              # Paper texture maps (optional)
├── dist/                          # Build output (DO NOT EDIT MANUALLY)
│   └── index.html                 # Single-file output (CSS/JS/Three.js inlined)
├── docs/                          # Documentation
│   ├── WHITEPAPER.md              # Architecture & Three.js implementation
│   └── TODO.md                    # Task tracking
├── .github/
│   ├── copilot-instructions.md    # This file
│   └── persona.md                 # AI personality config
├── vite.config.ts                 # Vite build configuration
├── package.json                   # Dependencies (three, @types/three, motion)
├── tsconfig.json                  # TypeScript compiler options
├── CHANGELOG.md                   # Version history
└── README.md                      # Project overview
```
\`\`\`

**Rules:**
- ❌ Do NOT create subdirectories in \`scripts/\` (we have 4 files max)
- ❌ Do NOT create \`components/\`, \`services/\`, \`helpers/\` folders (over-engineering)
- ✅ Keep all TypeScript in \`scripts/\` (flat structure)
- ✅ Use SCSS partials (prefix with \`_\`) for modular styles

---

## BUILD SYSTEM

### **TypeScript Config**

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

### **NPM Scripts**

\`\`\`json
{
  "scripts": {
    "dev": "esbuild src/scripts/main.ts --bundle --outfile=dist/bundle.js --watch --servedir=dist",
    "build": "node esbuild.config.js",
    "build:inline": "npm run build && node scripts/inline-assets.js",
    "preview": "python3 -m http.server 8080 --directory dist",
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

---

## TESTING & VERIFICATION

**For each change, provide:**

1. **Short plan** (2–4 bullets)
2. **Code diff** (only changed sections, not full files)
3. **Verification checklist** (3–6 manual test steps)

**Example checklist:**
\`\`\`
✅ Card renders in FOLDED state (3 panels visible)
✅ Hover effect triggers (scale + shadow change)
✅ Click unfolds card to fullscreen
✅ Background blur applies
✅ Click refolds card (reverses animation)
✅ No console errors, 60fps maintained
\`\`\`

**Performance checks:**
- Bundle size: \`ls -lh dist/index.html\` (target <100KB)
- Animation FPS: Chrome DevTools > Performance > Record interaction
- Lighthouse score: Aim for 95+ performance

---

## COMMUNICATION RULES

**Ask specific questions only** — no broad/open questions.

**Example:**  
✅ "Should unfold duration be 0.6s or 0.8s for smoother feel?"  
❌ "What do you think about the animation?"

**When research needed:**  
"I will run \`#vscode-websearchforcopilot_webSearch\` on [Motion.dev spring physics]. Proceed?" — wait for confirmation, then execute.

**Response length:**
- Simple questions: 1–3 sentences
- Code changes: Minimal diff + short explanation
- Complex features: Plan → Questions → Implementation (pause between steps)

---

## COMMIT MESSAGE FORMAT

\`\`\`
type(scope): short summary — emoji

Types: feat, fix, chore, docs, style, refactor, perf, test

Examples:
feat(animation): add spring physics to unfold transition ⚡
fix(card): prevent double-click race condition 🐛
chore(build): configure esbuild inline plugin ✨
docs(whitepaper): add animation timing diagram 📚
perf(css): use will-change for transform optimization 🚀
\`\`\`

---

## DEPENDENCIES

### **Runtime (included in bundle)**
- `three` — Three.js WebGL library (~500KB unminified, ~125KB gzipped with tree-shaking)
- `motion` (optional) — Motion.dev for camera animations (~12KB gzipped)

### **Build-time (devDependencies)**
- `vite` — Dev server + bundler (already installed)
- `vite-plugin-singlefile` — Inline assets into single HTML
- `typescript` — Type checking (already installed)
- `sass` — SCSS processor (already installed)
- `@types/three` — Three.js TypeScript definitions

**Total bundle target:** ~150-200KB (Three.js + Motion.dev + app code inlined)

---

## CURRENT PROJECT STATE

**Version:** 0.2.0 (Three.js Stack Finalized)  
**Status:** 🚀 READY FOR IMPLEMENTATION

**Stack finalized:**
- ✅ Three.js WebGLRenderer (photorealistic 3D)
- ✅ MeshStandardMaterial (PBR paper rendering)
- ✅ Object3D hierarchy (hinge rotation simulation)
- ✅ TypeScript + SCSS + Vite (build system preserved)
- ✅ Click-only interaction (no drag-to-rotate)
- ✅ Tree-shaking strategy (named imports only)

**Next steps:**
- [ ] Install Three.js: `bun add three @types/three vite-plugin-singlefile`
- [ ] Create HTML with canvas element
- [ ] Setup Three.js scene (renderer, camera, lights)
- [ ] Create 3 PlaneGeometry panels with hinge groups
- [ ] Implement fold/unfold animation (requestAnimationFrame + lerp)
- [ ] Add click event handler
- [ ] Build and test single-file output

---

## SUCCESS CRITERIA

**Before marking feature as "done":**
- [ ] TypeScript compiles with zero errors (\`npm run type-check\`)
- [ ] Build succeeds (\`npm run build\`)
- [ ] Output is single HTML file in \`dist/\`
- [ ] Bundle size <100KB
- [ ] Animations run at 60fps (tested in Chrome DevTools)
- [ ] Works in latest Chrome, Firefox, Safari
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessible (keyboard navigation, ARIA labels where needed)
- [ ] Documented in CHANGELOG.md

---

## ANTI-PATTERNS TO AVOID

**Don't do this:**
- ❌ Adding React/Vue/Svelte dependencies
- ❌ Namespace imports: `import * as THREE from 'three'` (bundles entire lib)
- ❌ Animating with CSS 3D transforms (use Three.js objects)
- ❌ Creating `node_modules/` bloat (only essential deps)
- ❌ Over-abstracting (we're building ONE card, not a library)
- ❌ jQuery or legacy libraries
- ❌ Multiple output files (goal is single HTML)

**Do this instead:**
- ✅ Named imports: `import { WebGLRenderer, Scene } from 'three'`
- ✅ Three.js Object3D hierarchy for all 3D transforms
- ✅ requestAnimationFrame for smooth animations
- ✅ MeshStandardMaterial for realistic rendering
- ✅ Vite for fast bundling with tree-shaking
- ✅ Single-file output with inlined assets

---

**END OF INSTRUCTIONS**
