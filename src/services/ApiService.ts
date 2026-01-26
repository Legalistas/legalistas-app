import AsyncStorage from "@react-native-async-storage/async-storage";
import API_CONFIG, {
  buildURL,
  getAuthHeaders,
  fetchWithTimeout,
} from "../config/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user?: any;
  message?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch {
      return null;
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = false,
  ): Promise<ApiResponse<T>> {
    try {
      const url = buildURL(endpoint);
      let headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };

      if (authenticated) {
        const token = await this.getToken();
        headers = { ...headers, ...getAuthHeaders(token) };
      }

      const response = await fetchWithTimeout(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return {
          success: false,
          error: `El servidor retornó ${contentType || "contenido no JSON"}. Status: ${response.status}`,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          message: data.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || "Error de conexión",
      };
    }
  }

  // Auth Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest(
      API_CONFIG.ENDPOINTS.LOGOUT,
      { method: "POST" },
      true,
    );
  }

  async getUserProfile(): Promise<ApiResponse> {
    return this.makeRequest(
      API_CONFIG.ENDPOINTS.USER_PROFILE,
      { method: "GET" },
      true,
    );
  }

  async getDashboardData(): Promise<ApiResponse> {
    return this.makeRequest(
      API_CONFIG.ENDPOINTS.DASHBOARD,
      { method: "GET" },
      true,
    );
  }

  // Método genérico para endpoints custom
  async customRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = true,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, options, authenticated);
  }

  // Método para subir archivos
  async uploadFile(endpoint: string, file: FormData): Promise<ApiResponse> {
    try {
      const url = buildURL(endpoint);
      const token = await this.getToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // No agregar Content-Type para FormData, el navegador lo agrega automáticamente

      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers,
        body: file,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error subiendo archivo",
      };
    }
  }

  // Obtener listado de causas
  async getCases(
    customerId?: number,
    page = 1,
    limit = 10,
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (customerId) {
      params.append("customerId", customerId.toString());
    }

    return this.makeRequest(
      `${API_CONFIG.ENDPOINTS.CASES}?${params.toString()}`,
      { method: "GET" },
      true,
    );
  }

  // Obtener detalle de un caso por ID
  async getCaseById(caseId: string | number): Promise<ApiResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.GET_BY_ID(caseId.toString());
    return this.makeRequest(endpoint, { method: "GET" }, true);
  }

  async getConsultationById(
    consultationId: string | number,
  ): Promise<ApiResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.CONSULTATION_BY_ID(
      consultationId.toString(),
    );
    return this.makeRequest(endpoint, { method: "GET" }, true);
  }

  // Obtener países y estados
  async getCountries(): Promise<ApiResponse> {
    return this.makeRequest(
      API_CONFIG.ENDPOINTS.SETTINGS_COUNTRY,
      { method: "GET" },
      true,
    );
  }

  // Obtener citas del cliente
  async getAppointments(
    customerId?: number,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (customerId) {
      params.append("customerId", customerId.toString());
    }

    return this.makeRequest(
      `${API_CONFIG.ENDPOINTS.APPOINTMENTS}?${params.toString()}`,
      { method: "GET" },
      true,
    );
  }

  // Obtener detalle de una cita
  async getAppointmentById(appointmentId: string | number): Promise<ApiResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.APPOINTMENT_BY_ID(appointmentId.toString());
    return this.makeRequest(endpoint, { method: "GET" }, true);
  }
}

// Exportar instancia singleton
export default new ApiService();
