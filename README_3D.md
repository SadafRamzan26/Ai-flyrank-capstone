# FE-AA2: First 3D Experience

The `/3d` route contains the interactive `ProductViewer3D` experience.

## Implementation

- The `ProductViewer3D` wrapper uses `next/dynamic` with `ssr: false`, keeping Three.js and Leva out of the server render.
- A fixed-height HTML/CSS skeleton reserves the viewer footprint while WebGL initializes, preventing layout shift.
- The scene uses a lightweight torus knot with `96 x 16` segments, capped device pixel ratio (`1` to `1.5`), and high-performance WebGL settings.
- Drei provides studio environment lighting, soft contact shadows, and touch-friendly orbit controls.
- Leva controls material color, metalness, roughness, wireframe, and auto-rotation speed in real time.
- Auto-rotation only updates the mesh transform in `useFrame`; orbit damping remains enabled for a calm touch interaction.

## Future extensions

With more time, this could add saved material presets, GLTF product loading, a screenshot/export action, keyboard rotation controls, and an adaptive quality mode based on device performance.