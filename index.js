"use strict";

const plugin = require("tailwindcss/plugin");
const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette");

/**
 * Characters that must be escaped in a CSS class selector. Mirrors what the
 * built-in Tailwind v2 escaper (`e()`) did, since the v4 plugin API no longer
 * exposes one.
 */
const CSS_CLASS_ESCAPES = /[\\/.()[\]{}#%!?*+,<>=@;~&$'^"|:]/g;

/**
 * Escape a utility name fragment for safe use inside a CSS class selector.
 *
 * @param {string} name
 * @returns {string}
 */
function escapeClassName(name) {
  return name.replace(CSS_CLASS_ESCAPES, "\\$&");
}

/**
 * Build a class name from a prefix and a (possibly negative) modifier,
 * preserving the naming scheme of the original v2 plugin.
 *
 * @param {string} prefix
 * @param {string} modifier
 * @returns {string}
 */
function utilityClassName(prefix, modifier) {
  const negative = modifier.startsWith("-");
  const name = negative ? `${prefix}-${modifier.slice(1)}` : `${prefix}-${modifier}`;
  return escapeClassName(name);
}

/**
 * Wrap a color and an alpha percentage into a CSS `color-mix()` call.
 *
 * This is the modern replacement for the v2-era `rgba(${baseColor}, a)`
 * interpolation: `color-mix(in srgb, C 40%, transparent)` is exactly `C` at
 * 40% alpha (premultiplied alpha in sRGB) and, unlike the old approach, it
 * works with any CSS color syntax (`oklch()`, `hsl()`, CSS variables,
 * `currentColor`, …) without build-time color parsing.
 *
 * @param {string} color
 * @param {number} alpha - Between 0 and 100.
 * @returns {string}
 */
function tint(color, alpha) {
  return `color-mix(in srgb, ${color} ${alpha}%, transparent)`;
}

/**
 * Default glow styles. Each function receives the (raw CSS) color value and
 * returns a `box-shadow` value. The offsets mirror Tailwind's default shadow
 * scale; the alphas mirror the original plugin's bumped-up alphas.
 *
 * @type {Record<string, string | ((color: string) => string)>}
 */
const defaultStyles = {
  default: (color) => `0 1px 3px 0 ${tint(color, 40)}, 0 1px 2px 0 ${tint(color, 24)}`,
  md: (color) => `0 4px 6px -1px ${tint(color, 40)}, 0 2px 4px -1px ${tint(color, 24)}`,
  lg: (color) => `0 10px 15px -3px ${tint(color, 40)}, 0 4px 6px -2px ${tint(color, 20)}`,
  xl: (color) => `0 20px 25px -5px ${tint(color, 40)}, 0 10px 10px -5px ${tint(color, 16)}`,
  "2xl": (color) => `0 25px 50px -12px ${color}`,
  outline: (color) => `0 0 0 3px ${tint(color, 50)}`,
  none: "none",
};

const dynamicGlowBase = {
  position: "relative",
  zIndex: 1,
  "&::after": {
    content: "''",
    position: "absolute",
    background: "inherit",
    zIndex: -1,
  },
};

const dynamicGlow = {
  ...dynamicGlowBase,
  "&::after": {
    ...dynamicGlowBase["&::after"],
    width: "99%",
    height: "98%",
    top: "2px",
    left: "0.4%",
    filter: "blur(2px)",
    opacity: 1,
  },
};

const dynamicGlowMd = {
  ...dynamicGlowBase,
  "&::after": {
    ...dynamicGlowBase["&::after"],
    width: "99%",
    height: "98%",
    top: "4px",
    left: "0.5%",
    filter: "blur(3px)",
    opacity: 0.7,
  },
};

const dynamicGlowLg = {
  ...dynamicGlowBase,
  "&::after": {
    ...dynamicGlowBase["&::after"],
    width: "98%",
    height: "98%",
    top: "calc(4px + 2%)",
    left: "1%",
    filter: "blur(8px)",
    opacity: 0.7,
  },
};

const dynamicGlowXl = {
  ...dynamicGlowBase,
  "&::after": {
    ...dynamicGlowBase["&::after"],
    width: "98%",
    height: "96%",
    top: "calc(12px + 4%)",
    left: "1%",
    filter: "blur(12px)",
    opacity: 0.53,
  },
};

const dynamicGlow2Xl = {
  ...dynamicGlowBase,
  "&::after": {
    ...dynamicGlowBase["&::after"],
    width: "94%",
    height: "94%",
    top: "calc(20px + 4%)",
    left: "3%",
    filter: "blur(22px)",
    opacity: 0.84,
  },
};

const dynamicGlowUtilities = {
  ".glow-dynamic": dynamicGlow,
  ".glow-dynamic-md": dynamicGlowMd,
  ".glow-dynamic-lg": dynamicGlowLg,
  ".glow-dynamic-xl": dynamicGlowXl,
  ".glow-dynamic-2xl": dynamicGlow2Xl,
};

/**
 * Build the color-driven glow utilities (`.glow-{color}` and
 * `.glow-{color}-{style}`).
 *
 * @param {Record<string, string>} colors - Flattened color palette.
 * @param {Record<string, string | ((color: string) => string)>} styles
 * @returns {Record<string, { "box-shadow": string }>}
 */
function buildColorGlowUtilities(colors, styles) {
  const utilities = {};

  for (const [colorName, colorValue] of Object.entries(colors)) {
    if (typeof colorValue !== "string") continue;

    for (const [modifier, style] of Object.entries(styles)) {
      if (typeof style !== "function") continue;

      const className =
        modifier === "default"
          ? escapeClassName(`glow-${colorName}`)
          : utilityClassName("glow", `${colorName}-${modifier}`);

      utilities[`.${className}`] = { "box-shadow": style(colorValue) };
    }
  }

  return utilities;
}

/**
 * Build the static glow utilities (`.glow` and `.glow-{style}`) for styles
 * that are plain strings rather than color-dependent functions.
 *
 * @param {Record<string, string | ((color: string) => string)>} styles
 * @returns {Record<string, { "box-shadow": string }>}
 */
function buildStaticGlowUtilities(styles) {
  const utilities = {};

  for (const [modifier, style] of Object.entries(styles)) {
    if (typeof style === "function") continue;

    const className = modifier === "default" ? "glow" : utilityClassName("glow", modifier);

    utilities[`.${className}`] = { "box-shadow": style };
  }

  return utilities;
}

/**
 * The tailwindcss-glow plugin.
 *
 * Options (via `@plugin "tailwindcss-glow" { … }` for flat values, or via a
 * legacy `@config` JS file for full JS options):
 *
 * - `colors`: color palette to generate glow utilities for. Defaults to all
 *   theme colors (`theme("colors")`), or `theme("glow.colors")` when set.
 * - `styles`: glow style map. Function values receive the color value;
 *   string values are used verbatim. Defaults to `theme("glow.styles")` or
 *   the built-in `default`/`md`/`lg`/`xl`/`2xl`/`outline`/`none` styles.
 *
 * @type {import("tailwindcss/plugin").PluginWithOptions<
 *   { colors?: Record<string, string>, styles?: Record<string, string | ((color: string) => string)> }
 * >}
 */
module.exports = plugin.withOptions((options = {}) => {
  return ({ addUtilities, theme }) => {
    const colors = flattenColorPalette(
      options.colors ?? theme("glow.colors") ?? theme("colors") ?? {},
    );
    const styles = options.styles ?? theme("glow.styles") ?? defaultStyles;

    addUtilities(buildColorGlowUtilities(colors, styles));
    addUtilities(buildStaticGlowUtilities(styles));
    addUtilities(dynamicGlowUtilities);
  };
});
