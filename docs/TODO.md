# TODO — Z-Fold Gift Card (v0.2.0)

**Last Updated**: November 13, 2025  
**Status**: 🚀 Three.js stack finalized — ready for implementation

---

## 🎯 IMMEDIATE NEXT STEPS

### Phase 1: Environment Setup ✅ COMPLETE
- [x] Research z-fold mechanics (physical paper folding)
- [x] Research Three.js implementation patterns (Object3D hierarchy)
- [x] Research PBR materials and lighting
- [x] Finalize tech stack: Three.js + TypeScript + Vite
- [x] Update documentation (WHITEPAPER, copilot-instructions)

### Phase 2: Dependencies & Project Structure
- [ ] Install Three.js: `bun add three @types/three`
- [ ] Install Vite plugin: `bun add -d vite-plugin-singlefile`
- [ ] Create `src/` directory structure:
  - [ ] `src/index.html` (canvas element)
  - [ ] `src/styles/main.scss` (minimal canvas layout)
  - [ ] `src/scripts/main.ts` (entry point)
  - [ ] `src/scripts/ZFoldCard.ts` (core class)
  - [ ] `src/scripts/types.ts` (interfaces/enums)
  - [ ] `src/scripts/utils.ts` (Three.js helpers)

### Phase 3: Three.js Scene Setup
- [ ] Initialize WebGLRenderer (antialias, shadow map)
- [ ] Create Scene with background color
- [ ] Setup PerspectiveCamera (front-facing view)
- [ ] Add lighting:
  - [ ] AmbientLight (soft fill, 0.6 intensity)
  - [ ] DirectionalLight (main, 0.8 intensity, shadow casting)
- [ ] Configure shadow map (PCFSoftShadowMap)
- [ ] Create render loop (requestAnimationFrame)
- [ ] Handle window resize events

### Phase 4: Z-Fold Card Geometry
- [ ] Create PlaneGeometry for panels (99×210mm, A4 thirds)
- [ ] Create MeshStandardMaterial for paper:
  - [ ] Color: 0xffffff (white)
  - [ ] Roughness: 0.8 (matte)
  - [ ] Metalness: 0.0 (non-metallic)
  - [ ] Side: DoubleSide
- [ ] Build Object3D hierarchy:
  - [ ] CardGroup (parent container)
  - [ ] TopPanelGroup (pivot at bottom edge)
  - [ ] MiddlePanel (remains flat, anchor)
  - [ ] BottomPanelGroup (pivot at top edge)
- [ ] Offset panel geometries for correct pivot points
- [ ] Set initial FOLDED state transforms:
  - [ ] Top: rotation.x = Math.PI, position.y = 105
  - [ ] Middle: rotation.x = 0, position.y = 0
  - [ ] Bottom: rotation.x = -Math.PI, position.y = -105

### Phase 5: Animation System
- [ ] Create state machine (CardState enum: FOLDED, UNFOLDED)
- [ ] Implement lerp helper function (linear interpolation)
- [ ] Implement easeInOutCubic easing function
- [ ] Build animate() method:
  - [ ] Calculate target transforms based on state
  - [ ] Use requestAnimationFrame for smooth interpolation
  - [ ] Animate rotation.x for top/bottom panels
  - [ ] Animate position.y for vertical spacing
  - [ ] Duration: 800ms
- [ ] Add click event listener (toggle state)
- [ ] Prevent double-click during animation (isAnimating flag)

### Phase 6: Testing & Refinement
- [ ] Verify FOLDED state (middle panel visible, top/bottom behind)
- [ ] Verify UNFOLDED state (all panels flat, vertically aligned)
- [ ] Test animation smoothness (60fps target)
- [ ] Test rapid clicking (no race conditions)
- [ ] Check shadow rendering quality
- [ ] Validate bundle size: `bun run build && ls -lh dist/index.html`
- [ ] Target: ~150-200KB (Three.js ~125KB + app code)

### Phase 7: Polish & Documentation
- [ ] Add keyboard support (Space = toggle, Esc = fold back)
- [ ] Improve paper material (optional: add paper texture)
- [ ] Fine-tune lighting (adjust positions/intensities)
- [ ] Update CHANGELOG.md (v0.3.0 release notes)
- [ ] Update README.md (installation, usage, build commands)
- [ ] Record demo GIF/video for README

---

## 📝 LESSONS LEARNED FROM PREVIOUS ITERATION

**Why we reset to Three.js:**

**Problem 1: CSS 3D Transform Limitations**
- CSS `transform-origin` caused panels to disconnect during rotation
- Z-index stacking was inconsistent between folded/unfolded states
- Difficult to achieve realistic paper material with CSS alone
- No proper lighting/shadows (box-shadow is 2D projection)

**Solution:** Three.js WebGL with Object3D hierarchy
- Parent-child relationships simulate pivot points naturally
- Z-order handled automatically by 3D scene graph
- PBR materials (MeshStandardMaterial) with real lighting
- GPU-accelerated shadows with soft edges

**Problem 2: Motion.dev + CSS Custom Properties**
- `spring()` helper threw keyframe errors when animating CSS variables
- Had to use cubic-bezier fallback (less organic feel)

**Solution:** requestAnimationFrame + manual lerp
- Direct control over Three.js object properties
- Smooth interpolation with custom easing functions
- No library conflicts (Motion.dev optional for camera only)

**Problem 3: Middle Panel Not Staying Visible**
- When folded, top/bottom panels would cover middle panel
- CSS z-index didn't respect 3D transform depth

**Solution:** Explicit position offsets in Three.js
- Top panel: `position.y = 105` (moves up when folded)
- Bottom panel: `position.y = -105` (moves down when folded)
- Middle panel: `position.y = 0` (always centered, visible)

---

## 🚫 DECISIONS ARCHIVED (DO NOT REPEAT)

**Issues encountered:**
- Panel stacking order inconsistent between folded/unfolded states
- Transform origins causing panels to disconnect during animation
- Spring physics from Motion.dev caused keyframe errors
- Middle panel not staying as outside face when folded

**Lessons learned:**
- Use explicit CSS custom properties for all transforms
- Define clear snapshots for folded/unfolded states
- Use cubic-bezier easing instead of spring for reliability
- Lock rotation to Y-axis only for consistent viewing angle

---

## 🚫 ARCHIVED DECISIONS

These were removed during reset but documented for reference:

**Previous file structure:**
```
src/
├── index.html
├── scripts/
│   ├── main.ts
│   ├── ZFoldCard.ts
│   ├── types.ts
│   └── utils.ts
├── styles/
│   ├── main.scss
│   ├── _variables.scss
│   ├── _card.scss
│   └── _animations.scss
└── assets/
```

**Previous approach:**
- Three panels with data-panel attributes
- CSS classes for state management (.is-folded, .is-unfolded)
- Motion.dev animate() with CSS variable keyframes
- Pointer events for drag-to-rotate

---

**Ready for fresh start.**
