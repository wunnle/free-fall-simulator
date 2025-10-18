# Free Fall Simulator

An interactive physics simulator created for educational purposes to help students **visualize and understand the mechanics of free fall** in a frictionless environment. This project simulates **two objects** falling under gravity and presents their motion through real-time **position–time**, **velocity–time**, and **acceleration–time** charts.

**[See it Live](https://freefall.kafagoz.com)**

---

## Features

### Interactive Controls
- **Adjustable object properties:**
  - **m₁, m₂** — object masses (1-50 kg) *(for demonstration; mass has no effect in vacuum)*
  - **h₁, h₂** — starting heights (10m - 60km) with dynamic step sizing
  - **g** — gravitational acceleration with celestial body presets

### Celestial Body Simulation
- **Pre-configured planets:** Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Sun
- **Custom gravity** settings (0.5 - 280 m/s²)
- **Real-world gravity values** for accurate physics education

### Real-Time Visualization
- **Synchronized charts** powered by **[Recharts](https://recharts.org/)**
- **Animation display** with height reference bands showing real landmarks:
  - Galata Tower (67m)
  - Maiden's Tower (23m) 
  - Bosphorus Bridge (165m)
  - Çamlıca Tower (369m)
  - And more up to mesosphere (50km)

### Simulation Controls
- **Start/Pause/Reset** functionality
- **Auto-scroll** to animation when simulation begins
- **Time display** with precision timing
- **Mobile-responsive** design with compact controls

### Internationalization
- **Bilingual support:** English and Turkish
- **Automatic language detection** based on browser settings
- **Complete translations** for all UI elements and landmarks

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/wunnle/free-fall-simulator.git
cd free-fall-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open your browser at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

---

## Educational Purpose

This simulator demonstrates fundamental physics principles:

- **Universal Gravitation:** All objects accelerate equally under gravity, regardless of mass
- **Kinematic Equations:** Visual representation of position, velocity, and acceleration relationships
- **Comparative Analysis:** Side-by-side comparison of objects with different starting heights
- **Real-World Context:** Height references from famous landmarks to mesospheric altitudes

### Learning Objectives
- Understand that **mass does not affect fall time** in vacuum conditions
- Visualize the **quadratic relationship** between position and time
- Observe the **linear relationship** between velocity and time  
- Recognize **constant acceleration** in free fall motion

---

## Tech Stack

- **React** - Component-based UI framework
- **TypeScript** - Type-safe development
- **Recharts** - Interactive charting library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **i18n** - Internationalization support

---

## Project Structure

```
src/
├── App.tsx                    # Main simulator component
├── components/
│   └── ReferenceHeightBands.tsx  # Height reference landmarks
├── constants.ts               # Planet gravity constants
├── translations.ts            # Internationalization strings
└── main.tsx                  # Application entry point
```

---

## More Projects

Explore more projects like this at [kafagoz.com](https://kafagoz.com/)

---

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## License

**MIT © 2025** — Educational use encouraged.

Feel free to adapt, extend, or use this simulator for your own classroom demonstrations, research, or educational projects. The goal is to make physics education more interactive and accessible.


**Made with ♥ by [wunnle](https://wunnle.dev/)**
