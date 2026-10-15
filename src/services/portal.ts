import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { fetchWithTimeout, PORTAL_URL } from "../config/api";
import { leerCookies } from "../utils/cookies";

// Llamadas de la app al portal de clientes: /api/portal/* (datos) y /api/auth/*
// (Better Auth: ingreso con el código del mail, dos pasos, sesiones).
// La sesión es la misma cookie que usa la web; acá la guarda y la manda la app.

export class ErrorApi extends Error {
  constructor(
    public status: number,
    message: string,
    /** Para que la pantalla reaccione a un caso puntual (p. ej. "NO_CLIENTE"). */
    public codigo?: string,
    /** Título del aviso, si el servidor manda uno más preciso que el genérico. */
    public titulo?: string,
  ) {
    super(message);
  }
}

export const mensajeDeError = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : "Algo salió mal. Probá de nuevo.";

// ── Cookies de sesión ───────────────────────────────────────────────────────

const CLAVE = "legalistas.cookies";
let cookies: Record<string, string> = {};
let alTerminar: (() => void) | null = null;

export const haySesion = () => Object.keys(cookies).some((n) => n.endsWith("session_token"));

/** Al abrir la app: lee las cookies guardadas. Devuelve si hay una sesión. */
export async function cargarSesion(): Promise<boolean> {
  try {
    cookies = JSON.parse((await AsyncStorage.getItem(CLAVE)) ?? "{}");
  } catch {
    cookies = {};
  }
  return haySesion();
}

/** AuthContext se entera cuando la sesión se termina (se cerró o venció). */
export function alTerminarSesion(aviso: () => void) {
  alTerminar = aviso;
}

/** Borra la sesión de este dispositivo. Queda "recordar este dispositivo" del segundo paso. */
export function borrarSesion() {
  cookies = Object.fromEntries(Object.entries(cookies).filter(([n]) => n.endsWith("trust_device")));
  AsyncStorage.setItem(CLAVE, JSON.stringify(cookies)).catch(() => {});
  alTerminar?.();
}

// ── Pedidos ─────────────────────────────────────────────────────────────────

// El portal muestra el dispositivo en "Sesiones abiertas" y en el historial.
const AGENTE = `Legalistas-App/${Constants.expoConfig?.version ?? "0"} (${
  Platform.OS === "ios" ? "iPhone" : "Android"
})`;

interface Pedido {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

async function pedir(ruta: string, init: Pedido) {
  const galletas = Object.entries(cookies)
    .map(([n, v]) => `${n}=${v}`)
    .join("; ");
  let respuesta: Response;
  try {
    respuesta = await fetchWithTimeout(`${PORTAL_URL}${ruta}`, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": AGENTE,
        // Better Auth exige el origen en los pedidos con cookie (protección
        // pensada para navegadores); la app manda el del portal.
        Origin: PORTAL_URL,
        ...(galletas ? { Cookie: galletas } : {}),
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      // Las cookies se mandan a mano (arriba): el sistema no guarda ninguna.
      credentials: "omit",
    });
  } catch {
    throw new ErrorApi(0, "Sin conexión. Revisá tu internet y probá de nuevo.");
  }
  const cuerpo = (await respuesta.json().catch(() => null)) as Record<string, any> | null;
  return { respuesta, cuerpo };
}

/** Datos del portal (/api/portal/*). Con 401 la sesión terminó: vuelve al ingreso. */
export async function api<T>(ruta: string, init: Pedido = {}): Promise<T> {
  const { respuesta, cuerpo } = await pedir(`/api/portal${ruta}`, init);
  if (respuesta.status === 401) borrarSesion();
  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      cuerpo?.error ?? "Algo salió mal. Probá de nuevo.",
      cuerpo?.codigo,
      cuerpo?.titulo,
    );
  }
  return cuerpo as T;
}

const MENSAJES: Record<string, string> = {
  INVALID_OTP: "El código no es correcto o ya venció. Revisalo o pedí uno nuevo.",
  OTP_EXPIRED: "El código venció. Pedí uno nuevo.",
  INVALID_CODE: "El código no es correcto. Fijate que sea el que muestra la app ahora.",
  INVALID_TWO_FACTOR_COOKIE: "Pasó mucho tiempo. Volvé a entrar con tu mail.",
  TOO_MANY_ATTEMPTS: "Pusiste el código mal muchas veces. Pedí uno nuevo.",
  OTP_HAS_EXPIRED: "El código venció. Probá con el que muestra la app ahora.",
  INVALID_BACKUP_CODE: "Ese código de respaldo no es válido o ya se usó.",
};

/** Better Auth (/api/auth/*): guarda las cookies que devuelve y traduce los errores. */
export async function auth<T>(ruta: string, init: Pedido = {}): Promise<T> {
  const { respuesta, cuerpo } = await pedir(`/api/auth${ruta}`, init);
  cookies = leerCookies(respuesta.headers.get("set-cookie"), cookies);
  AsyncStorage.setItem(CLAVE, JSON.stringify(cookies)).catch(() => {});
  if (!respuesta.ok) {
    const codigo = typeof cuerpo?.code === "string" ? cuerpo.code : undefined;
    throw new ErrorApi(
      respuesta.status,
      (codigo && MENSAJES[codigo]) ||
        (respuesta.status === 429
          ? "Muchos intentos seguidos. Esperá un minuto."
          : "No se pudo completar. Probá de nuevo."),
      codigo,
    );
  }
  return cuerpo as T;
}
