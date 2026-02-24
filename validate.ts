import { COMPONENT_REGISTRY } from "./src/registry.js";

let errors = 0;

function fail(msg: string): void {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function pass(msg: string): void {
  console.log(`  OK: ${msg}`);
}

console.log("Validating component registry...\n");

const entries = Object.values(COMPONENT_REGISTRY);
console.log(`Found ${entries.length} components (expected 55)`);
if (entries.length !== 55) fail(`Expected 55 components, got ${entries.length}`);
else pass("Component count");

// Check names match keys
for (const [key, entry] of Object.entries(COMPONENT_REGISTRY)) {
  if (key !== entry.name) fail(`Key "${key}" doesn't match name "${entry.name}"`);
}
pass("Keys match names");

// Check for duplicate names
const names = entries.map((c) => c.name);
if (new Set(names).size !== names.length) fail("Duplicate component names found");
else pass("No duplicate names");

// Check versions
for (const entry of entries) {
  if (!/^\d+\.\d+\.\d+$/.test(entry.version)) {
    fail(`Invalid version "${entry.version}" on "${entry.name}"`);
  }
}
pass("Valid versions");

// Check non-empty fields
for (const entry of entries) {
  if (!entry.code.trim()) fail(`Empty code on "${entry.name}"`);
  if (!entry.exports.length) fail(`Empty exports on "${entry.name}"`);
  if (!entry.description.trim()) fail(`Empty description on "${entry.name}"`);
}
pass("Non-empty fields");

// Check dependencies exist
for (const entry of entries) {
  for (const dep of entry.dependencies) {
    if (!COMPONENT_REGISTRY[dep]) {
      fail(`"${entry.name}" depends on unknown component "${dep}"`);
    }
  }
}
pass("All dependencies exist");

// Check for circular dependencies
const visited = new Set<string>();
const visiting = new Set<string>();

function detectCycle(name: string): boolean {
  if (visited.has(name)) return false;
  if (visiting.has(name)) return true;
  visiting.add(name);
  const entry = COMPONENT_REGISTRY[name];
  if (entry) {
    for (const dep of entry.dependencies) {
      if (detectCycle(dep)) {
        fail(`Circular dependency: ${name} → ${dep}`);
        return true;
      }
    }
  }
  visiting.delete(name);
  visited.add(name);
  return false;
}

for (const name of Object.keys(COMPONENT_REGISTRY)) {
  detectCycle(name);
}
pass("No circular dependencies");

// Check export collisions within same target
const jsExports = new Map<string, string>();
const glslExports = new Map<string, string>();

for (const entry of entries) {
  const map = entry.target === "js" ? jsExports : glslExports;
  for (const exp of entry.exports) {
    const existing = map.get(exp);
    if (existing) {
      fail(`Export collision: "${exp}" in both "${existing}" and "${entry.name}"`);
    }
    map.set(exp, entry.name);
  }
}
pass("No export collisions within target");

// JS component code parse check
const jsComponents = entries.filter((c) => c.target === "js");
let jsParseFails = 0;
for (const entry of jsComponents) {
  try {
    new Function(entry.code);
  } catch (e) {
    fail(`JS parse error in "${entry.name}": ${e}`);
    jsParseFails++;
  }
}
if (jsParseFails === 0) pass(`All ${jsComponents.length} JS components parse successfully`);

// JS export presence check
for (const entry of jsComponents) {
  for (const exp of entry.exports) {
    const hasDecl =
      entry.code.includes(`function ${exp}`) ||
      entry.code.includes(`var ${exp}`) ||
      entry.code.includes(`const ${exp}`) ||
      entry.code.includes(`let ${exp}`);
    if (!hasDecl) {
      fail(`Export "${exp}" not found in code of "${entry.name}"`);
    }
  }
}
pass("All JS exports present in code");

// GLSL export presence check
const glslComponents = entries.filter((c) => c.target === "glsl");
for (const entry of glslComponents) {
  for (const exp of entry.exports) {
    const pattern = new RegExp(
      `\\b(?:float|vec[234]|mat[234]|int|void|sampler2D)\\s+${exp}\\s*\\(`
    );
    if (!pattern.test(entry.code)) {
      fail(`Export "${exp}" not found in GLSL code of "${entry.name}"`);
    }
  }
}
pass("All GLSL exports present in code");

console.log(`\n${errors === 0 ? "✓ All checks passed!" : `✗ ${errors} error(s) found.`}`);
process.exit(errors > 0 ? 1 : 0);
