import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Stocker les tokens
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Nettoyer le localStorage même si la requête échoue
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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
