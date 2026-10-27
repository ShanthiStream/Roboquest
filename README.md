# ROBOQUEST — THE TINY AI ADVENTURE
> **Your Words. Your Robot. Your Adventure.**

A 10-level, on-device AI-powered browser game built with **React**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Vite**, engineered for deployment to **Cloudflare Pages**. Control your robot companion through natural-language text or voice commands interpreted by a modular AI adapter system with honest runtime disclosure.

---

## 🌟 Key Highlights

- **10 Handcrafted Progressive Levels:** From introductory orientation in Sector 1 to the master puzzle combining keys, lasers, crates, portals, and energy management in Sector 10.
- **On-Device AI Engine & Transparent Fallback:**
  - `NeedleAdapter`: Designed for Cactus Needle ultra-compact WASM runtime.
  - `RuleBasedFallbackAdapter`: 100% deterministic local compiler capable of interpreting compound phrases, directions, counting, item interactions, and conditionals.
  - Transparent status reporting: Clearly indicates in the UI whether the active runtime is the native Needle WASM or the Rule-Based Fallback.
- **Voice Commander:** Web Speech API integration with live transcription, interim preview, and robotic speech synthesis responses.
- **Self-Contained Procedural Audio:** Complete sci-fi sound effects and ambient soundtrack synthesized via the Web Audio API without missing audio files or network dependencies.
- **Robot Customization:** Unlock 5 chassis colorways, 6 accessories (Antenna, Space Helmet, Mini Jetpack, Scientist Glasses, Golden Crown), and 4 particle motion trails using energy crystals earned through gameplay.
- **Interactive Level Editor (Creative Mode):** Paint custom tilemaps, place puzzles, test play instantly, verify solvability with built-in BFS, and generate compact, shareable URLs.
- **Daily Challenge Mode:** Deterministic date-seeded puzzle generation with guaranteed solvability.
- **Shareable Victory Cards:** In-browser Canvas image generator rendering 1200x675 mission completion certificates with player stats and customized robot avatar.
- **"Show How AI Thinks" Educational Inspector:** Transparently exposes user input, active runtime, raw generated tool-calls, Zod schema validation, execution traces, and latency in milliseconds.
- **Progressive Web App (PWA):** Service worker caching, offline gameplay, and manifest for installability on mobile and desktop.
- **Automated Test Suite:** 50 automated tests in Vitest covering the game engine, all 10 level solutions, AI parsing, and puzzle encoding.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Bundler & Dev Server** | Vite 6 |
| **Styling** | Tailwind CSS + Custom Neon/Glassmorphism Design System |
| **State Management** | Zustand |
| **Validation** | Zod (discriminated union action schemas) |
| **Game Renderer** | Custom 60 FPS Canvas 2D / Isometric-inspired Engine |
| **Voice Recognition** | Web Speech API (`webkitSpeechRecognition` + `SpeechSynthesis`) |
| **Sound System** | Web Audio API (procedural synthesis) |
| **Storage & Persistence** | localStorage (profile, crystals, unlocks, high scores) |
| **Offline/PWA** | Service Worker (`sw.js`) + Web App Manifest |
| **Testing** | Vitest (50 automated unit & integration tests) |
| **Deployment Target** | Cloudflare Pages (`wrangler.toml` + `public/_headers`) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v25)
- npm 9+

### Installation
```bash
# Clone or navigate into the repository
cd Roboquest

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Running Automated Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```
The optimized bundle is output to `dist/`.

---

## ☁️ Cloudflare Pages Deployment

### Option 1: Wrangler CLI
```bash
npx wrangler pages deploy dist --project-name=roboquest
```

### Option 2: Cloudflare Dashboard Git Integration
1. Connect your repository to **Cloudflare Pages**.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Build output directory: `dist`.

Security and caching headers are automatically supplied by `public/_headers`.

---

## 🎮 The 10 Handcrafted Sectors

1. **Hello, Robot!** (Beginner): Orientation, movement commands, and reaching the green exit portal.
2. **Energy Hunt** (Beginner): Gathering glowing energy batteries to power the extraction portal.
3. **The Maze** (Easy): Precision pathfinding through laboratory wall partitions.
4. **Locked Out** (Easy): Security doors, keycards, and dependency sequencing.
5. **Power Crisis** (Medium): Resource management and charging pads.
6. **Laser Lab** (Medium): Timed laser hazards and waiting for cycle safe windows.
7. **Switch Master** (Hard): Sokoban-style block pushing onto pressure plates.
8. **Portal Puzzle** (Hard): Spatial traversal across disconnected regions via quantum teleporters.
9. **Robot Logic** (Advanced): Multi-stage planning with battery collection, keys, doors, and hazard bypass.
10. **The Great Escape** (Expert): Master final challenge integrating all mechanics.

---

## 📄 License
MIT License. Open-source indie educational project.
