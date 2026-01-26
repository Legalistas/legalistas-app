import { Platform, Alert } from "react-native";

interface AlertOptions {
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
}

export const showAlert = ({ title, message, buttons }: AlertOptions) => {
  if (Platform.OS === "web") {
    // Para web, usar alert nativo del navegador o una implementación personalizada
    if (buttons && buttons.length > 1) {
      // Si hay múltiples botones, usar confirm
      const confirmed = window.confirm(`${title}\n\n${message}`);
      const confirmButton = buttons.find((btn) => btn.style !== "cancel");
      const cancelButton = buttons.find((btn) => btn.style === "cancel");

      if (confirmed && confirmButton?.onPress) {
        confirmButton.onPress();
      } else if (!confirmed && cancelButton?.onPress) {
        cancelButton.onPress();
      }
    } else {
      // Un solo botón, usar alert simple
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // Para móvil, usar Alert nativo
    Alert.alert(title, message, buttons);
  }
};

// Función helper para alertas simples
export const showSimpleAlert = (title: string, message: string) => {
  showAlert({ title, message });
};
