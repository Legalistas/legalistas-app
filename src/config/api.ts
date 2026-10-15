// La API de la app es el portal de clientes (usuarios.legalistas.ar): mismo
// ingreso con código por mail y mismos datos que la web (/api/portal/*).
export const PORTAL_URL = (
  process.env.EXPO_PUBLIC_PORTAL_URL ?? "https://usuarios.legalistas.ar"
).replace(/\/$/, "");

// Backend: solo para el chequeo de versión mínima (público) y las fotos viejas.
export const BACKEND_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://backend.legalistas.ar"
).replace(/\/$/, "");

// Función helper para hacer requests con timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 20000,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};
