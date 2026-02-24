import type { RendererType } from "@genart-dev/format";
import type { ResolvedComponent } from "./types.js";
import { COMPONENT_REGISTRY } from "./registry.js";

/** Maps renderer types to their target ("js" or "glsl"). */
const RENDERER_TARGET: Record<RendererType, "js" | "glsl"> = {
  p5: "js",
  three: "js",
  canvas2d: "js",
  svg: "js",
  glsl: "glsl",
};

/**
 * Resolve component names to injection-ready source.
 * - Validates names exist in registry
 * - Validates renderer compatibility
 * - Resolves transitive dependencies
 * - Topological sort (dependencies before dependents)
 * - Deduplicates
 * - Detects export name collisions
 *
 * @throws on: unknown component, renderer mismatch, circular dep, export collision.
 */
export function resolveComponents(
  components: Record<string, string>,
  renderer: RendererType,
): ResolvedComponent[] {
  const target = RENDERER_TARGET[renderer];

  // Collect all required component names (including transitive deps)
  const allNames = new Set<string>();
  const stack = Object.keys(components);

  while (stack.length > 0) {
    const name = stack.pop()!;
    if (allNames.has(name)) continue;

    const entry = COMPONENT_REGISTRY[name];
    if (!entry) {
      throw new Error(`Unknown component: "${name}"`);
    }

    // Validate target compatibility
    if (entry.target !== target) {
      throw new Error(
        `Component "${name}" has target "${entry.target}" but renderer "${renderer}" requires target "${target}"`
      );
    }

    // Validate specific renderer compatibility (if restricted)
    if (entry.renderers.length > 0 && !entry.renderers.includes(renderer)) {
      throw new Error(
        `Component "${name}" is not compatible with renderer "${renderer}". Compatible: ${entry.renderers.join(", ")}`
      );
    }

    allNames.add(name);

    // Add transitive dependencies
    for (const dep of entry.dependencies) {
      if (!allNames.has(dep)) {
        stack.push(dep);
      }
    }
  }

  // Detect circular dependencies and topologically sort
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string): void {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected involving component "${name}"`);
    }

    visiting.add(name);
    const entry = COMPONENT_REGISTRY[name]!;
    for (const dep of entry.dependencies) {
      if (allNames.has(dep)) {
        visit(dep);
      }
    }
    visiting.delete(name);
    visited.add(name);
    sorted.push(name);
  }

  for (const name of allNames) {
    visit(name);
  }

  // Check for export name collisions
  const exportNames = new Map<string, string>();
  for (const name of sorted) {
    const entry = COMPONENT_REGISTRY[name]!;
    for (const exp of entry.exports) {
      const existing = exportNames.get(exp);
      if (existing) {
        throw new Error(
          `Export collision: "${exp}" is exported by both "${existing}" and "${name}"`
        );
      }
      exportNames.set(exp, name);
    }
  }

  // Build resolved components
  return sorted.map((name): ResolvedComponent => {
    const entry = COMPONENT_REGISTRY[name]!;
    return {
      name: entry.name,
      version: entry.version,
      code: entry.code,
      exports: entry.exports,
    };
  });
}
