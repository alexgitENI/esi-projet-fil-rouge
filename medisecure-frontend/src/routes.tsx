import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/layout/MainLayout/MainLayout";

// Components
import LoadingScreen from "./components/common/LoadingScreen/LoadingScreen";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/dashboard/DashboardPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const PatientListPage = lazy(() => import("./pages/patients/PatientsListPage"));
const PatientDetailsPage = lazy(
  () => import("./pages/patients/PatientDetailsPage")
);
const CreatePatientPage = lazy(
  () => import("./pages/patients/CreatePatientPage")
);
const AppointmentsCalendarPage = lazy(
  () => import("./pages/appointments/AppointmentsCalendarPage")
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const RouteProgress = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

// Guard pour les routes protégées
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guard pour les routes publiques (uniquement accessibles lorsque non connecté)
const RequireGuest = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return useRoutes([
    // Routes publiques
    {
      path: "/login",
      element: (
        <RequireGuest>
          <RouteProgress>
            <LoginPage />
          </RouteProgress>
        </RequireGuest>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <RequireGuest>
          <RouteProgress>
            <ForgotPasswordPage />
          </RouteProgress>
        </RequireGuest>
      ),
    },

    // Routes protégées
    {
      path: "/",
      element: (
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
      ),
      children: [
        { path: "/", element: <Navigate to="/dashboard" replace /> },
        {
          path: "dashboard",
          element: (
            <RouteProgress>
              <Dashboard />
            </RouteProgress>
          ),
        },
        {
          path: "patients",
          element: (
            <RouteProgress>
              <PatientListPage />
            </RouteProgress>
          ),
        },
        {
          path: "patients/create",
          element: (
            <RouteProgress>
              <CreatePatientPage />
            </RouteProgress>
          ),
        },
        {
          path: "patients/:id",
          element: (
            <RouteProgress>
              <PatientDetailsPage />
            </RouteProgress>
          ),
        },
        {
          path: "appointments",
          element: (
            <RouteProgress>
              <AppointmentsCalendarPage />
            </RouteProgress>
          ),
        },
      ],
    },

    // Route 404
    {
      path: "*",
      element: (
        <RouteProgress>
          <NotFoundPage />
        </RouteProgress>
      ),
    },
  ]);
};

export default AppRoutes;
