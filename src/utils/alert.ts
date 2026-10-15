import { Alert } from "react-native";

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
  Alert.alert(title, message, buttons);
};

export const showSimpleAlert = (
  title: string,
  message: string,
  onPress?: () => void
) => {
  Alert.alert(title, message, onPress ? [{ text: "OK", onPress }] : undefined);
};
