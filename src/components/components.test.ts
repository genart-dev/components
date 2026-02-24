import { describe, it, expect } from "vitest";
import { COMPONENT_REGISTRY } from "../registry.js";

describe("JS component code validation", () => {
  const jsComponents = Object.values(COMPONENT_REGISTRY).filter(
    (c) => c.target === "js"
  );

  for (const component of jsComponents) {
    describe(component.name, () => {
      it("code parses as valid JavaScript", () => {
        // Wrap in IIFE to avoid top-level return issues
        expect(() => new Function(component.code)).not.toThrow();
      });

      it("declared exports appear in code", () => {
        for (const exp of component.exports) {
          // Check for function or var/const/let declaration
          const hasDecl =
            component.code.includes(`function ${exp}`) ||
            component.code.includes(`var ${exp}`) ||
            component.code.includes(`const ${exp}`) ||
            component.code.includes(`let ${exp}`);
          expect(
            hasDecl,
            `Export "${exp}" not found in code of "${component.name}"`
          ).toBe(true);
        }
      });
    });
  }
});

describe("GLSL component code validation", () => {
  const glslComponents = Object.values(COMPONENT_REGISTRY).filter(
    (c) => c.target === "glsl"
  );

  for (const component of glslComponents) {
    describe(component.name, () => {
      it("code is non-empty and contains GLSL-like syntax", () => {
        expect(component.code.trim().length).toBeGreaterThan(0);
        // Should contain at least one function-like pattern or type declaration
        const hasGlsl =
          /\b(float|vec[234]|mat[234]|int|void|sampler2D)\b/.test(
            component.code
          );
        expect(
          hasGlsl,
          `Component "${component.name}" doesn't appear to contain GLSL code`
        ).toBe(true);
      });

      it("declared exports appear in code", () => {
        for (const exp of component.exports) {
          // GLSL functions: "type name("
          const pattern = new RegExp(
            `\\b(?:float|vec[234]|mat[234]|int|void|sampler2D)\\s+${exp}\\s*\\(`
          );
          expect(
            pattern.test(component.code),
            `Export "${exp}" not found in code of "${component.name}"`
          ).toBe(true);
        }
      });
    });
  }
});
