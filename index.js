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

const dynamicShadowLg = {
  position: "relative",
  zIndex: 1,
  "&::after": {
    content: "''",
    width: "98%",
    height: "98%",
    position: "absolute",
    background: "inherit",
    top: "calc(4px + 2%)",
    left: "1%",
    filter: "blur(8px)",
    opacity: 0.7,
    zIndex: -1
  }
};

const dynamicShadowXl = {
  position: "relative",
  zIndex: 1,
  "&::after": {
    content: "''",
    width: "98%",
    height: "96%",
    position: "absolute",
    background: "inherit",
    top: "calc(12px + 4%)",
    left: "1%",
    filter: "blur(12px)",
    opacity: 0.53,
    zIndex: -1
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
        const className =
          modifier === "default"
            ? "glow"
            : `${e(
                prefixNegativeModifiers("glow", `${colorModifier}-${modifier}`)
              )}`;

        return [
          `.${className}`,
          {
            "box-shadow": style(baseColor)
          }
        ];
      });
    });

    const staticGlows = _.map(staticStyles, (style, modifier) => {
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
      { ".glow-dynamic-lg": dynamicShadowLg },
      { ".glow-dynamic-xl": dynamicShadowXl }
    ]);
  };
};
