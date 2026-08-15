import { afterAll, describe, expect, test } from "vitest";
import { cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCss, createBuildDir, cleanup } from "./build.js";

const fixturesDir = dirname(fileURLToPath(import.meta.url));

/** @type {string[]} */
const dirs = [];
afterAll(async () => {
  await Promise.all(dirs.map((dir) => cleanup(dir)));
});

/**
 * Build one of the committed fixtures with a real Tailwind v4 CLI build.
 *
 * @param {string} name - Fixture directory name under `test/fixtures`.
 * @returns {Promise<string>} The emitted CSS.
 */
async function buildFixture(name) {
  const dir = await createBuildDir();
  dirs.push(dir);
  const fixtureDir = join(fixturesDir, "fixtures", name);
  for (const file of ["input.css", "index.html", "tailwind.config.cjs"]) {
    await cp(join(fixtureDir, file), join(dir, file), { force: false }).catch(() => {
      // optional fixture file
    });
  }
  return buildCss(dir);
}

describe("CSS-first usage (@plugin, default palette)", () => {
  test("generates glow utilities for used classes only", async () => {
    const css = await buildFixture("css-first");

    // .glow-blue-500 with the default style and the v4 blue-500 palette color
    expect(css).toContain(".glow-blue-500");
    expect(css).toContain(
      "box-shadow: 0 1px 3px 0 color-mix(in srgb, oklch(62.3% 0.214 259.815) 40%, transparent), 0 1px 2px 0 color-mix(in srgb, oklch(62.3% 0.214 259.815) 24%, transparent)",
    );

    // Named styles keep the .glow-{color}-{style} naming
    expect(css).toContain(".glow-blue-500-md");
    expect(css).toContain(".glow-blue-500-2xl");
    expect(css).toMatch(/\.glow-blue-500-2xl[^}]*box-shadow: 0 25px 50px -12px oklch\(/);

    // Static styles
    expect(css).toMatch(/\.glow-none[^}]*box-shadow: none/);

    // Variants apply to plugin utilities
    expect(css).toContain(".hover\\:glow-red-500-lg:hover");

    // Dynamic glow utilities
    expect(css).toMatch(/\.glow-dynamic[^{]*{[^}]*position: relative/s);
    expect(css).toMatch(/\.glow-dynamic-md[^{]*{[^}]*position: relative/s);
    expect(css).toContain("filter: blur(2px)");
    expect(css).toContain("filter: blur(3px)");

    // Tree-shaking: unused colors/styles must not be emitted
    expect(css).not.toContain("glow-pink");
    expect(css).not.toContain("glow-blue-100");
    expect(css).not.toContain("glow-blue-500-outline");
    expect(css).not.toContain("glow-dynamic-xl");
  });
});

describe("CSS-first customization", () => {
  test("generates utilities for colors defined in @theme", async () => {
    const css = await buildFixture("theme-color");

    expect(css).toContain(".glow-accent-md");
    expect(css).toContain("color-mix(in srgb, #6d28d9 40%, transparent)");
    expect(css).not.toContain(".glow-blue-500");
  });
});

describe("legacy @config usage (JS options)", () => {
  test("supports custom colors, nested colors, and function styles", async () => {
    const css = await buildFixture("legacy-config");

    expect(css).toMatch(/\.glow-brand[^}]*box-shadow: 0 0 20px #3b82f6/);
    expect(css).toMatch(/\.glow-deep-700-ring[^}]*box-shadow: 0 0 0 6px #1d4ed8/);
    expect(css).toMatch(/\.glow-none[^}]*box-shadow: none/);
    // Default styles were replaced: no built-in md/lg/... utilities
    expect(css).not.toContain(".glow-brand-md");
  });
});

describe("package entry points", () => {
  test("ESM wrapper exposes the plugin as the default export", async () => {
    const glow = await import("../index.mjs");
    expect(typeof glow.default).toBe("function");
    expect(glow.default.__isOptionsFunction).toBe(true);
  });

  test("CJS entry is the plugin itself", async () => {
    const glow = await import("../index.js");
    expect(typeof glow.default).toBe("function");
  });
});
