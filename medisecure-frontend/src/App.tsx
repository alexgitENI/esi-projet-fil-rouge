import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
