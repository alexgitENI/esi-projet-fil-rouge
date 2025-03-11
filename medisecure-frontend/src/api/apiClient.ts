import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Interceptor de requête
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de réponse
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si ce n'est pas une erreur 401 ou si nous n'avons pas de config, rejeter l'erreur
        if (error.response?.status !== 401 || !error.config) {
          return Promise.reject(error);
        }

        const originalRequest = error.config;

        // Éviter de boucler indéfiniment pour les erreurs 401
        if ((originalRequest as any)._retry) {
          // Déconnecter l'utilisateur si nous avons déjà essayé de rafraîchir
          this.logout();
          return Promise.reject(error);
        }

        // Marquer comme déjà essayé
        (originalRequest as any)._retry = true;

        try {
          // Simuler un rafraîchissement de token
          // Dans un environnement réel, vous appelleriez une API de rafraîchissement
          // Pour l'instant, nous allons simplement rediriger vers la page de connexion
          this.logout();
          return Promise.reject(error);
        } catch (refreshError) {
          this.logout();
          return Promise.reject(refreshError);
        }
      }
    );
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Debug pour l'authentification
    if (url === ENDPOINTS.AUTH.LOGIN) {
      console.log("Envoi de la demande d'authentification:", data);
    }

    const response = await this.axiosInstance.post<T>(url, data, config);

    // Debug pour l'authentification
    if (url === ENDPOINTS.AUTH.LOGIN) {
      console.log("Réponse d'authentification reçue:", response.data);
    }

    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

export default ApiClient.getInstance();
