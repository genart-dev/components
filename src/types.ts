import type { RendererType } from "@genart-dev/format";

/** Target renderers for a component. */
export type RendererTarget = "js" | "glsl";

/** Categories for browsing/filtering components. */
export type ComponentCategory =
  | "randomness"
  | "noise"
  | "math"
  | "easing"
  | "color"
  | "vector"
  | "geometry"
  | "grid"
  | "particle"
  | "physics"
  | "distribution"
  | "pattern"
  | "sdf"
  | "transform"
  | "animation"
  | "string"
  | "data-structure"
  | "imaging";

/**
 * A single component entry in the registry.
 * The `code` field is the raw source string prepended to algorithms.
 */
export interface ComponentEntry {
  /** Bare component name (e.g., "prng", "glsl-noise"). */
  readonly name: string;
  /** SemVer version. */
  readonly version: string;
  /** Browsing category. */
  readonly category: ComponentCategory;
  /** "js" for all JS renderers, "glsl" for the GLSL renderer. */
  readonly target: RendererTarget;
  /** Compatible renderer types. Empty array = all renderers of this target. */
  readonly renderers: readonly RendererType[];
  /** Source code string — prepended to the algorithm at compile time. */
  readonly code: string;
  /** Function/variable names this component exports. */
  readonly exports: readonly string[];
  /** Other component names this depends on (bare names). */
  readonly dependencies: readonly string[];
  /** One-line description (shown by list_components MCP tool). */
  readonly description: string;
  /** Multi-line usage docs with examples (markdown). */
  readonly usage: string;
}

/**
 * Resolved component ready for compilation injection.
 * Returned by resolveComponents() — topologically sorted, deduplicated.
 */
export interface ResolvedComponent {
  readonly name: string;
  readonly version: string;
  readonly code: string;
  readonly exports: readonly string[];
}
