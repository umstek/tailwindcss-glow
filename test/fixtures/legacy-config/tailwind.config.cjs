const glow = require("tailwindcss-glow");

module.exports = {
  theme: {
    glow: {
      colors: {
        brand: "#3b82f6",
        deep: {
          700: "#1d4ed8",
        },
      },
      styles: {
        default: (color) => `0 0 20px ${color}`,
        ring: (color) => `0 0 0 6px ${color}`,
        none: "none",
      },
    },
  },
  plugins: [glow()],
};
