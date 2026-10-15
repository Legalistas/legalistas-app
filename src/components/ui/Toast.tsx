import { useEffect, useSyncExternalStore } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColores } from "../../styles/tema";
import { Icono } from "./Icono";

// Avisos de las acciones (cargando → listo o error), como los de Sonner en el
// portal. Se muestra uno por vez, arriba; el nuevo reemplaza al anterior.

interface Aviso {
  id: string;
  tipo: "cargando" | "exito" | "error";
  titulo: string;
  descripcion?: string;
}

let actual: Aviso | null = null;
const oyentes = new Set<() => void>();

function mostrar(aviso: Aviso | null) {
  actual = aviso;
  for (const avisar of oyentes) avisar();
}

type Opciones = { id?: string; description?: string };
const nuevo = (tipo: Aviso["tipo"]) => (titulo: string, o: Opciones = {}) =>
  mostrar({ id: o.id ?? titulo, tipo, titulo, descripcion: o.description });

export const toast = {
  loading: nuevo("cargando"),
  success: nuevo("exito"),
  error: nuevo("error"),
  dismiss: (id: string) => {
    if (actual?.id === id) mostrar(null);
  },
};

/** Va una vez en la raíz de la app y dentro de cada <Dialogo> (un Modal tapa lo de atrás). */
export function Toasts() {
  const insets = useSafeAreaInsets();
  const c = useColores();
  const aviso = useSyncExternalStore(
    (avisar) => {
      oyentes.add(avisar);
      return () => {
        oyentes.delete(avisar);
      };
    },
    () => actual,
  );

  useEffect(() => {
    if (!aviso || aviso.tipo === "cargando") return;
    const t = setTimeout(() => toast.dismiss(aviso.id), aviso.tipo === "error" ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!aviso) return null;
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-4 z-50"
      style={{ top: insets.top + 8 }}
    >
      <Pressable
        onPress={() => toast.dismiss(aviso.id)}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-2xl border border-borde bg-superficie p-4 shadow-barra"
      >
        {aviso.tipo === "cargando" ? (
          <ActivityIndicator color={c.textoMarca} />
        ) : (
          <Icono
            nombre={aviso.tipo === "exito" ? "checkmark-circle" : "alert-circle"}
            tono={aviso.tipo === "exito" ? "verde" : "rojo"}
          />
        )}
        <View className="flex-1">
          <Text className="font-bold text-base text-texto">{aviso.titulo}</Text>
          {aviso.descripcion ? (
            <Text className="text-sm text-texto-suave">{aviso.descripcion}</Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
