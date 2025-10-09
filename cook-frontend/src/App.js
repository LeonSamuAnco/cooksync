import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProductsPage from "./components/products/ProductsPage";
import FavoritesPage from "./components/favorites/FavoritesPage";
import CategoriesPage from "./pages/CategoriesPage";
import AuthRedirect from "./components/auth/AuthRedirect";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import RecipeDetail from "./components/RecipeDetail";
import HomePage from "./components/home/HomePage";
import "./App.css";
import "./utils/backendChecker";

const TopBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const { showNotification } = useNotification();

  const handleLogout = () => {
    logout();
    showNotification("Sesión cerrada exitosamente", "success");
    navigate("/home", { replace: true });
  };

  return (
    <header style={{ background: "linear-gradient(135deg, #dc2626, #f59e0b)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ color: "white", fontSize: "1.8rem", fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/home")}>
        🍳 CookSync
      </div>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button onClick={() => navigate("/home")} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>🏠 Inicio</button>
        <button onClick={() => navigate("/categorias")} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>📂 Categorías</button>
        <button onClick={() => navigate("/productos")} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>🛍️ Productos</button>
        <button onClick={() => navigate("/favoritas")} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>💖 Favoritas</button>
        {isAuthenticated ? (
          <>
            <span>👋 {user?.nombres || 'Usuario'}</span>
            <button onClick={() => navigate(getDashboardRoute())}>📊 Dashboard</button>
            <button onClick={handleLogout}>🚪 Salir</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
            <button onClick={() => navigate("/registro")}>Registrarse</button>
          </>
        )}
      </nav>
    </header>
  );
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <TopBar />
      <Routes>
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/registro" element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/receta/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/favoritas" element={<FavoritesPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/moderador/*" element={<ProtectedRoute allowedRoles={['MODERADOR']}><Dashboard /></ProtectedRoute>} />
        <Route path="/vendedor/*" element={<ProtectedRoute allowedRoles={['VENDEDOR']}><Dashboard /></ProtectedRoute>} />
        <Route path="/cliente/*" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  </AuthProvider>
);

export default App;
