import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log("Tentative de connexion avec:", credentials);

      // Utiliser FormData pour la compatibilité avec l'API OAuth2 de FastAPI
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      // Configuration spéciale pour FormData
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      // Convertir FormData en URLSearchParams pour axios
      const params = new URLSearchParams();
      params.append("username", credentials.username);
      params.append("password", credentials.password);

      // Appel API avec URLSearchParams
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        params.toString(),
        config
      );

      console.log("Réponse d'authentification:", response);

      // Stocker les tokens
      localStorage.setItem("access_token", response.access_token);

      // Si le serveur renvoie un refresh_token (à adapter selon votre implémentation)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      // Stocker les informations de l'utilisateur
      localStorage.setItem("user", JSON.stringify(response.user));

      return response;
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Nettoyer le localStorage même si la requête échoue
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },
};

export default authService;
