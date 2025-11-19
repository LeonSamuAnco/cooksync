import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import vendorService from '../../services/vendorService';
import './VendorProfile.css';

const VendorProfile = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // eslint-disable-line no-unused-vars
  const { showNotification } = useNotification();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [stats, setStats] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState({ ingredients: [], summary: {} });
  const [campaigns, setCampaigns] = useState({ campaigns: [], stats: {} });
  const [settings, setSettings] = useState({ profile: {}, preferences: {}, paymentMethods: [] });
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [ordersPage, setOrdersPage] = useState(1);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadStats(),
          loadProducts(),
          loadOrders(),
          loadAnalytics(),
        ]);
      } catch (error) {
        showNotification('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadStats = async () => {
    try {
      const data = await vendorService.getVendorStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadProducts = async (page = 1) => {
    try {
      const data = await vendorService.getVendorProducts(user.id, page, 10);
      setProducts(data.products || []);
      setProductsPage(page);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]);
    }
  };

  const loadOrders = async (page = 1) => {
    try {
      const data = await vendorService.getVendorOrders(user.id, page, 10);
      setOrders(data.orders || []);
      setOrdersPage(page);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setOrders([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await vendorService.getVendorAnalytics(user.id, 30);
      setAnalytics(data);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const loadReviews = async () => {
    try {
      const data = await vendorService.getVendorReviews(user.id, 1, 10);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await vendorService.getVendorCustomers(user.id);
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await vendorService.getVendorInventory(user.id);
      setInventory(data);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await vendorService.getVendorCampaigns(user.id);
      setCampaigns(data);
    } catch (error) {
      console.error('Error cargando campañas:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await vendorService.getVendorSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const loadNotifications = async () => {
    try {
      const data = await vendorService.getVendorNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      await vendorService.toggleProduct(user.id, productId);
      showNotification('Estado del producto actualizado', 'success');
      loadProducts(productsPage);
    } catch (error) {
      showNotification('Error al actualizar producto', 'error');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'products', icon: '🛍️', label: 'Productos' },
    { id: 'orders', icon: '📦', label: 'Pedidos' },
    { id: 'inventory', icon: '📋', label: 'Inventario' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'customers', icon: '👥', label: 'Clientes' },
    { id: 'marketing', icon: '📢', label: 'Marketing' },
    { id: 'settings', icon: '⚙️', label: 'Configuración' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'inventory':
        return renderInventory();
      case 'analytics':
        return renderAnalytics();
      case 'customers':
        return renderCustomers();
      case 'marketing':
        return renderMarketing();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="vendor-content-section">
      <div className="section-header">
        <h2>📊 Dashboard de Ventas</h2>
        <p>Resumen de tu negocio en CookSync</p>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>{stats.totalRecipes || 0}</h3>
            <p>Recetas Activas</p>
            <span className="stat-change positive">Total publicadas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalViews || 0}</h3>
            <p>Vistas Totales</p>
            <span className="stat-change positive">Recetas preparadas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>S/ {stats.totalSales || 0}</h3>
            <p>Ingresos Estimados</p>
            <span className="stat-change positive">Basado en vistas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.averageRating?.toFixed(1) || 0}</h3>
            <p>Rating Promedio</p>
            <span className="stat-change neutral">{stats.totalReviews || 0} reseñas</span>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <h3>📈 Ventas Recientes</h3>
          <div className="sales-chart">
            <div className="chart-placeholder">
              <p>Gráfico de ventas de los últimos 7 días</p>
              <div className="mock-chart">
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '45%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
                <div className="chart-bar" style={{height: '85%'}}></div>
                <div className="chart-bar" style={{height: '95%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>🔔 Alertas Importantes</h3>
          <div className="alerts-list">
            <div className="alert-item warning">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">3 productos con stock bajo</span>
            </div>
            <div className="alert-item info">
              <span className="alert-icon">📦</span>
              <span className="alert-text">5 pedidos pendientes de envío</span>
            </div>
            <div className="alert-item success">
              <span className="alert-icon">⭐</span>
              <span className="alert-text">2 nuevas reseñas positivas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="vendor-content-section">
      <div className="section-header">
        <h2>🛍️ Gestión de Productos</h2>
        <button className="primary-btn" onClick={() => navigate('/recipes/create')}>
          + Nueva Receta
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">🍽️</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>S/ {product.price.toFixed(2)}</p>
                  <span className={`product-status ${product.status}`}>
                    {product.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="product-meta">
                    <span>⭐ {product.rating?.toFixed(1) || 0}</span>
                    <span>👁️ {product.views || 0} vistas</span>
                  </div>
                </div>
                <div className="product-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => navigate(`/recipes/${product.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/recipes/${product.id}`)}
                  >
                    Ver
                  </button>
                  <button 
                    className="toggle-btn"
                    onClick={() => handleToggleProduct(product.id)}
                  >
                    {product.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No tienes productos publicados</p>
              <button className="primary-btn" onClick={() => navigate('/recipes/create')}>
                Crear Primera Receta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="vendor-content-section">
      <div className="section-header">
        <h2>📦 Pedidos (Recetas Preparadas)</h2>
        <p>{orders.length} pedidos totales</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      ) : (
        <div className="orders-table">
          {orders.length > 0 ? (
            <>
              <div className="table-header">
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Receta</span>
                <span>Fecha</span>
                <span>Monto</span>
              </div>
              {orders.map(order => (
                <div key={order.id} className="table-row">
                  <span>{order.orderNumber}</span>
                  <span>{order.customer}</span>
                  <span>{order.recipeName}</span>
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <span>S/ {order.amount.toFixed(2)}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="no-data">
              <p>No hay pedidos registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderInventory = () => {
    if (inventory.ingredients.length === 0 && !loading) {
      loadInventory();
    }

    return (
      <div className="vendor-content-section">
        <div className="section-header">
          <h2>📋 Control de Inventario</h2>
          <button className="primary-btn" onClick={() => showNotification('Función en desarrollo', 'info')}>
            + Agregar Ingrediente
          </button>
        </div>
        
        {/* Resumen del inventario */}
        <div className="inventory-summary">
          <div className="summary-card">
            <h4>Total Items</h4>
            <p className="big-number">{inventory.summary?.totalItems || 0}</p>
          </div>
          <div className="summary-card warning">
            <h4>Stock Bajo</h4>
            <p className="big-number">{inventory.summary?.lowStockItems || 0}</p>
          </div>
          <div className="summary-card danger">
            <h4>Sin Stock</h4>
            <p className="big-number">{inventory.summary?.outOfStockItems || 0}</p>
          </div>
          <div className="summary-card">
            <h4>Valor Total</h4>
            <p className="big-number">S/ {inventory.summary?.totalValue || 0}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando inventario...</p>
          </div>
        ) : (
          <div className="inventory-table">
            {inventory.ingredients?.length > 0 ? (
              <>
                <div className="table-header">
                  <span>Ingrediente</span>
                  <span>Categoría</span>
                  <span>Stock Actual</span>
                  <span>Stock Mínimo</span>
                  <span>Costo</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {inventory.ingredients.map(ingredient => (
                  <div key={ingredient.id} className="table-row">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span>{ingredient.category}</span>
                    <span>{ingredient.currentStock} {ingredient.unit}</span>
                    <span>{ingredient.minStock} {ingredient.unit}</span>
                    <span>S/ {ingredient.cost}</span>
                    <span className={`status ${ingredient.status}`}>
                      {ingredient.status === 'in_stock' && '✅ En Stock'}
                      {ingredient.status === 'low_stock' && '⚠️ Stock Bajo'}
                      {ingredient.status === 'out_of_stock' && '❌ Sin Stock'}
                    </span>
                    <span>
                      <button 
                        className="edit-btn small"
                        onClick={() => showNotification('Edición en desarrollo', 'info')}
                      >
                        Editar
                      </button>
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="no-data">
                <p>No hay ingredientes en el inventario</p>
                <button className="primary-btn" onClick={() => showNotification('Función en desarrollo', 'info')}>
                  Agregar Primer Ingrediente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="vendor-content-section">
      <div className="section-header">
        <h2>📈 Analytics de Ventas</h2>
        <p>Últimos 30 días</p>
      </div>
      
      <div className="analytics-stats">
        <div className="stat-card">
          <h4>Ingresos Totales</h4>
          <p className="big-number">S/ {analytics.totalRevenue || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Pedidos Totales</h4>
          <p className="big-number">{analytics.totalOrders || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Valor Promedio</h4>
          <p className="big-number">S/ {analytics.averageOrderValue || 0}</p>
        </div>
      </div>

      {analytics.topRecipes?.length > 0 && (
        <div className="widget">
          <h3>🏆 Recetas Más Populares</h3>
          <div className="top-products-list">
            {analytics.topRecipes.map((recipe, index) => (
              <div key={recipe.id} className="top-product-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{recipe.name}</span>
                <span className="orders">{recipe.orders} pedidos</span>
                <span className="revenue">S/ {recipe.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomers = () => {
    if (customers.length === 0 && !loading) {
      loadCustomers();
    }

    return (
      <div className="vendor-content-section">
        <div className="section-header">
          <h2>👥 Mis Clientes</h2>
          <p>{customers.length} clientes totales</p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : (
          <div className="customers-grid">
            {customers.length > 0 ? (
              customers.map(customer => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-avatar">
                    {customer.avatar ? (
                      <img src={customer.avatar} alt={customer.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {customer.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="customer-info">
                    <h4>{customer.name}</h4>
                    <p>{customer.email}</p>
                    <div className="customer-stats">
                      <span>📦 {customer.totalOrders} pedidos</span>
                      <span>💰 S/ {customer.totalSpent}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>Aún no tienes clientes</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMarketing = () => {
    if (campaigns.campaigns.length === 0 && !loading) {
      loadCampaigns();
    }

    return (
      <div className="vendor-content-section">
        <div className="section-header">
          <h2>📢 Marketing y Promociones</h2>
          <button className="primary-btn" onClick={() => showNotification('Función en desarrollo', 'info')}>
            + Nueva Campaña
          </button>
        </div>
        
        {/* Estadísticas de marketing */}
        <div className="marketing-stats">
          <div className="stat-card">
            <h4>Campañas Totales</h4>
            <p className="big-number">{campaigns.stats?.totalCampaigns || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Campañas Activas</h4>
            <p className="big-number">{campaigns.stats?.activeCampaigns || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Total Vistas</h4>
            <p className="big-number">{campaigns.stats?.totalViews || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Conversiones</h4>
            <p className="big-number">{campaigns.stats?.totalConversions || 0}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando campañas...</p>
          </div>
        ) : (
          <div className="campaigns-list">
            {campaigns.campaigns?.length > 0 ? (
              campaigns.campaigns.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <h4>{campaign.name}</h4>
                    <span className={`campaign-status ${campaign.status}`}>
                      {campaign.status === 'active' && '🟢 Activa'}
                      {campaign.status === 'scheduled' && '🟡 Programada'}
                      {campaign.status === 'paused' && '🟠 Pausada'}
                      {campaign.status === 'ended' && '🔴 Finalizada'}
                    </span>
                  </div>
                  <div className="campaign-info">
                    <div className="campaign-dates">
                      <span>📅 {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="campaign-metrics">
                      <span>👁️ {campaign.views} vistas</span>
                      <span>🎯 {campaign.conversions} conversiones</span>
                      {campaign.discount && <span>💰 {campaign.discount}% descuento</span>}
                    </div>
                  </div>
                  <div className="campaign-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => showNotification('Edición en desarrollo', 'info')}
                    >
                      Editar
                    </button>
                    <button 
                      className="view-btn"
                      onClick={() => showNotification('Ver detalles en desarrollo', 'info')}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No tienes campañas de marketing</p>
                <button className="primary-btn" onClick={() => showNotification('Función en desarrollo', 'info')}>
                  Crear Primera Campaña
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    if (Object.keys(settings.profile).length === 0 && !loading) {
      loadSettings();
    }

    return (
      <div className="vendor-content-section">
        <div className="section-header">
          <h2>⚙️ Configuración de Tienda</h2>
          <button className="primary-btn" onClick={() => showNotification('Función en desarrollo', 'info')}>
            Guardar Cambios
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <div className="settings-sections">
            {/* Perfil del negocio */}
            <div className="settings-section">
              <h3>🏪 Perfil del Negocio</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nombre del Negocio</label>
                  <input 
                    type="text" 
                    value={settings.profile?.businessName || ''} 
                    placeholder="Mi Cocina Gourmet"
                    onChange={() => showNotification('Función en desarrollo', 'info')}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea 
                    value={settings.profile?.description || ''} 
                    placeholder="Describe tu negocio..."
                    onChange={() => showNotification('Función en desarrollo', 'info')}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input 
                      type="tel" 
                      value={settings.profile?.phone || ''} 
                      placeholder="+51 999 888 777"
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={settings.profile?.email || ''} 
                      placeholder="contacto@micocina.com"
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input 
                    type="text" 
                    value={settings.profile?.address || ''} 
                    placeholder="Av. Principal 123, Arequipa"
                    onChange={() => showNotification('Función en desarrollo', 'info')}
                  />
                </div>
              </div>
            </div>

            {/* Preferencias de notificaciones */}
            <div className="settings-section">
              <h3>🔔 Notificaciones</h3>
              <div className="settings-toggles">
                <div className="toggle-item">
                  <span>Nuevos pedidos</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.notifications?.newOrders || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span>Stock bajo</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.notifications?.lowStock || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span>Nuevas reseñas</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.notifications?.newReviews || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span>Marketing</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.notifications?.marketing || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="settings-section">
              <h3>💳 Métodos de Pago</h3>
              <div className="payment-methods">
                {settings.paymentMethods?.map(method => (
                  <div key={method.id} className="payment-method">
                    <span>{method.name}</span>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={method.enabled}
                        onChange={() => showNotification('Función en desarrollo', 'info')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración del negocio */}
            <div className="settings-section">
              <h3>🏢 Configuración del Negocio</h3>
              <div className="settings-toggles">
                <div className="toggle-item">
                  <span>Mostrar teléfono públicamente</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.business?.showPhone || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span>Mostrar email públicamente</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.business?.showEmail || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span>Permitir mensajes de clientes</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences?.business?.allowMessages || false}
                      onChange={() => showNotification('Función en desarrollo', 'info')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vendor-panel">
      {/* Sidebar */}
      <div className="vendor-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">Mi Tienda</span>
          </div>
          <div className="vendor-info">
            <img 
              src={user.fotoPerfil || '/vendor-avatar.png'} 
              alt="Vendor"
              className="vendor-avatar"
            />
            <div className="vendor-details">
              <span className="vendor-name">{user.nombres}</span>
              <span className="vendor-role">Vendedor</span>
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
      <div className="vendor-main">
        <div className="vendor-header">
          <div className="header-title">
            <h1>Panel de Vendedor</h1>
            <p>Gestiona tu tienda en CookSync</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">5</span>
            </button>
            <button className="profile-btn">
              <img src={user.fotoPerfil || '/vendor-avatar.png'} alt="Profile" />
            </button>
          </div>
        </div>

        <div className="vendor-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
