# Colored/Dynamic Shadow/Glow Plugin for TailwindCSS

_NOTE_: This version targets **Tailwind CSS v4**. For the Tailwind 1.x plugin see
[v0.3.10](https://github.com/umstek/tailwindcss-glow/releases/tag/v0.3.10); the last
v2-era release is
[v2.0.0-beta.1](https://github.com/umstek/tailwindcss-glow/tree/v2.0.0-beta.1).

The default shadow utilities for TailwindCSS use a fixed color per shadow. This plugin
generates colored glow (`box-shadow`) utilities for your whole color palette, plus
"dynamic" glows that follow the element's own background.

## Installation

```bash
npm i tailwindcss-glow
# or
pnpm add tailwindcss-glow
```

Requires `tailwindcss >= 4`. Unlike earlier versions, the plugin no longer pulls in
Tailwind or any color-parsing dependency at runtime — Tailwind is a peer dependency.

## Usage (Tailwind v4, CSS-first)

Add the plugin in your main CSS file:

```css
@import "tailwindcss";
@plugin "tailwindcss-glow";
```

Optionally limit the generated colors or replace the styles via a small JS config
(see below), or just use it as-is — Tailwind v4 tree-shakes, so only utilities you
actually use end up in your CSS.

This plugin generates the following utilities:

```css
.glow-blue-500 {
  /* For each theme color (blue-500 here), the default style */
  box-shadow:
    0 1px 3px 0 color-mix(in srgb, oklch(62.3% 0.214 259.815) 40%, transparent),
    0 1px 2px 0 color-mix(in srgb, oklch(62.3% 0.214 259.815) 24%, transparent);
}

.glow-blue-500-md {
  /* For each color, for each style: md, lg, xl, 2xl, outline */
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, oklch(62.3% 0.214 259.815) 40%, transparent),
    0 2px 4px -1px color-mix(in srgb, oklch(62.3% 0.214 259.815) 24%, transparent);
}

.glow-none {
  box-shadow: none;
}

/* Variants work as usual, e.g. hover:glow-red-500-lg */

.glow-dynamic {
  position: relative;
  z-index: 1;
}

.glow-dynamic::after {
  content: "";
  position: absolute;
  background: inherit;
  z-index: -1;
  width: 99%;
  height: 98%;
  top: 2px;
  left: 0.4%;
  filter: blur(2px);
  opacity: 1;
}

/* Same for glow-dynamic-md, glow-dynamic-lg, glow-dynamic-xl and glow-dynamic-2xl */
```

Dynamic glow styles cannot be extended, as of now. The built-in styles are `default`,
`md`, `lg`, `xl`, `2xl` and `outline`. They have been designed to be visually similar,
as much as possible, to their box-shadow counterparts when used with a single-color
background.

## How colors are handled

Style functions receive the raw CSS value of the color (any syntax: `oklch()`, `#hex`,
`hsl()`, a CSS variable, `currentColor`, …) and the plugin composes the final shadow
with `color-mix(in srgb, <color> <alpha>%, transparent)` — i.e. the color at the given
alpha. Because this happens in the browser, no color parsing or conversion is done at
build time and every color syntax just works.

## Customization

Custom colors defined in your theme are picked up automatically:

```css
@import "tailwindcss";
@plugin "tailwindcss-glow";

@theme {
  --color-accent: #6d28d9;
}
```

```html
<div class="glow-accent-md">…</div>
```

To limit the palette or replace the styles, pass options through a JS config file:

```css
@import "tailwindcss";
@config "./tailwind.config.cjs";
```

```js
// tailwind.config.cjs
const glow = require("tailwindcss-glow");

module.exports = {
  theme: {
    glow: {
      colors: {
        // Defaults to all theme colors
        blue: "#3b82f6",
        pink: "#fdf2f8",
      },
      styles: {
        // Defaults to these values; the `default` style has no size suffix
        default: (color) => `0 1px 3px 0 color-mix(in srgb, ${color} 40%, transparent)`,
        md: (color) => `0 4px 6px -1px color-mix(in srgb, ${color} 40%, transparent)`,
        // ...
        none: "none", // string styles are emitted verbatim
      },
    },
  },
  plugins: [glow()],
};
```

Options can also be passed directly when invoking the plugin (`glow({ colors, styles })`).
In the style functions, `color` is the color's CSS value; use
`color-mix(in srgb, ${color} <alpha>%, transparent)` where the v2 plugin used
`rgba(${baseColor}, <alpha>)`.

## Migration from v2 (Tailwind 2.x)

- Load the plugin with `@plugin "tailwindcss-glow";` in CSS instead of listing it in
  `tailwind.config.js` `plugins: []`. (A `@config` file also works, as shown above.)
- The generated class names are unchanged: `glow-{color}`, `glow-{color}-{style}`,
  `glow-none`, and the `glow-dynamic*` family.
- Style functions now receive the full CSS color value instead of an `"r, g, b"`
  string; compose alphas with `color-mix()`.
- Unused utilities are no longer emitted (Tailwind v4 content scanning), so the old
  warning about limiting colors mostly goes away.

## Development

```bash
pnpm install
pnpm test        # vitest integration tests build fixtures with @tailwindcss/cli
pnpm lint        # oxlint
pnpm run format  # oxfmt
```

The `example/` directory contains a small static demo (run `pnpm build` inside it,
then open `index.html`).
