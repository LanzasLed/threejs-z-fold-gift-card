# Z-Fold Gift Card (Three.js)
[![](https://img.shields.io/static/v1?label=Sponsor+%F0%9F%91%89&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/richardevcom)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Three.js](https://img.shields.io/badge/Three.js-r181-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

> Interactive 3D z-fold gift card with photorealistic rendering and smooth animations

![Preview](docs/preview.gif)

**[🎮 Live Demo on CodePen](https://codepen.io/richardevcom/pen/wBGKzQN)**

---

## ✨ Features

- 🎴 **Photorealistic 3D rendering** using Three.js WebGL
- ✨ **Smooth fold/unfold animations** with sequential panel motion
- 🖱️ **Interactive hover effects** with subtle parallax
- 📱 **Responsive design** works on desktop, tablet, and mobile
- ⚡ **Optimized performance** 60fps animations with proper z-ordering
- 🎨 **Custom SVG textures** for personalized designs

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production (separate HTML/CSS/JS files)
bun run build
# Output: dist/index.html + dist/assets/svg/*.svg (editable after build)

# Build single-file version (all inlined, ~14MB)
bun run build:single
# Output: dist/index.html (single file with SVGs embedded)
```

Visit `http://localhost:5173` to view the card.

---

## 🎨 Customizing Card Designs

After running `bun run build`, you can customize the card by editing the SVG files:

- `dist/assets/svg/gift-card-top.svg` — Top panel design
- `dist/assets/svg/gift-card-middle.svg` — Middle panel design
- `dist/assets/svg/gift-card-bottom.svg` — Bottom panel design

Simply replace these files with your own designs (same dimensions: 794×374.33px). The card will automatically load your custom textures without rebuilding.

---

## 📁 Project Structure

```
js-z-fold-gift-card/
├── src/
│   ├── index.html           # Entry point
│   ├── styles/
│   │   └── main.scss        # Minimal canvas styling
│   ├── scripts/
│   │   ├── main.ts          # Application entry
│   │   ├── ZFoldCard.ts     # Main card class
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── utils.ts         # Helper functions
│   └── svg/                 # Card texture assets
├── docs/
│   ├── WHITEPAPER.md        # Technical documentation
│   └── TODO.md              # Task tracking
├── CHANGELOG.md             # Version history
└── README.md                # This file
```

---

## 🎮 Usage

**Click** the card to toggle between folded and unfolded states.  
**Hover** over the card for subtle parallax effects.  
**Press Space/Enter** to toggle with keyboard.

---

## 🛠️ Tech Stack

- **Three.js** — WebGL 3D rendering
- **TypeScript** — Type-safe development
- **SCSS** — Minimal styling
- **Vite** — Fast build tooling
- **Bun** — Package management

---

## 📖 Documentation

See [WHITEPAPER.md](docs/WHITEPAPER.md) for detailed architecture and implementation notes.

---

## 👤 Author

[richardevcom](https://github.com/richardevcom)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
_Docs generated with Copilot Claude Sonnet 4.5_
