import { describe, it, expect } from "vitest";
import { resolveComponents } from "./resolver.js";

describe("resolveComponents", () => {
  it("resolves a single component with no dependencies", () => {
    const result = resolveComponents({ math: "^1.0.0" }, "p5");
    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe("math");
    expect(result[0]!.version).toBe("1.0.0");
    expect(result[0]!.code.length).toBeGreaterThan(0);
  });

  it("resolves transitive dependencies", () => {
    const result = resolveComponents({ "noise-2d": "^1.0.0" }, "canvas2d");
    const names = result.map((c) => c.name);
    expect(names).toContain("prng");
    expect(names).toContain("noise-2d");
    // prng must come before noise-2d
    expect(names.indexOf("prng")).toBeLessThan(names.indexOf("noise-2d"));
  });

  it("deduplicates shared dependencies", () => {
    const result = resolveComponents(
      { "noise-2d": "^1.0.0", distribution: "^1.0.0" },
      "p5"
    );
    const names = result.map((c) => c.name);
    const prngCount = names.filter((n) => n === "prng").length;
    expect(prngCount).toBe(1);
  });

  it("topologically sorts (dependencies before dependents)", () => {
    const result = resolveComponents({ curl: "^1.0.0" }, "three");
    const names = result.map((c) => c.name);
    // curl depends on noise-2d and noise-3d, which depend on prng
    expect(names.indexOf("prng")).toBeLessThan(names.indexOf("noise-2d"));
    expect(names.indexOf("prng")).toBeLessThan(names.indexOf("noise-3d"));
    expect(names.indexOf("noise-2d")).toBeLessThan(names.indexOf("curl"));
    expect(names.indexOf("noise-3d")).toBeLessThan(names.indexOf("curl"));
  });

  it("throws on unknown component", () => {
    expect(() =>
      resolveComponents({ "nonexistent-component": "^1.0.0" }, "p5")
    ).toThrow("Unknown component");
  });

  it("throws on renderer target mismatch (GLSL component with JS renderer)", () => {
    expect(() =>
      resolveComponents({ "glsl-noise": "^1.0.0" }, "p5")
    ).toThrow("target");
  });

  it("throws on renderer target mismatch (JS component with GLSL renderer)", () => {
    expect(() =>
      resolveComponents({ prng: "^1.0.0" }, "glsl")
    ).toThrow("target");
  });

  it("resolves GLSL components for GLSL renderer", () => {
    const result = resolveComponents({ "glsl-noise": "^1.0.0" }, "glsl");
    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe("glsl-noise");
  });

  it("resolves GLSL components with dependencies", () => {
    const result = resolveComponents({ "glsl-curl": "^1.0.0" }, "glsl");
    const names = result.map((c) => c.name);
    expect(names).toContain("glsl-noise");
    expect(names).toContain("glsl-curl");
    expect(names.indexOf("glsl-noise")).toBeLessThan(names.indexOf("glsl-curl"));
  });

  it("resolves multiple components and their deps", () => {
    const result = resolveComponents(
      { prng: "^1.0.0", math: "^1.0.0", easing: "^1.0.0" },
      "svg"
    );
    const names = result.map((c) => c.name);
    expect(names).toContain("prng");
    expect(names).toContain("math");
    expect(names).toContain("easing");
    expect(names.length).toBe(3);
  });

  it("includes deep transitive dependencies", () => {
    const result = resolveComponents({ "flow-field": "^1.0.0" }, "p5");
    const names = result.map((c) => c.name);
    // flow-field → noise-2d → prng, flow-field → vector
    expect(names).toContain("prng");
    expect(names).toContain("noise-2d");
    expect(names).toContain("vector");
    expect(names).toContain("flow-field");
  });

  it("returns ResolvedComponent with correct shape", () => {
    const result = resolveComponents({ prng: "^1.0.0" }, "p5");
    const c = result[0]!;
    expect(c).toHaveProperty("name");
    expect(c).toHaveProperty("version");
    expect(c).toHaveProperty("code");
    expect(c).toHaveProperty("exports");
    expect(Array.isArray(c.exports)).toBe(true);
    // Should NOT have extra fields from ComponentEntry
    expect(c).not.toHaveProperty("category");
    expect(c).not.toHaveProperty("target");
    expect(c).not.toHaveProperty("dependencies");
  });
});
