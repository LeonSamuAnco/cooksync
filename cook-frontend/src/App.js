import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProductsPage from "./components/products/ProductsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ActivityPage from "./pages/ActivityPage";
import CategoriesExplorer from "./pages/CategoriesExplorer";
import AuthRedirect from "./components/auth/AuthRedirect";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import { useNotifications } from "./hooks/useNotifications";
import NotificationsPanel from "./components/NotificationsPanel";
import RecipeDetail from "./components/RecipeDetail";
import HomePage from "./components/home/HomePage";
import LandingPage from "./pages/LandingPage";
import CelularesPage from "./pages/CelularesPage";
import CelularDetailPage from "./pages/CelularDetailPage";
import TortasPage from "./pages/TortasPage";
import TortaDetailPage from "./pages/TortaDetailPage";
import LugaresPage from "./pages/LugaresPage";
import LugarDetailPage from "./pages/LugarDetailPage";
import DeportesPage from "./pages/DeportesPage";
import DeporteDetailPage from "./pages/DeporteDetailPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SessionExpiredModal from "./components/SessionExpiredModal";
import "./App.css";
import "./utils/backendChecker";

const TopBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const { showNotification } = useNotification();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);

  const handleLogout = () => {
    logout();
    showNotification("Sesión cerrada exitosamente", "success");
    navigate("/home", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-brand" onClick={() => navigate("/home")}>
        <span className="brand-icon">🍳</span>
        <span className="brand-title">CookSync</span>
      </div>
      <nav className="header-nav">
        <button className="nav-btn" onClick={() => navigate("/home")}>
          <span className="nav-icon">🏠</span>
          <span>Inicio</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/categorias")}>
          <span className="nav-icon">📂</span>
          <span>Categorías</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/favoritas")}>
          <span className="nav-icon">💖</span>
          <span>Favoritas</span>
        </button>
        {isAuthenticated ? (
          <>
            <span className="user-greeting">👋 {user?.nombres || 'Usuario'}</span>
            
            {/* Campana de Notificaciones */}
            <div className="notifications-container" style={{ position: 'relative' }}>
              <button 
                className="notifications-btn"
                onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                🔔
                {unreadCount > 0 && (
                  <span 
                    className="notification-badge"
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#ff4757',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Panel de Notificaciones */}
              {showNotificationsPanel && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  zIndex: 1000,
                  marginTop: '8px'
                }}>
                  <NotificationsPanel
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClose={() => setShowNotificationsPanel(false)}
                  />
                </div>
              )}
            </div>
            
            <button className="nav-btn-primary" onClick={() => navigate(getDashboardRoute())}>
              📊 Dashboard
            </button>
            <button className="nav-btn-secondary" onClick={handleLogout}>
              🚪 Salir
            </button>
          </>
        ) : (
          <>
            <button className="auth-btn login-btn" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </button>
            <button className="auth-btn register-btn" onClick={() => navigate("/registro")}>
              Registrarse
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

const AppContent = () => {
  const { loading, sessionExpired, logout } = useAuth();

  const handleCloseSessionExpired = () => {
    logout(false); // Cerrar sin mostrar el mensaje de nuevo
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        ⏳ Cargando...
      </div>
    );
  }

  return (
    <Router>
      <TopBar />
      {sessionExpired && <SessionExpiredModal onClose={handleCloseSessionExpired} />}
      <Routes>
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/registro" element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categorias" element={<CategoriesExplorer />} />
        <Route path="/explore" element={<CategoriesExplorer />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/receta/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/celulares" element={<CelularesPage />} />
        <Route path="/celulares/:id" element={<CelularDetailPage />} />
        <Route path="/tortas" element={<TortasPage />} />
        <Route path="/tortas/:id" element={<TortaDetailPage />} />
        <Route path="/lugares" element={<LugaresPage />} />
        <Route path="/lugares/:id" element={<LugarDetailPage />} />
        <Route path="/deportes" element={<DeportesPage />} />
        <Route path="/deportes/:id" element={<DeporteDetailPage />} />
        <Route path="/favoritas" element={<FavoritesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/history" element={<ActivityPage />} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
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
