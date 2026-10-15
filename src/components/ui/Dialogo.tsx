import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icono } from "./Icono";
import { Toasts } from "./Toast";

// Diálogo como hoja desde abajo (Modal del sistema: maneja el botón "atrás" de
// Android y deja el resto de la pantalla fuera del lector de pantalla).
export function Dialogo({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  children,
}: {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={abierto}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={alCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
        // En línea: la clase `bg-black/55` compila a un color inválido en nativo.
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        {/* Tocar el fondo oscuro cierra. */}
        <Pressable
          className="flex-1"
          onPress={alCerrar}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
        />
        <View className="max-h-[92%] rounded-t-3xl bg-superficie">
          <View className="flex-row items-start gap-3 border-borde border-b px-5 pt-5 pb-4">
            <View className="flex-1">
              <Text accessibilityRole="header" className="font-bold text-texto text-xl">
                {titulo}
              </Text>
              {descripcion ? (
                <Text className="mt-1 text-base text-texto-suave">{descripcion}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={alCerrar}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              className="size-11 items-center justify-center rounded-full bg-superficie-2 active:opacity-70"
            >
              <Icono nombre="close" />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: Math.max(20, insets.bottom) }}
          >
            {children}
          </ScrollView>
        </View>
        <Toasts />
      </KeyboardAvoidingView>
    </Modal>
  );
}
