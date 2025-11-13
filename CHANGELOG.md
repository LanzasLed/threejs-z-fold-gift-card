# Changelog

All notable changes to the Z-Fold Gift Card project.

---

## [1.0.0] - 2025-11-13

### ✨ Features
- **Three.js WebGL rendering** with photorealistic PBR materials
- **Smooth fold/unfold animations** with sequential panel motion (150ms delay)
- **Interactive hover effects** with subtle parallax camera movement
- **Custom SVG textures** loaded with anisotropic filtering
- **Keyboard support** (Space/Enter to toggle, Escape to close)
- **Responsive design** with automatic canvas resizing

### 🔧 Technical
- Object3D hierarchy for proper hinge rotation simulation
- Z-position layering (top: 10, middle: -30, bottom: -5 when folded)
- Linear texture filtering to prevent black edge artifacts
- MeshStandardMaterial with side: FrontSide for correct rendering
- White background plane positioned behind card
- Fade-in animation on initial load
- Raycaster-based hover detection

### 🎨 Visual
- Panel thickness: 0.8mm for realistic paper feel
- 15° slight closure when unfolded for depth
- Proper material properties (roughness: 0.65-0.7, metalness: 0)
- DoubleSide white backing material
- Neutral tone mapping with 1.2 exposure

### 📦 Build
- TypeScript strict mode
- Vite bundler with HMR
- Named Three.js imports for tree-shaking
- SCSS minimal styling

---

## [0.2.0] - 2025-11-13

### Changed
- Complete rewrite using Three.js instead of CSS 3D transforms
- Replaced Motion.dev with requestAnimationFrame for animations

### Removed
- Previous CSS 3D transform implementation
- Motion.dev dependency

---

## [0.1.0] - 2025-11-03

### Added
- Initial project setup with CSS 3D transforms
- Motion.dev for spring animations
- Basic fold/unfold mechanics

---

[1.0.0]: https://github.com/richardevcom/js-z-fold-gift-card/releases/tag/v1.0.0
[0.2.0]: https://github.com/richardevcom/js-z-fold-gift-card/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/richardevcom/js-z-fold-gift-card/releases/tag/v0.1.0
