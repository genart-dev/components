# @genart-dev/components

55 reusable sketch components for the `.genart` ecosystem — 37 JavaScript utilities and 18 GLSL helpers. Components are injected at compile time, making them available inside any algorithm without bundling overhead.

Part of [genart.dev](https://genart.dev) — a generative art platform with an MCP server, desktop app, and IDE extensions.

## Install

```bash
npm install @genart-dev/components
```

## Usage

```typescript
import {
  COMPONENT_REGISTRY,
  resolveComponents,
} from "@genart-dev/components";

// Look up a component by name
const prng = COMPONENT_REGISTRY["prng"];
prng.name;        // "prng"
prng.category;    // "randomness"
prng.target;      // "js"
prng.exports;     // ["seededRandom", "seededRng"]
prng.description; // "Seeded PRNG via mulberry32"

// Resolve a set of components with dependency order
// Returns topologically sorted, deduplicated list
const resolved = resolveComponents(["noise-2d", "prng"]);
// → [prng, noise2d] (prng first — noise-2d depends on it)

// Each resolved component's code is injected before the algorithm
for (const c of resolved) {
  source = c.code + "\n" + source;
}
```

Components are not meant to be imported into your algorithm code directly — they are prepended at compile time by `@genart-dev/core`'s compiler. The `COMPONENT_REGISTRY` and `resolveComponents` API is primarily used by the compiler, MCP server tools, and the desktop editor.

## JavaScript Components (37)

### Randomness & Noise

| Name | Exports | Description |
|------|---------|-------------|
| `prng` | `seededRandom`, `seededRng` | Seeded PRNG (mulberry32) |
| `prng-utils` | `shuffle`, `choice`, `weightedChoice` | PRNG-based collection utilities |
| `noise-2d` | `noise2` | 2D simplex noise |
| `noise-3d` | `noise3` | 3D simplex noise |
| `noise-4d` | `noise4` | 4D simplex noise |
| `worley` | `worley2`, `worley3` | Worley/cellular noise |
| `curl` | `curl2`, `curl3` | Curl noise from gradient fields |

### Math & Easing

| Name | Exports | Description |
|------|---------|-------------|
| `math` | `lerp`, `map`, `clamp`, `smoothstep`, … | Core math utilities |
| `math-advanced` | `gaussianRandom`, `fbm`, `voronoi`, … | Advanced math (fbm, Voronoi, polar) |
| `easing` | `easeIn`, `easeOut`, `easeInOut`, … | 30 easing functions |
| `wave` | `sine`, `triangle`, `sawtooth`, `square` | Periodic wave generators |

### Color

| Name | Exports | Description |
|------|---------|-------------|
| `color` | `hexToRgb`, `rgbToHex`, `lerpColor`, … | Hex/RGB/HSL conversions + interpolation |
| `color-advanced` | `oklchToRgb`, `oklabToRgb`, `palette`, … | OKLCH/OKLAB, palette generation |

### Vector & Geometry

| Name | Exports | Description |
|------|---------|-------------|
| `vector` | `vec2`, `add`, `sub`, `scale`, `dot`, … | 2D vector math |
| `matrix` | `mat3`, `transform`, `rotate`, `scale`, … | 3×3 matrix transforms |
| `shape` | `drawCircle`, `drawRect`, `drawPolygon`, … | Canvas 2D / p5 shape helpers |
| `shape-advanced` | `superellipse`, `lissajous`, `rose`, … | Parametric curves |

### Grid & Distribution

| Name | Exports | Description |
|------|---------|-------------|
| `grid` | `gridCells`, `gridPoints` | Rectangular grid generation |
| `grid-advanced` | `hexGrid`, `triangleGrid`, `radialGrid` | Hexagonal, triangular, radial grids |
| `distribution` | `poissonDisk`, `stratified`, `jittered` | Point distribution strategies |
| `distribution-advanced` | `halton`, `sobol`, `bluenoise` | Quasi-random sequences |

### Particles & Physics

| Name | Exports | Description |
|------|---------|-------------|
| `particle` | `Particle`, `updateParticle`, … | Basic particle system |
| `particle-forces` | `gravity`, `drag`, `attract`, `repel` | Force accumulation |
| `physics-spring` | `Spring`, `springForce`, `dampedSpring` | Spring dynamics |
| `physics-verlet` | `VerletBody`, `integrate`, `constrain` | Verlet integration |
| `physics-rk4` | `rk4Step`, `rk4Orbit` | RK4 numerical integration |
| `boids` | `Boid`, `flock`, `separate`, `align`, `cohere` | Reynolds boids flocking |

### Data Structures

| Name | Exports | Description |
|------|---------|-------------|
| `quadtree` | `Quadtree`, `insert`, `query` | Spatial quadtree |
| `spatial-hash` | `SpatialHash`, `insert`, `query` | Grid-based spatial hashing |

### Algorithms

| Name | Exports | Description |
|------|---------|-------------|
| `flow-field` | `FlowField`, `sampleField`, `followField` | Flow field / vector field |
| `l-system` | `LSystem`, `expand`, `turtle` | L-system string rewriting |
| `reaction-diffusion` | `RDGrid`, `stepRD`, `grayscott` | Gray-Scott reaction-diffusion |
| `dla` | `DLA`, `addWalker`, `stepWalkers` | Diffusion-limited aggregation |

### Utility

| Name | Exports | Description |
|------|---------|-------------|
| `animation` | `lerp`, `tween`, `loopTime`, `pingPong` | Animation timing helpers |
| `canvas-utils` | `clearCanvas`, `saveRestore`, `withTransform` | Canvas state helpers |
| `turtle` | `Turtle`, `forward`, `turn`, `push`, `pop` | Turtle graphics |
| `svg-path` | `pathBuilder`, `moveTo`, `lineTo`, `bezier` | SVG path string builder |

## GLSL Components (18)

| Name | Description |
|------|-------------|
| `glsl-math` | `hash()`, `fract()`, `mod()`, `mix()` utilities |
| `glsl-noise` | 2D value noise, 2D/3D/4D simplex noise |
| `glsl-noise-3d` | Optimized 3D simplex (Ashima Arts) |
| `glsl-noise-4d` | 4D simplex noise |
| `glsl-color` | HSV↔RGB, hue rotate, luminance |
| `glsl-easing` | Cubic, quadratic, exponential easing in GLSL |
| `glsl-gradient` | Linear, radial, angular, conic gradients |
| `glsl-sdf` | 2D SDFs: circle, box, line, polygon, star, heart |
| `glsl-sdf-3d` | 3D SDFs: sphere, box, torus, capsule, cone |
| `glsl-shape` | Parametric shapes: rose, lissajous, superellipse |
| `glsl-domain` | Domain operations: repeat, mirror, twist, fold |
| `glsl-transform` | 2D/3D rotation, scale, translate matrices |
| `glsl-curl` | Curl noise from simplex gradient |
| `glsl-pattern` | Checkerboard, stripes, dots, hex grid, voronoi |
| `glsl-lighting` | Phong, Lambert, normal mapping |
| `glsl-ray` | Ray-sphere, ray-box, ray-plane intersection |
| `glsl-blend` | Photoshop-style blend modes (multiply, screen, overlay, …) |
| `glsl-post` | Post-processing: vignette, aberration, dither, tonemap |

## API Reference

### `COMPONENT_REGISTRY`

```typescript
import { COMPONENT_REGISTRY } from "@genart-dev/components";

const entry = COMPONENT_REGISTRY["noise-2d"];
entry.name;         // "noise-2d"
entry.version;      // SemVer string
entry.category;     // "noise"
entry.target;       // "js" | "glsl"
entry.renderers;    // compatible renderer types (empty = all of this target)
entry.exports;      // exported names injected into algorithm scope
entry.dependencies; // other component names required
entry.description;  // one-line description
entry.usage;        // markdown usage docs with examples
entry.code;         // raw source prepended at compile time
```

### `resolveComponents(names)`

```typescript
import { resolveComponents } from "@genart-dev/components";

// Topological sort with deduplication — safe to call with duplicates
const resolved = resolveComponents(["curl", "noise-2d", "prng"]);
// → [prng, noise2d, curl]  (in dependency order)
```

Throws if a requested component or any transitive dependency is not found in the registry.

### Types

| Type | Description |
|------|-------------|
| `ComponentEntry` | Full registry entry — name, version, category, target, exports, deps, code, docs |
| `ResolvedComponent` | Trimmed entry returned by `resolveComponents` — name, version, code, exports |
| `ComponentCategory` | Union of all category strings |
| `RendererTarget` | `"js" \| "glsl"` |

## Related Packages

| Package | Purpose |
|---------|---------|
| [`@genart-dev/format`](https://github.com/genart-dev/format) | File format types, parsers, presets (dependency) |
| [`@genart-dev/core`](https://github.com/genart-dev/core) | Renderer adapters + compiler — uses components at compile time |
| [`@genart-dev/mcp-server`](https://github.com/genart-dev/mcp-server) | MCP server — exposes `list_components` and `load_component` tools |

## Support

Questions, bugs, or feedback — [support@genart.dev](mailto:support@genart.dev) or [open an issue](https://github.com/genart-dev/components/issues).

## License

MIT
