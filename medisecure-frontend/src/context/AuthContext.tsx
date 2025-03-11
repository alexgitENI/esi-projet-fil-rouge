import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import authService, { LoginCredentials, LoginResponse } from "../api/services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse["user"] | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated()
  );
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement initial
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        // Récupérer l'utilisateur à partir du localStorage
        const userString = localStorage.getItem("user");
        if (userString) {
          setUser(JSON.parse(userString));
        }
        setIsAuthenticated(authService.isAuthenticated());
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);

      // Adaptation des données utilisateur pour être compatible avec les composants
      const adaptedUser = {
        ...response.user,
        username: response.user.email, // Ajouter username basé sur email
      };

      // Stocker les informations utilisateur
      setUser(adaptedUser);
      setIsAuthenticated(true);

      // Stocker également dans localStorage si nécessaire
      localStorage.setItem("user", JSON.stringify(adaptedUser));
    } catch (err) {
      console.error("Login error:", err);
      setError("Identifiants invalides. Veuillez réessayer.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
