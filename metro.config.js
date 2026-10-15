const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
};

// 1rem = 16 px, como en el portal web (por defecto son 14): así los botones
// miden 48 px y la letra base 16, que es lo que pide el diseño.
module.exports = withNativewind(config, { inlineRem: 16 });
