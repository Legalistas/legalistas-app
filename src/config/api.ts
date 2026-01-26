// Configuración de la API
const API_CONFIG = {
  // Base URL de la API (en producción esto debería venir de variables de entorno)
  BASE_URL: __DEV__
    ? "https://backend.legalistas.ar" // Desarrollo
    : "https://backend.legalistas.ar", // Producción

  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    PROFILE: "/api/v1/auth/profile",

    // User endpoints
    USERS: "/api/v1/user",
    USER_PROFILE: "/api/v1/user/profile",

    // Dashboard endpoints
    DASHBOARD: "/api/v1/dashboard",

    // Otros endpoints que puedas tener
    CASES: "/api/v1/customer/cases",
    GET_BY_ID: (id: string) => `/api/v1/customer/case/${id}`,
    DOCUMENTS: "/api/v1/documents",

    // CONSULTATIONS: "/api/v1/customer/consultation",
    CONSULTATION_BY_ID: (id: string) => `/api/v1/customer/consultation/${id}`,

    // Appointments/Citas
    APPOINTMENTS: "/api/v1/customer/appointments",
    APPOINTMENT_BY_ID: (id: string) => `/api/v1/customer/appointment/${id}`,

    SETTINGS_COUNTRY: "/api/v1/settings/countries",
  },

  // Headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Timeout por defecto (en ms)
  TIMEOUT: 10000,
};

// Función helper para construir URLs completas
export const buildURL = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para hacer requests autenticados
export const getAuthHeaders = (
  token?: string | null,
): Record<string, string> => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Función helper para hacer requests con timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.TIMEOUT,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default API_CONFIG;
