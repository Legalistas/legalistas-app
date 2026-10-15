import Constants, { ExecutionEnvironment } from "expo-constants";

// OneSignal: cargar solo en builds nativos (no Expo Go)
let OneSignalModule: any = null;
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  try {
    OneSignalModule = require("react-native-onesignal").OneSignal;
  } catch (_) {
    OneSignalModule = null;
  }
}

/** Inicializa el SDK de OneSignal. No dispara prompt de permisos. */
export function initOneSignal() {
  try {
    if (!OneSignalModule) return;
    const appId = Constants.expoConfig?.extra?.onesignalAppId || "";
    OneSignalModule.initialize(appId);
  } catch (_) {}
}

/**
 * Solicita al usuario el permiso del sistema para recibir notificaciones push.
 * Debe llamarse recién cuando el usuario esté en un contexto donde tenga
 * sentido (p.ej. tras autenticarse), para cumplir con Apple Guideline 4.5.4.
 */
export function requestPushPermission() {
  try {
    OneSignalModule?.Notifications?.requestPermission(true);
  } catch (_) {}
}

/** Vincula el usuario autenticado con OneSignal usando externalId */
export function loginOneSignal(userId: string | number) {
  try {
    OneSignalModule?.login(String(userId));
  } catch (_) {}
}

/** Desvincula el usuario de OneSignal */
export function logoutOneSignal() {
  try {
    OneSignalModule?.logout();
  } catch (_) {}
}

/** Obtiene el subscriptionId (playerId) de OneSignal */
export async function getOneSignalPlayerId(): Promise<string | null> {
  try {
    if (!OneSignalModule) return null;
    const sub = OneSignalModule.User.pushSubscription;
    const id = typeof sub.getIdAsync === "function"
      ? await sub.getIdAsync()
      : sub.id;
    return id || null;
  } catch (_) {
    return null;
  }
}

type PushPayload = {
  type?: string;
  consultationId?: number | string;
  caseId?: number | string;
};

let pendingPayload: PushPayload | null = null;
let clickHandler: ((payload: PushPayload) => void) | null = null;

/** Devuelve y consume el payload pendiente (si la app abrió desde una push). */
export function consumePendingPushPayload(): PushPayload | null {
  const p = pendingPayload;
  pendingPayload = null;
  return p;
}

/** Registra el handler que se invocará cuando el usuario tape una push. */
export function setPushClickHandler(handler: (payload: PushPayload) => void) {
  clickHandler = handler;
  // Si llegó algo antes de que el handler estuviera listo, lo despachamos ahora.
  const pending = consumePendingPushPayload();
  if (pending) handler(pending);
}

/** Suscribe al evento de click de OneSignal. Llamar una sola vez al iniciar la app. */
export function attachPushClickListener() {
  try {
    if (!OneSignalModule) return;
    OneSignalModule.Notifications.addEventListener("click", (event: any) => {
      const data: PushPayload =
        event?.notification?.additionalData ||
        event?.result?.notification?.additionalData ||
        {};
      if (clickHandler) {
        clickHandler(data);
      } else {
        pendingPayload = data;
      }
    });
  } catch (_) {}
}
