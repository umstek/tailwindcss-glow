# Colored/Dynamic Shadow/Glow Plugin for TailwindCSS

The default shadow plugin for TailwindCSS doesn't support colored shadows, which is a trend now. Also, the default
outline shadow is a light blue -- which doesn't match when colors other than blue are used for the background color
of the element to which the shadow is applied. This can be customized, of course, but it is still overwhelming to get colored shadows for, e.g.: 10 colors.  
WARNING: **This generates a lot of styles, so it is recommended that you choose only the colors that are necessary,
and/or use `purgecss`.**

## Installation

### With `npm`

```bash
npm i tailwindcss-glow
```

### With `yarn`

```bash
yarn add tailwindcss-glow
```

## Usage

```js
// tailwind.config.js
module.exports = {
  theme: {
    glow: {
      colors: { // Defaults to all theme colors
        // ...
      },
      styles: { // Defaults to these values
        default: baseColor =>
          `0 1px 3px 0 rgba(${baseColor}, 0.4), 0 1px 2px 0 rgba(${baseColor}, 0.24)`,
        md: baseColor =>
          `0 4px 6px -1px rgba(${baseColor}, 0.4), 0 2px 4px -1px rgba(${baseColor}, 0.24)`,
        lg: baseColor =>
          `0 10px 15px -3px rgba(${baseColor}, 0.4), 0 4px 6px -2px rgba(${baseColor}, 0.20)`,
        xl: baseColor =>
          `0 20px 25px -5px rgba(${baseColor}, 0.4), 0 10px 10px -5px rgba(${baseColor}, 0.16)`,
        "2xl": baseColor => `0 25px 50px -12px rgba(${baseColor}, 1)`,
        outline: baseColor => `0 0 0 3px rgba(${baseColor}, 0.5)`,
        none: "none"
      }
    }
    // ...
  },
  plugins: [
    // ...
    require("tailwindcss-glow")(),
    // ...
};
```

This plugin generates the following utilities:

```css
.glow-blue-100 {
  /* For each color (blue-100 here), for the `default` style */
  box-shadow: 0 1px 3px 0 rgba(235, 248, 255, 0.4), 0 1px 2px 0 rgba(235, 248, 255, 0.24);
}

.glow-blue-100-md {
  /* For each color (blue-100 here), for each sizes (styles) from `md`, `lg`, `xl` and `2xl`. */
  box-shadow: 0 4px 6px -1px rgba(235, 248, 255, 0.4), 0 2px 4px -1px rgba(235, 248, 255, 0.24);
}

/* ... */

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

.glow-dynamic-md {
  position: relative;
  z-index: 1;
}

.glow-dynamic-md::after {
  content: "";
  position: absolute;
  background: inherit;
  z-index: -1;
  width: 99%;
  height: 98%;
  top: 4px;
  left: 0.5%;
  filter: blur(3px);
  opacity: 0.7;
}

/* ...*/

/* 
 * Dynamic glow styles cannot be extended, as of now. The built-in styles are, `default`, `md`, `lg`, `xl` and `2xl`. 
 * These have been designed to be visually similar as much as possible to their box-shadow counterparts, 
 * when used with a single color background.
 */
```

## Customization

Since the theme colors might include a lot of unnecessary colors, it is recommended to limit the color palette to
your selected accent color(s).
Since the configuration file is JavaScript, you can filter out some of the theme colors.

```js
glow: theme => ({
  colors: {
    blue: theme("colors.blue"),
    pink: theme("colors.pink.100")
  },
  styles: {
    // ...
  }
});
```

The default glow styles are the same as TailwindCSS's default shadows, but with an increase in alpha channel.
You can customize them just like you can customize TailwindCSS shadows with one key difference:  
In this plugin, we have to support multiple colors, so the R, G, B part of the color is changing.
So, instead of an style string, in this plugin you have to use a function in the format (e.g.):

```js
 md: baseColor => `0 4px 6px -1px rgba(${baseColor}, 0.4), 0 2px 4px -1px rgba(${baseColor}, 0.24)`,
 // ...
```

where the `baseColor` will be a comma-separated list of R, G and B values of that color, in that order, as a string. We have used string interpolation here.  
e.g.: For `baseColor` == `rgb(235, 248, 255)`,

```css
0 4px 6px -1px rgba(235, 248, 255, 0.4), 0 2px 4px -1px rgba(235, 248, 255, 0.24);
```

will be generated. Your theme colors can be in any format, `#000000` or `hsl` or otherwise; these will be converted. _This implementation is subject to change in a future version._

Dynamic glows cannot be customized currently, as they are _hand-picked_ to be visually similar to the default styles, and thus do not show a sane way to customize.
