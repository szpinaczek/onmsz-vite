---
description: Repository Information Overview
alwaysApply: true
---

# ONMSZ Information

## Summary
ONMSZ is an interactive web application that allows users to follow the route of the 1975 experimental film "Oj! Nie mogę się zatrzymać". The project features a synchronized ecosystem where a video player, an interactive Leaflet map, and a route data table remain in constant sync, allowing users to track the cinematic journey in real-time.

## Structure
- **[./public/](./public/)**: Static assets including the main video file (`onmsz_medium_compressed.mp4`), data points (`frames.json`), and various images/icons.
- **[./src/components/](./src/components/)**: Core application components.
  - **[./src/components/ui/](./src/components/ui/)**: Reusable UI components (Shadcn UI based).
  - **[./src/components/i18n/](./src/components/i18n/)**: Internationalization context and translations (Polish/English).
  - **Main Features**: `video-player.tsx`, `map-section.tsx`, `route-table.tsx`, and `street-view-pane.tsx`.
- **[./src/hooks/](./src/hooks/)**: Custom React hooks for logic reuse.
- **[./src/lib/](./src/lib/)**: Utility functions and helper modules.
- **[./src/types/](./src/types/)**: TypeScript type definitions.

## Language & Runtime
**Language**: TypeScript  
**Version**: ~5.8.3 (TypeScript)  
**Framework**: React 19.1.1  
**Build System**: Vite 7.1.2  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `react`: ^19.1.1
- `leaflet` & `react-leaflet`: Map visualization
- `framer-motion` & `gsap`: Animation libraries
- `@radix-ui/*`: Primitive UI components
- `tailwindcss`: Styling framework
- `recharts`: Data visualization for distance charts
- `@googlemaps/js-api-loader`: Google Maps integration (Street View)

**Development Dependencies**:
- `vite`: ^7.1.2
- `eslint`: ^9.33.0
- `typescript`: ~5.8.3

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Main Files & Resources
- **[./src/main.tsx](./src/main.tsx)**: Application entry point.
- **[./src/App.tsx](./src/App.tsx)**: Main application layout and state coordination.
- **[./public/frames.json](./public/frames.json)**: The core data source containing coordinates, timestamps, and location descriptions.
- **[./vite.config.ts](./vite.config.ts)**: Vite configuration.
- **[./tailwind.config.ts](./tailwind.config.ts)**: Tailwind CSS configuration.

## Testing & Validation
**Framework**: None explicitly configured (Standard ESLint for linting).
**Linting**:
```bash
npm run lint
```
