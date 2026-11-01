# tailwindcss-glow example

A minimal, build-tool-free demo of the plugin with Tailwind CSS v4.

## Run it

```bash
cd example
pnpm install
pnpm build       # builds out.css once (minified)
pnpm dev         # or rebuild on change
```

Then open `index.html` in a browser.

## How it works

- `input.css` loads Tailwind and the plugin CSS-first:

  ```css
  @import "tailwindcss";
  @plugin "tailwindcss-glow";
  ```

- `index.html` uses the generated utilities (`glow-blue-500`,
  `glow-blue-500-xl`, `glow-dynamic-md`, …) and links the compiled
  `out.css`.
- `@tailwindcss/cli` scans `index.html` automatically, so only the classes
  actually used end up in `out.css`.
