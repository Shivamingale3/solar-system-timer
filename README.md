# 🪐 Cosmic Timer

<div align="center">

![Solar System Timer](public/textures/earth_day.jpg)

<!-- You can replace the above image with a real screenshot later -->

**A Cinematic 3D Journey Through Time**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-8.0-black?style=for-the-badge&logo=three.js)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

## 🌌 Overview

**Cosmic Timer** is not just a productivity tool; it's an immersive 3D experience. Watch as the solar system comes to life on your screen, with planets orbiting in real-time. Set your focus duration and let the majestic rotation of the cosmos guide your workflow.

Built with modern web technologies, it features a fully interactive 3D solar system, realistic planet textures, and smooth camera controls.

## ✨ Features

- **Hyper-Realistic 3D Visuals**: All 8 planets rendered with high-fidelity textures, matte materials, and atmospheric lighting.
- **Interactive Exploration**:
  - **Orbit Controls**: Drag to rotate the solar system and explore the void.
  - **Focus Mode**: Click on any planet (like Saturn or Mars) to zoom in. The camera tracks the planet's inclined orbit while it rotates on its axis behind your timer.
- **Cinematic Experience**:
  - **Procedural Rings**: Beautiful, semi-transparent rings for Saturn and Uranus.
  - **Dynamic Sun**: A volatile, blazing sun at the center of it all.
  - **Deep Space**: Immersive starfield and sparkles.
- **Productivity First**: A sleek, glassmorphism UI overlay for setting timers without obstructing the view.

## 🚀 high-Velocity Start

Clone the universe to your local machine:

```bash
git clone https://github.com/your-username/solar-system-timer.git
cd solar-system-timer
```

Install the dependencies (fuel the ship):

```bash
npm install
# or
yarn install
```

Ignite the engines:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Renderer**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Helpers**: [Drei](https://github.com/pmndrs/drei) (OrbitControls, Stars, Environment)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🎨 Customization

### Adding Textures

Textures are loaded dynamically. You can create procedural textures (as seen in `src/lib/textures.ts`) or drop high-res images into `public/textures/`.

### Adjusting Orbits

Planet data is centralized in `src/components/Scene.tsx`. You can easily tweak orbital radii, speeds, and inclinations:

```typescript
const PLANET_DATA = {
  mars: {
    radius: 12,
    speed: 0.8,
    groupRotation: [0, 0, Math.PI / 6], // Inclination
  },
  // ...
};
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ for the void.
</div>
