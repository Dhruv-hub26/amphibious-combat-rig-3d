# 🛡️ AMPHIBIOUS COMBAT RIG // 3D Interactive Telemetry Cockpit

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A high-performance, dark tactical military interactive 3D Web application engineered with **React 19**, **Three.js**, **@react-three/fiber**, **@react-three/drei**, and **Tailwind CSS**. Features real-time GLTF rig synchronization, procedural dual-oscillator diesel engine audio synthesis, dynamic HUD telemetry, multiple camouflage finishes, and tactical camera presets.

---

## ⚡ Key Features

- **🎮 Real-Time 3D Tank Rig Synchronization**:
  - Automatically loads and auto-normalizes the bounding box of `public/amphibious_tank.glb`.
  - Seamlessly controls baked GLTF skeletal animation tracks via `@react-three/drei`'s `useAnimations`.
  - Dynamic time-scaling (`0.5x PATROL`, `1.0x COMBAT`, `2.0x ENGAGE`) synchronized with propulsion state.
  - Realistic multi-terrain physics: mechanical land chassis micro-vibration vs. oceanic water heave, pitch, and roll.

- **🔊 Zero-Asset Procedural Audio Synthesizer (`useTankAudio`)**:
  - Dual low-frequency oscillators (triangle + detuned sine) routed through a dynamic lowpass BiquadFilterNode (`140Hz - 360Hz`).
  - Smooth `0.4s` attack fade-in and `0.5s` decay fade-out eliminating pops or clicks.
  - Real-time pitch and resonance modulation corresponding to throttle load and land/water drive modes.
  - Tactile high-frequency user interface click chirps.

- **🖥️ Military Cyberpunk HUD (`TelemetryHUD`)**:
  - Strict pointer-events isolation preventing interference with 3D OrbitControls.
  - Real-time animated circular RPM gauge with threshold-based color dynamics.
  - Dual velocity readouts: Ground Velocity (`KM/H`) and Amphibious Nautical Hydro Velocity (`KNOTS`).
  - Drive mode selector (`LAND CRAWL` vs. `AMPHIBIOUS WATER DRIVE`).
  - Armor integrity composite status bar, live triangle counter, and real-time compass bearing heading readout.
  - Four distinct camouflage tactical finishes: `Camo Green`, `Urban Slate`, `Desert Sand`, and `Stealth Obsidian`.
  - Wireframe inspection mode with high-contrast tactical cyan shader overlay.

- **🎥 Camera View Controller**:
  - 4 Tactical Viewpoints: `TACTICAL ORBIT`, `TURRET VIEW`, `TREAD TRACKS`, and `BIRD'S EYE`.
  - OrbitControls with soft damping (`0.05`), distance limits, and polar angle protection preventing below-ground flipping.

---

## ⌨️ Tactical Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Toggle Propulsion Engine (`ENGAGE` / `STANDBY`) |
| `1` | Set Throttle to `0.5x PATROL` |
| `2` | Set Throttle to `1.0x COMBAT` |
| `3` | Set Throttle to `2.0x ENGAGE` |
| `M` | Toggle Drive Mode (`LAND` ⟷ `WATER`) |
| `W` | Toggle Wireframe Inspection Mode |
| `R` | Reset Camera to Tactical Orbit Preset |

---

## 📁 Architecture Overview

```
├── public/
│   ├── amphibious_tank.glb     # 3D GLTF Tank Model Asset
│   ├── favicon.svg             # Tactical Military SVG Favicon
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── CanvasScene.tsx     # Three.js Canvas, Lights, Fog, Ground & OrbitControls
│   │   ├── TankModel.tsx       # GLTF Model Loader, Camo, Wireframe & Animations
│   │   └── TelemetryHUD.tsx    # Glassmorphic Tactical Cockpit HUD Overlay
│   ├── hooks/
│   │   └── useTankAudio.ts     # Web Audio API Engine Synthesizer & SFX
│   ├── types/
│   │   └── telemetry.ts        # TypeScript Type Definitions & Interfaces
│   ├── App.tsx                 # Root Simulation State & Keyboard Integration
│   ├── index.css               # Tactical Tailwind Theme, Glows & Typography
│   └── main.tsx                # React DOM Mount
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### 2. Installation
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will start on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready static bundle in `dist/`.

---

## 🎨 Design System & Aesthetics
- **Primary Background**: Dark Obsidian (`#08090b`)
- **Accent Tactical Colors**: High-contrast Amber (`#F59E0B`), Cyan (`#06B6D4`), Emerald (`#10B981`), Rose (`#F43F5E`)
- **Typography**: 
  - UI Labels & Controls: `'Plus Jakarta Sans'`
  - Telemetry Digits & Telemetry Stats: `'JetBrains Mono'`
- **Overlay Surface**: Ultra-thin glassmorphic panels with `backdrop-filter: blur(20px)` and subtle military reticles.
---

## 🎖️ 3D Asset Attribution
- **3D Model**: "Amphibious Tank (Rigged)" via Sketchfab ([Model Link](https://skfb.ly/6THEP)).
- Optimized and rigged for WebGL / Three.js real-time simulation.# amphibious-combat-rig-3d
