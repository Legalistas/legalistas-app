import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { Appearance, useColorScheme } from "react-native";

// Colores para lo que necesita el valor en JS (íconos, placeholders, switches).
// Son los mismos tokens de global.css: si cambia uno, cambiar el otro.
const FIJOS = { ink: "#091018", brand: "#21adbc", blanco: "#ffffff" };

export const CLARO = {
  ...FIJOS,
  superficie: "#ffffff",
  texto: "#091018",
  textoSuave: "#475569",
  textoTenue: "#64748b",
  textoMarca: "#115863",
  bordeFuerte: "#cbd5e1",
  rojo: "#b91c1c",
  ambar: "#b45309",
  verde: "#15803d",
};

export const OSCURO: typeof CLARO = {
  ...FIJOS,
  superficie: "#0f1a26",
  texto: "#ffffff",
  textoSuave: "#cbd5e1",
  textoTenue: "#94a3b8",
  textoMarca: "#55ccd9",
  bordeFuerte: "#2c4563",
  rojo: "#fca5a5",
  ambar: "#fcd34d",
  verde: "#86efac",
};

export type Tono = keyof typeof CLARO;

export const useColores = () => (useColorScheme() === "dark" ? OSCURO : CLARO);

// ── Tema elegido (se guarda en este dispositivo) ────────────────────────────

export type Tema = "claro" | "oscuro" | "sistema";

const CLAVE = "legalistas.tema";
let tema: Tema = "sistema";
const oyentes = new Set<() => void>();

export function cambiarTema(nuevo: Tema) {
  tema = nuevo;
  // En la versión web no existe: ahí manda el tema del navegador.
  Appearance.setColorScheme?.(nuevo === "sistema" ? null : nuevo === "oscuro" ? "dark" : "light");
  AsyncStorage.setItem(CLAVE, nuevo).catch(() => {});
  for (const avisar of oyentes) avisar();
}

/** Al abrir la app: aplica el tema guardado (sin nada guardado, el del sistema). */
export async function iniciarTema() {
  const guardado = await AsyncStorage.getItem(CLAVE).catch(() => null);
  if (guardado === "claro" || guardado === "oscuro") cambiarTema(guardado);
}

export const useTema = () =>
  useSyncExternalStore(
    (avisar) => {
      oyentes.add(avisar);
      return () => {
        oyentes.delete(avisar);
      };
    },
    () => tema,
  );
