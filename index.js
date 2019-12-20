const _ = require("lodash");
const colorString = require("color-string");
const convert = require("color-convert");

const prefixNegativeModifiers = require("tailwindcss/lib/util/prefixNegativeModifiers")
  .default;
const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette")
  .default;

const defaultStyles = {
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
};

const dynamicGlowBase = {
  position: "relative",
  zIndex: 1,
  "&::after": {
    content: "''",
    position: "absolute",
    background: "inherit",
    zIndex: -1
  }
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
    opacity: 1
  }
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
    opacity: 0.7
  }
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
    opacity: 0.7
  }
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
    opacity: 0.53
  }
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
    opacity: 0.84
  }
};

module.exports = function() {
  return function({ addUtilities, e, theme, variants }) {
    const colors = flattenColorPalette(theme("glow.colors") || theme("colors"));
    const styles = theme("glow.styles") || defaultStyles;
    const styleFunctions = _.filter(
      _.toPairs(styles),
      ([_modifier, style]) => typeof style === "function"
    );
    const staticStyles = _.filter(
      _.toPairs(styles),
      ([_modifier, style]) => typeof style !== "function"
    );

    const processedGlows = _.flatMap(colors, (colorValue, colorModifier) => {
      const colorDescriptor = colorString.get(colorValue);
      const colorRGB = (colorDescriptor.model === "rgb"
        ? colorDescriptor.value
        : convert[colorDescriptor.model].rgb(colorDescriptor.value)
      ).slice(0, 3);
      const baseColor = colorRGB.join(", ");

      return _.map(styleFunctions, ([modifier, style]) => {
        const className = `${e(
          prefixNegativeModifiers(
            "glow",
            modifier === "default"
              ? colorModifier // default style will have only a color suffix
              : `${colorModifier}-${modifier}`
          )
        )}`;

        return [
          `.${className}`,
          {
            "box-shadow": style(baseColor)
          }
        ];
      });
    });

    const staticGlows = _.map(staticStyles, ([modifier, style]) => {
      const className =
        modifier === "default"
          ? "glow"
          : `${e(prefixNegativeModifiers("glow", modifier))}`;

      return [
        `.${className}`,
        {
          "box-shadow": style
        }
      ];
    });

    const utilities = _.fromPairs([...processedGlows, ...staticGlows]);

    addUtilities(utilities, variants("shadow"));
    addUtilities([
      { ".glow-dynamic": dynamicGlow },
      { ".glow-dynamic-md": dynamicGlowMd },
      { ".glow-dynamic-lg": dynamicGlowLg },
      { ".glow-dynamic-xl": dynamicGlowXl },
      { ".glow-dynamic-2xl": dynamicGlow2Xl }
    ]);
  };
};
