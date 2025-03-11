import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";

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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

const authService = {
  // Dans src/api/services/authService.ts
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log("Tentative de connexion avec:", credentials);

      // Configuration spéciale pour le format attendu par FastAPI OAuth2
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      // Appel API direct sans passer par les méthodes du apiClient
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        formData.toString(),
        config
      );

      // Adapter les données utilisateur pour correspondre aux attentes du frontend
      const adaptedResponse = {
        ...response,
        user: {
          ...response.user,
          username: response.user.email, // Ajouter username basé sur email
        },
      };

      // Stocker le token
      if (adaptedResponse.access_token) {
        localStorage.setItem("access_token", adaptedResponse.access_token);
        // Stocker les informations de l'utilisateur
        localStorage.setItem("user", JSON.stringify(adaptedResponse.user));
      } else {
        throw new Error("Token non reçu dans la réponse");
      }

      return adaptedResponse;
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
