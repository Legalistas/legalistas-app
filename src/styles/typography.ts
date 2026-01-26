import { StyleSheet, TextStyle } from "react-native";

// Fuentes Inter
export const fontFamily = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
};

// Pesos de fuente
export const fontWeight = {
  regular: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semiBold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
};

export const typography: { [key: string]: TextStyle } = {
  // Headers
  h1: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h5: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h6: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // Labels & Buttons
  button: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  // Caption
  caption: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  captionSmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
  },
};

// Helper para aplicar rápidamente estilos de tipografía
export const applyFont = (variant: keyof typeof typography): TextStyle => {
  return typography[variant];
};
