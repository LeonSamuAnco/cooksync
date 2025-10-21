import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
import './AdminProfile.css';

const AdminProfile = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [systemStats, setSystemStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemRoles, setSystemRoles] = useState([]);
  const [reports, setReports] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [recipesStats, setRecipesStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Primero probar la conexión
      console.log('Testing admin connection...');
      const testResult = await adminService.testConnection();
      console.log('Admin connection test result:', testResult);
      
      // Luego cargar datos reales
      await Promise.all([
        loadSystemStats(),
        loadRecentUsers(),
        loadSystemRoles(),
        loadRecipes(),
      ]);
    } catch (error) {
      showNotification('Error al cargar datos del sistema', 'error');
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await adminService.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      // Usar datos de prueba si falla la conexión
      setSystemStats({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        usersByRole: [],
        recentUsers: 0,
        systemHealth: {
          status: 'Conectando...',
          uptime: 0,
          memoryUsage: { rss: 0, heapUsed: 0, heapTotal: 0 }
        }
      });
      showNotification('Usando datos de prueba - Verificar conexión backend', 'warning');
    }
  };

  const loadRecentUsers = async () => {
    try {
      const users = await adminService.getRecentUsers(5);
      setRecentUsers(users);
    } catch (error) {
      console.error('Error loading recent users:', error);
      // Usar datos de prueba si falla la conexión
      setRecentUsers([]);
      showNotification('Error al cargar usuarios recientes', 'error');
    }
  };

  const loadAllUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const result = await adminService.getAllUsers(page, 10, search);
      setAllUsers(result.users || []);
      setUsersPage(page);
      setUsersSearch(search);
      setUsersTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error loading all users:', error);
      showNotification('Error al cargar usuarios', 'error');
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemRoles = async () => {
    try {
      const roles = await adminService.getSystemRoles();
      setSystemRoles(roles);
    } catch (error) {
      console.error('Error loading system roles:', error);
      showNotification('Error al cargar roles del sistema', 'error');
    }
  };

  const loadReports = async () => {
    try {
      const reportsData = await adminService.getSystemReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      showNotification('Error al cargar reportes', 'error');
    }
  };

  const loadRecipes = async () => {
    try {
      console.log('Frontend: Loading recipes...');
      
      // Método 1: Intentar endpoint directo de recetas
      try {
        console.log('Trying direct recipes endpoint...');
        const directResponse = await fetch('http://localhost:3002/recipes');
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('Direct recipes response:', directData);
          
          if (directData.recipes && Array.isArray(directData.recipes)) {
            setRecipes(directData.recipes);
            showNotification(`✅ ${directData.recipes.length} recetas cargadas desde API principal`, 'success');
            return;
          }
        } else {
          console.log('Direct endpoint status:', directResponse.status);
        }
      } catch (directError) {
        console.log('Direct endpoint error:', directError.message);
      }
      
      // Método 2: Intentar endpoint de admin
      try {
        console.log('Trying admin recipes endpoint...');
        const adminData = await adminService.getAllRecipes(1, 50);
        console.log('Admin recipes response:', adminData);
        
        if (adminData && adminData.recipes && Array.isArray(adminData.recipes)) {
          setRecipes(adminData.recipes);
          showNotification(`✅ ${adminData.recipes.length} recetas cargadas desde Admin API`, 'success');
          return;
        }
      } catch (adminError) {
        console.log('Admin endpoint error:', adminError.message);
      }
      
      // Método 3: Datos de prueba como último recurso
      console.log('Using fallback test data...');
      const testRecipes = [
        {
          id: 1,
          titulo: 'Ceviche Clásico Peruano',
          tiempoPreparacion: 30,
          porciones: 4,
          dificultad: { nombre: 'Fácil' },
          autor: { nombres: 'Chef Admin' },
          imagenUrl: null,
          descripcion: 'Delicioso ceviche tradicional peruano'
        },
        {
          id: 2,
          titulo: 'Lomo Saltado Tradicional',
          tiempoPreparacion: 45,
          porciones: 6,
          dificultad: { nombre: 'Medio' },
          autor: { nombres: 'Chef Admin' },
          imagenUrl: null,
          descripcion: 'Clásico lomo saltado peruano'
        },
        {
          id: 3,
          titulo: 'Ají de Gallina',
          tiempoPreparacion: 60,
          porciones: 8,
          dificultad: { nombre: 'Medio' },
          autor: { nombres: 'Chef Admin' },
          imagenUrl: null,
          descripcion: 'Tradicional ají de gallina peruano'
        }
      ];
      
      setRecipes(testRecipes);
      showNotification('⚠️ Usando datos de prueba - Backend no disponible', 'warning');
      
    } catch (error) {
      console.error('Error general loading recipes:', error);
      setRecipes([]);
      showNotification('❌ Error al cargar recetas', 'error');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    setConfirmAction({
      message: '¿Estás seguro de cambiar el estado de este usuario?',
      onConfirm: async () => {
        try {
          const result = await adminService.toggleUserStatus(userId);
          showNotification(result.message, 'success');
          if (activeSection === 'users') {
            await loadAllUsers(usersPage, usersSearch);
          }
          await loadRecentUsers();
          await loadSystemStats();
        } catch (error) {
          console.error('Error toggling user status:', error);
          showNotification('Error al cambiar estado del usuario', 'error');
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleChangeUserRole = async (userId, newRoleId) => {
    try {
      const result = await adminService.changeUserRole(userId, newRoleId);
      showNotification(result.message, 'success');
      // Recargar usuarios
      if (activeSection === 'users') {
        loadAllUsers(usersPage, usersSearch);
      }
      loadRecentUsers(); // Actualizar usuarios recientes también
    } catch (error) {
      console.error('Error changing user role:', error);
      showNotification('Error al cambiar rol del usuario', 'error');
    }
  };

  const handleToggleRecipeStatus = async (recipeId) => {
    setConfirmAction({
      message: '¿Estás seguro de cambiar el estado de esta receta?',
      onConfirm: async () => {
        try {
          const result = await adminService.toggleRecipeStatus(recipeId);
          showNotification(result.message || 'Estado de receta cambiado', 'success');
          await loadRecipes();
        } catch (error) {
          console.error('Error toggling recipe status:', error);
          showNotification('Error al cambiar estado de la receta', 'error');
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', active: true },
    { id: 'users', icon: '👥', label: 'Usuarios' },
    { id: 'recipes', icon: '🍽️', label: 'Recetas' },
    { id: 'orders', icon: '🛒', label: 'Pedidos' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'reports', icon: '📋', label: 'Reportes' },
    { id: 'settings', icon: '⚙️', label: 'Configuración' },
    { id: 'security', icon: '🔒', label: 'Seguridad' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'recipes':
        return renderRecipes();
      case 'orders':
        return renderOrders();
      case 'analytics':
        return renderAnalytics();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      case 'security':
        return renderSecurity();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>📊 Dashboard General</h2>
        <p>Resumen ejecutivo del sistema CookSync</p>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{systemStats.totalUsers || 0}</h3>
            <p>Usuarios Totales</p>
            <span className="stat-change positive">+12% este mes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-info">
            <h3>{systemStats.totalRecipes || 45}</h3>
            <p>Recetas Activas</p>
            <span className="stat-change positive">+8% esta semana</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>S/ {systemStats.totalSales || 12500}</h3>
            <p>Ventas del Mes</p>
            <span className="stat-change positive">+23% vs mes anterior</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>98.5%</h3>
            <p>Uptime Sistema</p>
            <span className="stat-change neutral">Excelente</span>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <h3>🏥 Estado del Sistema</h3>
          <div className="system-status">
            <div className="status-item healthy">
              <span className="status-dot"></span>
              <span>Base de Datos</span>
              <span className="status-text">Operativa</span>
            </div>
            <div className="status-item healthy">
              <span className="status-dot"></span>
              <span>API</span>
              <span className="status-text">Funcionando</span>
            </div>
            <div className="status-item warning">
              <span className="status-dot"></span>
              <span>Almacenamiento</span>
              <span className="status-text">78% usado</span>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>📈 Actividad Reciente</h3>
          <div className="activity-feed">
            <div className="activity-item">
              <span className="activity-time">10:30</span>
              <span className="activity-desc">Nuevo usuario registrado</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">10:15</span>
              <span className="activity-desc">Receta aprobada</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">09:45</span>
              <span className="activity-desc">Backup completado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    if (allUsers.length === 0 && !loading) {
      loadAllUsers(1, '');
    }

    return (
      <div className="admin-content-section">
        <div className="section-header">
          <h2>👥 Gestión de Usuarios</h2>
          <button className="primary-btn" onClick={() => showNotification('Función de creación en desarrollo', 'info')}>
            + Nuevo Usuario
          </button>
        </div>

        <div className="search-bar">
          <form onSubmit={(e) => { e.preventDefault(); loadAllUsers(1, usersSearch); }} className="search-form">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍 Buscar</button>
            {usersSearch && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => {
                  setUsersSearch('');
                  loadAllUsers(1, '');
                }}
              >
                ✕ Limpiar
              </button>
            )}
          </form>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className="users-table">
              <div className="table-header">
                <span>Usuario</span>
                <span>Email</span>
                <span>Rol</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {allUsers.length > 0 ? (
                allUsers.map(user => (
                  <div key={user.id} className="table-row">
                    <div className="user-cell">
                      <div className="user-avatar">{user.nombres?.charAt(0) || 'U'}</div>
                      <span>{user.nombres} {user.apellidos}</span>
                    </div>
                    <span>{user.email}</span>
                    <select
                      className="role-select"
                      value={user.role?.id || 1}
                      onChange={(e) => handleChangeUserRole(user.id, parseInt(e.target.value))}
                      disabled={user.role?.codigo === 'ADMIN'}
                    >
                      {systemRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.nombre}</option>
                      ))}
                    </select>
                    <span className={`status-badge ${user.esActivo ? 'active' : 'inactive'}`}>
                      {user.esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="action-buttons">
                      <button 
                        className="action-btn"
                        onClick={() => showNotification('Función de edición en desarrollo', 'info')}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleToggleUserStatus(user.id)}
                        disabled={user.role?.codigo === 'ADMIN'}
                      >
                        {user.esActivo ? '🚫 Desactivar' : '✅ Activar'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </div>

            {usersTotalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => loadAllUsers(usersPage - 1, usersSearch)}
                  disabled={usersPage === 1}
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {usersPage} de {usersTotalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => loadAllUsers(usersPage + 1, usersSearch)}
                  disabled={usersPage === usersTotalPages}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderRecipes = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>🍽️ Gestión de Recetas</h2>
        <button className="primary-btn" onClick={() => navigate('/recipes/create')}>+ Nueva Receta</button>
      </div>
      
      {/* Estadísticas de recetas */}
      <div className="recipes-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{recipesStats.totalRecipes || recipes.length}</h3>
            <p>Total Recetas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{recipesStats.activeRecipes || recipes.length}</h3>
            <p>Recetas Activas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <h3>{recipesStats.totalViews || 0}</h3>
            <p>Total Visualizaciones</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{recipesStats.averageRating || 4.5}</h3>
            <p>Rating Promedio</p>
          </div>
        </div>
      </div>
      
      <div className="recipes-grid">
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-image">
                {recipe.imagenUrl ? (
                  <img src={recipe.imagenUrl} alt={recipe.titulo} />
                ) : (
                  <div className="recipe-placeholder">🍽️</div>
                )}
              </div>
              <div className="recipe-status approved">Aprobada</div>
              <h4>{recipe.titulo}</h4>
              <p>Por: {recipe.autor?.nombres || 'Chef Admin'}</p>
              <div className="recipe-info">
                <span>⏱️ {recipe.tiempoPreparacion}min</span>
                <span>👥 {recipe.porciones} porciones</span>
                <span>📊 {recipe.dificultad?.nombre || 'Medio'}</span>
              </div>
              <div className="recipe-actions">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                >
                  Editar
                </button>
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  Ver
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleToggleRecipeStatus(recipe.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-recipes">
            <p>No hay recetas disponibles</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="primary-btn" onClick={() => loadRecipes()}>
                🔄 Recargar Recetas
              </button>
              <button 
                className="primary-btn" 
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:3002/recipes');
                    const data = await response.json();
                    console.log('Direct test:', data);
                    showNotification(`Test: ${data.recipes?.length || 0} recetas encontradas`, 'info');
                  } catch (error) {
                    console.error('Test error:', error);
                    showNotification('Test falló: Backend no disponible', 'error');
                  }
                }}
              >
                🧪 Test Directo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>🛍️ Gestión de Pedidos</h2>
        <button className="primary-btn" onClick={() => showNotification('Módulo en desarrollo', 'info')}>
          + Nuevo Pedido
        </button>
      </div>
      <div className="orders-content">
        <div className="info-banner">
          <span className="info-icon">🚧</span>
          <div>
            <h3>Módulo en Desarrollo</h3>
            <p>La gestión de pedidos estará disponible próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>📈 Analytics</h2>
        <button className="primary-btn" onClick={loadSystemStats}>
          🔄 Actualizar Datos
        </button>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Usuarios por Rol</h3>
          <div className="chart-container">
            {(systemStats.usersByRole || []).map(role => (
              <div key={role.roleName} className="chart-bar">
                <span className="chart-label">{role.roleName}</span>
                <div className="chart-bar-bg">
                  <div 
                    className="chart-bar-fill"
                    style={{ width: `${systemStats.totalUsers ? (role.count / systemStats.totalUsers) * 100 : 0}%` }}
                  >
                    {role.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Actividad del Sistema</h3>
          <div className="activity-stats">
            <div className="activity-stat">
              <span className="activity-icon">👥</span>
              <div>
                <p className="activity-value">{systemStats.totalUsers || 0}</p>
                <p className="activity-label">Total Usuarios</p>
              </div>
            </div>
            <div className="activity-stat">
              <span className="activity-icon">🍽️</span>
              <div>
                <p className="activity-value">{recipes.length}</p>
                <p className="activity-label">Total Recetas</p>
              </div>
            </div>
            <div className="activity-stat">
              <span className="activity-icon">✅</span>
              <div>
                <p className="activity-value">{systemStats.activeUsers || 0}</p>
                <p className="activity-label">Usuarios Activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>📋 Reportes</h2>
        <button className="primary-btn" onClick={loadReports}>
          🔄 Generar Reportes
        </button>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">📄</div>
          <h3>Reporte de Usuarios</h3>
          <p>Estadísticas detalladas de usuarios registrados</p>
          <div className="report-stat">
            <strong>{systemStats.totalUsers || 0}</strong> usuarios totales
          </div>
          <button className="report-btn" onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
            Descargar PDF
          </button>
        </div>
        <div className="report-card">
          <div className="report-icon">🍽️</div>
          <h3>Reporte de Recetas</h3>
          <p>Análisis de recetas y popularidad</p>
          <div className="report-stat">
            <strong>{recipes.length}</strong> recetas activas
          </div>
          <button className="report-btn" onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
            Descargar PDF
          </button>
        </div>
        <div className="report-card">
          <div className="report-icon">📈</div>
          <h3>Reporte de Actividad</h3>
          <p>Métricas de actividad del sistema</p>
          <div className="report-stat">
            <strong>{systemStats.activeUsers || 0}</strong> usuarios activos
          </div>
          <button className="report-btn" onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
            Descargar PDF
          </button>
        </div>
        <div className="report-card">
          <div className="report-icon">🔒</div>
          <h3>Reporte de Seguridad</h3>
          <p>Análisis de seguridad y accesos</p>
          <div className="report-stat">
            <strong>0</strong> incidentes reportados
          </div>
          <button className="report-btn" onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>⚙️ Configuración</h2>
        <p>Ajustes generales del sistema</p>
      </div>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h3>⚙️ Configuración General</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Nombre del Sistema</label>
              <input type="text" defaultValue="CookSync" readOnly />
            </div>
            <div className="form-group">
              <label>Email de Contacto</label>
              <input type="email" defaultValue="admin@cooksync.com" readOnly />
            </div>
            <div className="form-group">
              <label>Zona Horaria</label>
              <select defaultValue="America/Lima" disabled>
                <option value="America/Lima">Lima (UTC-5)</option>
                <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                <option value="America/New_York">Nueva York (UTC-5)</option>
              </select>
            </div>
            <button className="primary-btn" onClick={() => showNotification('Cambios guardados exitosamente', 'success')}>
              💾 Guardar Cambios
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h3>🔔 Notificaciones</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <span>Notificaciones por Email</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <span>Notificaciones Push</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <span>Alertas de Sistema</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>💾 Backup y Restauración</h3>
          <p>Último backup: Hace 2 días</p>
          <button className="primary-btn" onClick={() => showNotification('Backup iniciado', 'success')}>
            🔄 Crear Backup Ahora
          </button>
          <button className="secondary-btn" style={{marginTop: '10px'}} onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
            📂 Restaurar desde Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2>🔒 Seguridad</h2>
        <p>Configuración de seguridad del sistema</p>
      </div>
      
      <div className="security-grid">
        <div className="security-card">
          <h3>🔑 Autenticación</h3>
          <div className="security-info">
            <div className="security-item">
              <span>Autenticación de 2 Factores</span>
              <span className="security-status enabled">✅ Habilitado</span>
            </div>
            <div className="security-item">
              <span>Expiración de Sesión</span>
              <span className="security-value">24 horas</span>
            </div>
            <div className="security-item">
              <span>Intentos de Login Fallidos</span>
              <span className="security-value">5 máximo</span>
            </div>
          </div>
        </div>

        <div className="security-card">
          <h3>🛡️ Protección</h3>
          <div className="security-info">
            <div className="security-item">
              <span>Firewall</span>
              <span className="security-status enabled">✅ Activo</span>
            </div>
            <div className="security-item">
              <span>SSL/TLS</span>
              <span className="security-status enabled">✅ Configurado</span>
            </div>
            <div className="security-item">
              <span>Rate Limiting</span>
              <span className="security-status enabled">✅ Activo</span>
            </div>
          </div>
        </div>

        <div className="security-card">
          <h3>📃 Logs de Seguridad</h3>
          <div className="security-logs">
            <div className="log-item">
              <span className="log-time">Hace 5 min</span>
              <span className="log-message">Login exitoso - admin@cooksync.com</span>
            </div>
            <div className="log-item">
              <span className="log-time">Hace 1 hora</span>
              <span className="log-message">Cambio de configuración detectado</span>
            </div>
            <div className="log-item">
              <span className="log-time">Hace 3 horas</span>
              <span className="log-message">Backup completado exitosamente</span>
            </div>
          </div>
          <button className="primary-btn" onClick={() => showNotification('Mostrando logs completos', 'info')}>
            Ver Todos los Logs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🍳</span>
            <span className="logo-text">CookSync</span>
          </div>
          <div className="admin-info">
            <img 
              src={user.fotoPerfil || '/admin-avatar.png'} 
              alt="Admin"
              className="admin-avatar"
            />
            <div className="admin-details">
              <span className="admin-name">{user.nombres}</span>
              <span className="admin-role">Administrador</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            logout();
            showNotification("Sesión cerrada exitosamente", "success");
            navigate('/', { replace: true });
          }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div className="header-title">
            <h1>Panel de Administración</h1>
            <p>Gestiona tu plataforma CookSync</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="profile-btn">
              <img src={user.fotoPerfil || '/admin-avatar.png'} alt="Profile" />
            </button>
          </div>
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && confirmAction && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Confirmar Acción</h3>
            <p>{confirmAction.message}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmAction.onConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
