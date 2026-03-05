import { describe, it, expect } from "vitest";
import { COMPONENT_REGISTRY } from "./registry.js";

describe("COMPONENT_REGISTRY", () => {
  const entries = Object.values(COMPONENT_REGISTRY);

  it("has 73 components", () => {
    expect(entries.length).toBe(73);
  });

  it("has no duplicate names", () => {
    const names = entries.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keys match component names", () => {
    for (const [key, entry] of Object.entries(COMPONENT_REGISTRY)) {
      expect(key).toBe(entry.name);
    }
  });

  it("all components have valid versions", () => {
    for (const entry of entries) {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it("all components have non-empty code", () => {
    for (const entry of entries) {
      expect(entry.code.trim().length).toBeGreaterThan(0);
    }
  });

  it("all components have non-empty exports", () => {
    for (const entry of entries) {
      expect(entry.exports.length).toBeGreaterThan(0);
    }
  });

  it("all components have non-empty description", () => {
    for (const entry of entries) {
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("all components have non-empty usage", () => {
    for (const entry of entries) {
      expect(entry.usage.trim().length).toBeGreaterThan(0);
    }
  });

  it("all components have valid target", () => {
    for (const entry of entries) {
      expect(["js", "glsl"]).toContain(entry.target);
    }
  });

  it("all declared dependencies exist in the registry", () => {
    for (const entry of entries) {
      for (const dep of entry.dependencies) {
        expect(
          COMPONENT_REGISTRY[dep],
          `Component "${entry.name}" depends on "${dep}" which doesn't exist`
        ).toBeDefined();
      }
    }
  });

  it("no circular dependencies", () => {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(name: string): void {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving "${name}"`);
      }
      visiting.add(name);
      const entry = COMPONENT_REGISTRY[name];
      if (entry) {
        for (const dep of entry.dependencies) {
          visit(dep);
        }
      }
      visiting.delete(name);
      visited.add(name);
    }

    for (const name of Object.keys(COMPONENT_REGISTRY)) {
      visit(name);
    }
  });

  it("no export collisions within same target", () => {
    const jsExports = new Map<string, string>();
    const glslExports = new Map<string, string>();

    for (const entry of entries) {
      const map = entry.target === "js" ? jsExports : glslExports;
      for (const exp of entry.exports) {
        const existing = map.get(exp);
        if (existing) {
          throw new Error(
            `Export collision: "${exp}" exported by both "${existing}" and "${entry.name}"`
          );
        }
        map.set(exp, entry.name);
      }
    }
  });

  it("has 55 JS components and 18 GLSL components", () => {
    const js = entries.filter((c) => c.target === "js");
    const glsl = entries.filter((c) => c.target === "glsl");
    expect(js.length).toBe(55);
    expect(glsl.length).toBe(18);
  });

  it("dependency targets are consistent (deps must match component target)", () => {
    for (const entry of entries) {
      for (const dep of entry.dependencies) {
        const depEntry = COMPONENT_REGISTRY[dep];
        if (depEntry) {
          expect(
            depEntry.target,
            `Component "${entry.name}" (target: ${entry.target}) depends on "${dep}" (target: ${depEntry.target})`
          ).toBe(entry.target);
        }
      }
    }
  });
});
