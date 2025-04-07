// src/api/apiClient.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000, // Augmentation du timeout pour les environnements de développement
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
    // Interceptor de requête - ajoute le token d'authentification
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de réponse - gère les erreurs d'authentification
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si ce n'est pas une erreur 401 ou si nous n'avons pas de config, rejeter l'erreur
        if (error.response?.status !== 401 || !error.config) {
          return Promise.reject(error);
        }

        // Rediriger vers la page de connexion en cas d'erreur d'authentification
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        // Vérifier si nous sommes déjà sur la page de login pour éviter une boucle de redirections
        if (!window.location.pathname.includes("login")) {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    );
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
    const response = await this.axiosInstance.post<T>(url, data, config);
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
