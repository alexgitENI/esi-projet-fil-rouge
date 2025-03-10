import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";

// Type pour le token de refresh
interface RefreshToken {
  refresh_token: string;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
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
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si l'erreur est 401 et que nous n'avons pas déjà essayé de rafraîchir le token
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si nous sommes déjà en train de rafraîchir, nous ajoutons la requête à la file d'attente
            return new Promise<AxiosResponse>((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
              this.logout();
              return Promise.reject(error);
            }

            const response = await this.axiosInstance.post<{
              access_token: string;
            }>(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });

            const { access_token } = response.data;
            localStorage.setItem("access_token", access_token);

            this.onRefreshed(access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
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
