import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// @tailwindcss/cli only exposes a bin (no "." export); resolve it through
// its package root.
const cliPath = join(
  dirname(require.resolve("@tailwindcss/cli/package.json")),
  "dist",
  "index.mjs",
);

/**
 * Create a throwaway build directory that looks like a real consumer
 * project: the plugin is installed under `node_modules/tailwindcss-glow`
 * (so fixtures can use the package-name `@plugin "tailwindcss-glow"`) and
 * `tailwindcss` is linked in from the repo for `@import "tailwindcss"`.
 *
 * @param {Record<string, string>} [files] - Map of relative path -> content.
 * @returns {Promise<string>} The directory path.
 */
export async function createBuildDir(files = {}) {
  const dir = await mkdtemp(join(tmpdir(), "twglow-"));
  const nodeModules = join(dir, "node_modules");
  const pkgDir = join(nodeModules, "tailwindcss-glow");
  await mkdir(pkgDir, { recursive: true });
  await cp(join(repoRoot, "index.js"), join(pkgDir, "index.js"));
  await cp(join(repoRoot, "index.mjs"), join(pkgDir, "index.mjs"));
  await cp(join(repoRoot, "package.json"), join(pkgDir, "package.json"));
  // Junctions work on Windows without elevated privileges.
  await symlink(
    await realpath(join(repoRoot, "node_modules", "tailwindcss")),
    join(nodeModules, "tailwindcss"),
    "junction",
  );
  for (const [path, content] of Object.entries(files)) {
    const target = join(dir, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return dir;
}

/**
 * Run a real Tailwind v4 build with @tailwindcss/cli.
 *
 * @param {string} dir - Build directory (from createBuildDir).
 * @param {{ css?: string, html?: string }} [names] - File names inside dir.
 * @returns {Promise<string>} The emitted CSS.
 */
export async function buildCss(dir, { css = "input.css", html = "index.html" } = {}) {
  const output = join(dir, "out.css");
  await execFileAsync(
    process.execPath,
    [cliPath, "--input", join(dir, css), "--output", output, "--content", join(dir, html)],
    { cwd: dir, timeout: 60_000 },
  );
  return readFile(output, "utf8");
}

/**
 * Remove a build directory.
 *
 * @param {string} dir
 */
export async function cleanup(dir) {
  await rm(dir, { recursive: true, force: true });
}
