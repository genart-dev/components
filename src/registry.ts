import type { ComponentEntry } from "./types.js";
import * as jsComponents from "./components/js/index.js";
import * as glslComponents from "./components/glsl/index.js";

/** The complete component registry, keyed by bare name. */
export const COMPONENT_REGISTRY: Readonly<Record<string, ComponentEntry>> =
  Object.fromEntries(
    [...Object.values(jsComponents), ...Object.values(glslComponents)]
      .map((c) => [c.name, c])
  );
