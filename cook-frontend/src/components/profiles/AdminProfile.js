import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
// eslint-disable-next-line no-unused-vars
import productsService from '../../services/productsService';
import celularService from '../../services/celularService';
import tortasService from '../../services/tortasService';
import lugarService from '../../services/lugarService';
import deporteService from '../../services/deporteService';
import './AdminProfile.css';

const AdminProfile = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // eslint-disable-line no-unused-vars
  const { showNotification } = useNotification();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [systemStats, setSystemStats] = useState({});
  // eslint-disable-next-line no-unused-vars
  // const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemRoles, setSystemRoles] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [reports, setReports] = useState({});
  const [recipes, setRecipes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [recipesStats, setRecipesStats] = useState({});
  const [categories, setCategories] = useState([]); // recipe categories (admin CRUD)
  const [selectedCategory, setSelectedCategory] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [categoryRecipes, setCategoryRecipes] = useState([]); // recetas de la categoría seleccionada
  // eslint-disable-next-line no-unused-vars
  const [loadingCategoryRecipes, setLoadingCategoryRecipes] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [unifiedCategories, setUnifiedCategories] = useState([]); // categorías de la Home (recetas, celulares, tortas, lugares, etc.)
  const [loading, setLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    rolId: 1,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [hasAttemptedUsersLoad, setHasAttemptedUsersLoad] = useState(false);
  const [backendError, setBackendError] = useState(false);

  // Estados para tabla CRUD de categorías
  const [showCategoryDataModal, setShowCategoryDataModal] = useState(false);
  const [selectedCategoryForData, setSelectedCategoryForData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    sku: '',
    categoriaId: null,
  });

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      // Primero probar la conexión
      await adminService.testConnection();

      // Luego cargar datos reales
      await Promise.all([
        loadSystemStats(),
        loadSystemRoles(),
        loadRecipes(),
        loadCategories(),
        loadUnifiedCategories(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setBackendError(true);
      showNotification('⚠️ Backend no disponible. Verifica que el servidor esté corriendo en puerto 3002', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const list = await adminService.getRecipeCategories();
      setCategories(list);
      if (list && list.length && !selectedCategory) setSelectedCategory(list[0]);
    } catch (e) {
      console.error('Error loading categories', e);
      setCategories([]);
    }
  };

  // Cargar categorías unificadas (como las que ves en Home)
  const loadUnifiedCategories = async () => {
    try {
      // Mostrar SOLO las 8 categorías principales de la Home con tipos específicos
      const fixed = [
        { id: 'recipes', nombre: 'Recetas', displayName: '🍳 Recetas', type: 'recipe', icon: '🍔', categoryId: 1 },
        { id: 'phones', nombre: 'Celulares', displayName: '📱 Celulares', type: 'celular', icon: '📱', categoryId: 2 },
        { id: 'cakes', nombre: 'Tortas', displayName: '🧁 Tortas', type: 'torta', icon: '🧁', categoryId: 3 },
        { id: 'places', nombre: 'Lugares', displayName: '🏡 Lugares', type: 'lugar', icon: '🏡', categoryId: 4 },
        { id: 'health', nombre: 'Salud & Belleza', displayName: '🧴 Salud & Belleza', type: 'product', icon: '🧴', categoryId: 5 },
        { id: 'sports', nombre: 'Deportes', displayName: '🏃 Deportes', type: 'deporte', icon: '🏃', categoryId: 6 },
        { id: 'books', nombre: 'Libros', displayName: '📖 Libros', type: 'product', icon: '📖', categoryId: 7 },
        { id: 'toys', nombre: 'Juguetes', displayName: '🧸 Juguetes', type: 'product', icon: '🧸', categoryId: 8 },
      ];

      // Si el backend devolviera algo extra, lo ignoramos explícitamente
      setUnifiedCategories(fixed);
    } catch (e) {
      console.error('Error loading unified categories', e);
      setUnifiedCategories([]);
    }
  };

  // ========================================
  // FUNCIONES CRUD PARA CATEGORÍAS
  // ========================================

  const handleCategoryCardClick = async (category) => {
    setSelectedCategoryForData(category);
    setLoadingCategoryData(true);
    setShowCategoryDataModal(true);

    try {
      let data = [];
      let stats = {};

      // Cargar datos según el tipo de categoría
      switch (category.type) {
        case 'recipe':
          // Para recetas, usar el servicio de admin
          const recipeResponse = await adminService.getAllRecipes(1, 1000);
          data = recipeResponse.recipes || [];
          stats = { total: data.length };
          break;

        case 'celular':
          // Para celulares - obtener todos (sin parámetros que puedan causar error)
          const celularResponse = await celularService.getAll();

          let celularesRaw = celularResponse.data || celularResponse.celulares || celularResponse || [];
          console.log('📱 Datos raw de celulares:', celularesRaw.slice(0, 2)); // Mostrar solo los primeros 2 para debug

          // Si hay paginación, obtener todas las páginas
          if (celularResponse.totalPages && celularResponse.totalPages > 1) {
            for (let page = 2; page <= celularResponse.totalPages; page++) {
              try {
                const pageResponse = await celularService.getAll({ page });
                const pageData = pageResponse.data || pageResponse.celulares || pageResponse || [];
                // eslint-disable-next-line no-loop-func
                const newItems = pageData.filter(newItem =>
                  !celularesRaw.some(existingItem => existingItem.id === newItem.id)
                );
                celularesRaw = [...celularesRaw, ...newItems];
              } catch (pageError) {
                console.warn(`⚠️ Error obteniendo página ${page}:`, pageError);
                break;
              }
            }
          }

          // Normalizar datos de celulares para la tabla
          data = celularesRaw.map(celular => ({
            id: celular.id,
            nombre: celular.nombre || celular.modelo || `Celular #${celular.id}`,
            descripcion: celular.descripcion || `${celular.marca?.nombre || ''} ${celular.modelo || ''}`.trim(),
            precio: celular.precio || celular.precioBase || 0,
            stock: celular.stock || 0,
            esActivo: celular.esActivo !== false,
            imagenUrl: celular.imagenPrincipal || celular.imagen,
            // Datos adicionales específicos de celulares
            marca: celular.marca?.nombre,
            modelo: celular.modelo,
            ram: celular.ram,
            almacenamiento: celular.almacenamiento
          }));

          stats = { total: celularResponse.total || data.length };
          break;

        case 'torta':
          // Para tortas - obtener todas
          const tortaResponse = await tortasService.getAll();
          let tortasRaw = tortaResponse.data || tortaResponse.tortas || tortaResponse || [];

          // Normalizar datos de tortas para la tabla
          data = tortasRaw.map(torta => ({
            id: torta.id,
            nombre: torta.nombre || `Torta #${torta.id}`,
            descripcion: torta.descripcion || `${torta.torta_sabores?.nombre || ''} ${torta.torta_coberturas?.nombre || ''}`.trim(),
            precio: torta.precio || torta.precioBase || 0,
            stock: torta.stock || 0,
            esActivo: torta.esActivo !== false,
            imagenUrl: torta.imagenPrincipal || torta.imagen,
            // Datos específicos de tortas
            sabor: torta.torta_sabores?.nombre,
            cobertura: torta.torta_coberturas?.nombre,
            ocasion: torta.torta_ocasiones?.nombre
          }));

          stats = { total: tortaResponse.total || data.length };
          break;

        case 'lugar':
          // Para lugares - obtener todos
          const lugarResponse = await lugarService.getAll();

          let lugaresRaw = lugarResponse.data || lugarResponse.lugares || lugarResponse || [];
          console.log('🏡 Datos raw de lugares:', lugaresRaw.slice(0, 2));

          // Normalizar datos de lugares para la tabla
          data = lugaresRaw.map(lugar => ({
            id: lugar.id,
            nombre: lugar.nombre || `Lugar #${lugar.id}`,
            descripcion: lugar.descripcion || `${lugar.lugar_tipos?.nombre || ''} en ${lugar.ciudad || ''}`.trim(),
            precio: lugar.precio || lugar.precioPromedio || 0,
            stock: lugar.capacidad || 0, // Usar capacidad como "stock"
            esActivo: lugar.esActivo !== false,
            imagenUrl: lugar.imagenPrincipal || lugar.imagen,
            // Datos específicos de lugares
            tipo: lugar.lugar_tipos?.nombre,
            ciudad: lugar.ciudad,
            pais: lugar.pais,
            capacidad: lugar.capacidad
          }));

          stats = { total: lugarResponse.total || data.length };
          break;

        case 'deporte':
          // Para deportes - obtener todos
          const deporteResponse = await deporteService.getAll();

          let deportesRaw = deporteResponse.data || deporteResponse.deportes || deporteResponse || [];
          console.log('🏃 Datos raw de deportes:', deportesRaw.slice(0, 2));

          // Normalizar datos de deportes para la tabla
          data = deportesRaw.map(deporte => ({
            id: deporte.id,
            nombre: deporte.nombre || `Producto Deportivo #${deporte.id}`,
            descripcion: deporte.descripcion || `${deporte.deporte_marcas?.nombre || ''} ${deporte.deporte_tipos?.nombre || ''}`.trim(),
            precio: deporte.precio || deporte.precioBase || 0,
            stock: deporte.stock || 0,
            esActivo: deporte.esActivo !== false,
            imagenUrl: deporte.imagenPrincipal || deporte.imagen,
            // Datos específicos de deportes
            marca: deporte.deporte_marcas?.nombre,
            tipo: deporte.deporte_tipos?.nombre,
            genero: deporte.genero,
            talla: deporte.talla
          }));

          stats = { total: deporteResponse.total || data.length };
          break;

        case 'product':
          // Para productos genéricos
          if (category.categoryId) {
            const products = await productsService.getAllProducts({ categoryId: category.categoryId });
            const productStats = await productsService.getCategoryStats(category.categoryId);
            data = products;
            stats = productStats;
          }
          break;

        default:
          console.warn('Tipo de categoría no reconocido:', category.type);
          data = [];
          stats = { total: 0 };
      }

      setCategoryData(data);
      setCategoryStats(stats);

    } catch (error) {
      console.error('Error loading category data:', error);
      showNotification('Error al cargar datos de la categoría', 'error');
      setCategoryData([]);
      setCategoryStats({ total: 0 });
    } finally {
      setLoadingCategoryData(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagenUrl: '',
      sku: '',
      categoriaId: selectedCategoryForData?.categoryId || null,
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio: product.precio || 0,
      stock: product.stock || 0,
      imagenUrl: product.imagenUrl || '',
      sku: product.sku || '',
      categoriaId: product.categoriaId || null,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        // Actualizar producto existente
        await productsService.updateProduct(editingProduct.id, productFormData);
        showNotification('Producto actualizado exitosamente', 'success');
      } else {
        // Crear nuevo producto
        await productsService.createProduct(productFormData);
        showNotification('Producto creado exitosamente', 'success');
      }
      setShowProductModal(false);
      // Recargar datos de la categoría
      if (selectedCategoryForData) {
        handleCategoryCardClick(selectedCategoryForData);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error al guardar producto', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    setConfirmAction({
      message: '¿Estás seguro de eliminar este producto?',
      onConfirm: async () => {
        try {
          await productsService.deleteProduct(productId);
          showNotification('Producto eliminado exitosamente', 'success');
          setShowConfirmModal(false);
          // Recargar datos de la categoría
          if (selectedCategoryForData) {
            handleCategoryCardClick(selectedCategoryForData);
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          showNotification('Error al eliminar producto', 'error');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      await productsService.toggleProductStatus(productId);
      showNotification('Estado del producto actualizado', 'success');
      // Recargar datos de la categoría
      if (selectedCategoryForData) {
        handleCategoryCardClick(selectedCategoryForData);
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      showNotification('Error al cambiar estado del producto', 'error');
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

  const loadAllUsers = async (page = 1, search = '') => {
    // Evitar bucle infinito
    if (hasAttemptedUsersLoad && backendError) {
      console.warn('Backend error detected, skipping user load to prevent infinite loop');
      return;
    }

    try {
      setLoading(true);
      setHasAttemptedUsersLoad(true);
      const result = await adminService.getAllUsers(page, 10, search);

      if (result && result.users) {
        setAllUsers(result.users);
        setUsersPage(page);
        setUsersSearch(search);
        setUsersTotalPages(Math.ceil((result.total || 0) / 10));
        setBackendError(false);
      } else {
        setAllUsers([]);
        setBackendError(true);
      }
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      setBackendError(true);
      setAllUsers([]);
      showNotification('⚠️ No se pueden cargar usuarios. Backend no disponible.', 'error');
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

      // Método 1: Intentar endpoint directo de recetas
      try {
        const directResponse = await fetch('http://localhost:3002/recipes');

        if (directResponse.ok) {
          const directData = await directResponse.json();

          if (directData.recipes && Array.isArray(directData.recipes)) {
            setRecipes(directData.recipes);
            showNotification(`✅ ${directData.recipes.length} recetas cargadas desde API principal`, 'success');
            return;
          }
        } else {
        }
      } catch (directError) {
        console.log('Direct endpoint error:', directError.message);
      }

      // Método 2: Intentar endpoint de admin
      try {
        const adminData = await adminService.getAllRecipes(1, 50);

        if (adminData && adminData.recipes && Array.isArray(adminData.recipes)) {
          setRecipes(adminData.recipes);
          showNotification(`✅ ${adminData.recipes.length} recetas cargadas desde Admin API`, 'success');
          return;
        }
      } catch (adminError) {
        console.log('Admin endpoint error:', adminError.message);
      }

      // Método 3: Datos de prueba como último recurso
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



  const handleDeleteUser = async (userId, userName) => {
    setConfirmAction({
      message: `¿Estás seguro de eliminar permanentemente al usuario "${userName}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const result = await adminService.deleteUser(userId);
          showNotification(result.message, 'success');
          if (activeSection === 'users') {
            await loadAllUsers(usersPage, usersSearch);
          }
          await loadSystemStats();
        } catch (error) {
          console.error('Error deleting user:', error);
          showNotification('Error al eliminar usuario', 'error');
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      email: user.email || '',
      telefono: user.telefono || '',
      rolId: user.role?.id || 1,
    });
    setShowUserModal(true);
  };

  const handleSaveUserEdit = async () => {
    try {
      // Actualizar rol si cambió
      if (editUserForm.rolId !== editingUser.role?.id) {
        await adminService.changeUserRole(editingUser.id, editUserForm.rolId);
      }

      showNotification('Usuario actualizado exitosamente', 'success');
      setShowUserModal(false);
      setEditingUser(null);

      // Recargar usuarios
      if (activeSection === 'users') {
        await loadAllUsers(usersPage, usersSearch);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error al actualizar usuario', 'error');
    }
  };

  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  // const handleToggleRecipeStatus = async (recipeId) => {
  //   setConfirmAction({
  //     message: '¿Estás seguro de cambiar el estado de esta receta?',
  //     onConfirm: async () => {
  //       try {
  //         const result = await adminService.toggleRecipeStatus(recipeId);
  //         showNotification(result.message || 'Estado de receta cambiado', 'success');
  //         await loadRecipes();
  //       } catch (error) {
  //         console.error('Error toggling recipe status:', error);
  //         showNotification('Error al cambiar estado de la receta', 'error');
  //       } finally {
  //         setShowConfirmModal(false);
  //       }
  //     }
  //   });
  //   setShowConfirmModal(true);
  // };

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', active: true },
    { id: 'users', icon: '👥', label: 'Usuarios' },
    { id: 'categories', icon: '🗂️', label: 'Categorías' },
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
      case 'categories':
        return renderCategories();
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
    // Cargar usuarios solo una vez al renderizar la sección
    if (allUsers.length === 0 && !loading && !hasAttemptedUsersLoad && !backendError) {
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

        {backendError ? (
          <div className="no-data-message" style={{
            padding: '40px',
            textAlign: 'center',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '2px solid #ffc107'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '10px' }}>⚠️ Backend No Disponible</h3>
            <p style={{ color: '#856404', marginBottom: '20px' }}>
              El servidor backend no está respondiendo. Por favor, sigue estos pasos:
            </p>
            <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
              <ol style={{ color: '#333', lineHeight: '1.8' }}>
                <li><strong>Abre una nueva terminal</strong></li>
                <li>Navega a: <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px' }}>cd cook-backend</code></li>
                <li>Ejecuta: <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px' }}>npm run start:dev</code></li>
                <li>Espera el mensaje: <em>"Nest application successfully started"</em></li>
                <li>Haz click en el botón de abajo para reintentar</li>
              </ol>
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                setBackendError(false);
                setHasAttemptedUsersLoad(false);
                loadInitialData();
              }}
              style={{ marginTop: '20px' }}
            >
              🔄 Reintentar Conexión
            </button>
          </div>
        ) : loading ? (
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
                    <span className="role-badge">{user.role?.nombre || 'Sin rol'}</span>
                    <span className={`status-badge ${user.esActivo ? 'active' : 'inactive'}`}>
                      {user.esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => handleEditUser(user)}
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
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user.id, `${user.nombres} ${user.apellidos}`)}
                        disabled={user.role?.codigo === 'ADMIN'}
                        title="Eliminar usuario permanentemente"
                      >
                        🗑️ Eliminar
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

  const handleCreateCategory = async () => {
    const nombre = prompt('Nombre de la categoría:');
    if (!nombre) return;
    const icono = prompt('Icono (emoji o nombre opcional):') || undefined;
    const color = prompt('Color HEX (opcional, ej. #667eea):') || undefined;
    try {
      await adminService.createRecipeCategory({ nombre, icono, color });
      await loadCategories();
      showNotification('Categoría creada', 'success');
    } catch (e) {
      showNotification('Error al crear categoría', 'error');
    }
  };

  const handleUpdateCategory = async (cat) => {
    const nombre = prompt('Editar nombre:', cat.nombre) || cat.nombre;
    const icono = prompt('Editar icono:', cat.icono || '') || undefined;
    const color = prompt('Editar color HEX:', cat.color || '') || undefined;
    try {
      await adminService.updateRecipeCategory(cat.id, { nombre, icono, color });
      await loadCategories();
      showNotification('Categoría actualizada', 'success');
    } catch (e) {
      showNotification('Error al actualizar categoría', 'error');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      await adminService.deleteRecipeCategory(cat.id);
      await loadCategories();
      if (selectedCategory?.id === cat.id) {
        setSelectedCategory(null);
        setCategoryRecipes([]);
      }
      showNotification('Categoría eliminada', 'success');
    } catch (e) {
      showNotification('Error al eliminar categoría', 'error');
    }
  };

  const loadRecipesByCategory = async (categoryId) => {
    setLoadingCategoryRecipes(true);
    try {
      const allRecipes = await adminService.getAllRecipes(1, 1000);
      // Filtrar recetas por categoría
      const filtered = allRecipes.recipes?.filter(r => r.categoriaRecetaId === categoryId) || [];
      setCategoryRecipes(filtered);
    } catch (e) {
      console.error('Error loading recipes by category', e);
      setCategoryRecipes([]);
      showNotification('Error al cargar recetas de la categoría', 'error');
    } finally {
      setLoadingCategoryRecipes(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    loadRecipesByCategory(cat.id);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta receta?')) return;
    try {
      await adminService.toggleRecipeStatus(recipeId);
      showNotification('Receta eliminada', 'success');
      if (selectedCategory) {
        loadRecipesByCategory(selectedCategory.id);
      }
    } catch (e) {
      showNotification('Error al eliminar receta', 'error');
    }
  };

  const renderCategories = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Categorías</h2>
          <p>Categorías del sistema (como en la Home) y categorías de recetas</p>
        </div>
      </div>

      {/* Categorías del sistema (Home) */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Categorías del Sistema</h3>
        <div className="recipes-grid">
          {unifiedCategories.map(uc => (
            <div key={`${uc.type}-${uc.id}-${uc.nombre}`} className="recipe-card" onClick={() => handleCategoryCardClick(uc)} style={{ cursor: 'pointer' }}>
              <div className="recipe-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="recipe-placeholder" style={{ fontSize: '2.2rem' }}>{uc.icon || '🗂️'}</div>
              </div>
              <div className="recipe-status approved">{uc.type}</div>
              <h4>{uc.displayName || uc.nombre}</h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '8px' }}>Click para ver datos completos</p>
              <div className="recipe-actions" onClick={(e) => e.stopPropagation()}>
                <button className="view-btn" onClick={() => handleCategoryCardClick(uc)}>
                  📊 Ver Tabla de Datos
                </button>
              </div>
            </div>
          ))}
          {unifiedCategories.length === 0 && (
            <div className="no-recipes" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron categorías del sistema</p>
              <button className="primary-btn" onClick={loadUnifiedCategories}>🔄 Recargar</button>
            </div>
          )}
        </div>
      </div>

      {/* Categorías de Recetas (CRUD Admin) */}
      <div>
        <div className="section-header" style={{ padding: 0, marginTop: 12 }}>
          <div>
            <h3>Categorías de Recetas</h3>
            <p>Crear, editar y eliminar categorías de recetas</p>
          </div>
          <div className="section-actions">
            <button className="primary-btn" onClick={handleCreateCategory}>+ Nueva Categoría</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '8px 8px 12px 8px' }}>Todas</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 420, overflowY: 'auto' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: selectedCategory?.id === cat.id ? '#eef2ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ marginRight: 8 }}>{cat.icono || '🗂️'}</span>
                  <strong>{cat.nombre}</strong>
                </button>
              ))}
              {categories.length === 0 && <div style={{ color: '#6b7280', padding: 12 }}>No hay categorías</div>}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb' }}>
            {selectedCategory ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedCategory.icono || '🗂️'} {selectedCategory.nombre}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                      {categoryRecipes.length} receta{categoryRecipes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="primary-btn" onClick={() => navigate('/recipes/create')}>
                      + Nueva Receta
                    </button>
                    <button className="edit-btn" onClick={() => handleUpdateCategory(selectedCategory)}>Editar Categoría</button>
                    <button className="delete-btn" onClick={() => handleDeleteCategory(selectedCategory)}>Eliminar Categoría</button>
                  </div>
                </div>

                {loadingCategoryRecipes ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner"></div>
                    <p>Cargando recetas...</p>
                  </div>
                ) : categoryRecipes.length > 0 ? (
                  <div className="users-table">
                    <div className="table-header">
                      <span>ID</span>
                      <span>Nombre</span>
                      <span>Tiempo</span>
                      <span>Porciones</span>
                      <span>Estado</span>
                      <span>Acciones</span>
                    </div>
                    {categoryRecipes.map(recipe => (
                      <div key={recipe.id} className="table-row">
                        <span>{recipe.id}</span>
                        <div className="user-cell">
                          {recipe.imagenPrincipal ? (
                            <img
                              src={recipe.imagenPrincipal}
                              alt={recipe.nombre}
                              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', marginRight: '8px' }}
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
                              🍽️
                            </div>
                          )}
                          <span>{recipe.nombre}</span>
                        </div>
                        <span>{recipe.tiempoTotal || recipe.tiempoPreparacion || 0} min</span>
                        <span>{recipe.porciones || 1}</span>
                        <span className={`status-badge ${recipe.esActivo !== false ? 'active' : 'inactive'}`}>
                          {recipe.esActivo !== false ? 'Activa' : 'Inactiva'}
                        </span>
                        <div className="action-buttons">
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                            title="Ver receta"
                          >
                            👁️ Ver
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                            title="Editar receta"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="action-btn danger"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            title="Eliminar receta"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No hay recetas en esta categoría</p>
                    <button className="primary-btn" onClick={() => navigate('/recipes/create')}>
                      + Crear Primera Receta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                <p>Selecciona una categoría para ver sus recetas</p>
              </div>
            )}
          </div>
        </div>
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
          <button className="secondary-btn" style={{ marginTop: '10px' }} onClick={() => showNotification('Funcionalidad en desarrollo', 'info')}>
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

      {/* Modal de Edición de Usuario */}
      {showUserModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>✏️ Editar Usuario</h3>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombres</label>
                <input
                  type="text"
                  value={editUserForm.nombres}
                  onChange={(e) => setEditUserForm({ ...editUserForm, nombres: e.target.value })}
                  className="form-control"
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Campo no editable</small>
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input
                  type="text"
                  value={editUserForm.apellidos}
                  onChange={(e) => setEditUserForm({ ...editUserForm, apellidos: e.target.value })}
                  className="form-control"
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Campo no editable</small>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="form-control"
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Campo no editable</small>
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={editUserForm.telefono}
                  onChange={(e) => setEditUserForm({ ...editUserForm, telefono: e.target.value })}
                  className="form-control"
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Campo no editable</small>
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={editUserForm.rolId}
                  onChange={(e) => setEditUserForm({ ...editUserForm, rolId: parseInt(e.target.value) })}
                  className="form-control"
                  disabled={editingUser.role?.codigo === 'ADMIN'}
                >
                  {systemRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.nombre}</option>
                  ))}
                </select>
                {editingUser.role?.codigo === 'ADMIN' && (
                  <small style={{ color: '#ef4444', fontSize: '0.85rem' }}>No se puede cambiar el rol del administrador</small>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowUserModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveUserEdit}>
                💾 Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Tabla de Datos de Categoría */}
      {showCategoryDataModal && selectedCategoryForData && (
        <div className="modal-overlay" onClick={() => setShowCategoryDataModal(false)}>
          <div className="modal-content category-data-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', width: '1200px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{selectedCategoryForData.icon}</span>
                  {selectedCategoryForData.displayName || selectedCategoryForData.nombre}
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
                  Total de items: {categoryStats.total || categoryData.length}
                  {categoryStats.totalStock && ` | Stock total: ${categoryStats.totalStock}`}
                  {categoryStats.avgPrice && ` | Precio promedio: S/ ${Number(categoryStats.avgPrice).toFixed(2)}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="primary-btn" onClick={handleCreateProduct}>
                  + Nuevo Item
                </button>
                <button className="btn-secondary" onClick={() => setShowCategoryDataModal(false)}>
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {loadingCategoryData ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner"></div>
                <p>Cargando datos...</p>
              </div>
            ) : categoryData.length > 0 ? (
              <div className="category-products-table">
                <div className="table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((item, index) => (
                        <tr key={`${selectedCategoryForData?.type || 'item'}-${item.id}-${index}`}>
                          <td>#{item.id}</td>
                          <td>
                            <div className="product-info">
                              {item.imagenUrl || item.imagenPrincipal ? (
                                <img
                                  src={item.imagenUrl || item.imagenPrincipal}
                                  alt={item.nombre || item.titulo}
                                  className="product-image"
                                />
                              ) : (
                                <div className="product-placeholder">
                                  {selectedCategoryForData.icon}
                                </div>
                              )}
                              <div className="product-details">
                                <span className="product-name">{item.nombre || item.titulo}</span>
                                {item.marca && <span className="product-brand">{item.marca}</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="product-description">
                              {item.descripcion?.substring(0, 80) || 'Sin descripción'}
                              {item.descripcion && item.descripcion.length > 80 && '...'}
                            </span>
                          </td>
                          <td>
                            <span className="product-price">
                              {item.precio ? `S/ ${Number(item.precio).toFixed(2)}` : '-'}
                            </span>
                          </td>
                          <td>
                            <span className="product-stock">
                              {item.stock !== undefined ? item.stock : '-'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${item.esActivo !== false ? 'active' : 'inactive'}`}>
                              {item.esActivo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-row">
                              <button
                                className="action-btn edit"
                                onClick={() => handleEditProduct(item)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className="action-btn toggle"
                                onClick={() => handleToggleProductStatus(item.id)}
                                title="Cambiar estado"
                              >
                                {item.esActivo !== false ? '🚫' : '✅'}
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => handleDeleteProduct(item.id)}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>No hay items en esta categoría</p>
                <button className="primary-btn" onClick={handleCreateProduct}>
                  + Crear Primer Item
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Formulario de Producto */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h3>{editingProduct ? 'Editar Item' : 'Nuevo Item'}</h3>
              <button className="btn-secondary" onClick={() => setShowProductModal(false)}>✕</button>
            </div>

            <div className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nombre *</label>
                <input
                  type="text"
                  value={productFormData.nombre}
                  onChange={(e) => setProductFormData({ ...productFormData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Descripción</label>
                <textarea
                  value={productFormData.descripcion}
                  onChange={(e) => setProductFormData({ ...productFormData, descripcion: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Precio (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.precio}
                    onChange={(e) => setProductFormData({ ...productFormData, precio: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stock</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>URL de Imagen</label>
                <input
                  type="text"
                  value={productFormData.imagenUrl}
                  onChange={(e) => setProductFormData({ ...productFormData, imagenUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SKU</label>
                <input
                  type="text"
                  value={productFormData.sku}
                  onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                  placeholder="SKU-001"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowProductModal(false)}>
                Cancelar
              </button>
              <button
                className="primary-btn"
                onClick={handleSaveProduct}
                disabled={!productFormData.nombre}
              >
                {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
