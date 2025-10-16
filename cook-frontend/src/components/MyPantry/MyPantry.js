import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './MyPantry.css';

const MyPantry = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ingredienteMaestroId: '',
    cantidad: '',
    unidadMedidaId: '',
    fechaVencimiento: '',
    fechaCompra: '',
    notas: '',
  });
  const [ingredients, setIngredients] = useState([]);
  const [units, setUnits] = useState([]);

  const API_BASE_URL = 'http://localhost:3002';

  useEffect(() => {
    if (user) {
      loadPantry();
      loadStats();
      loadIngredients();
      loadUnits();
    }
  }, [user]);

  const loadPantry = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pantry/my-pantry`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error cargando despensa:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pantry/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/ingredients/all`);
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/units/all`);
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Error cargando unidades:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pantry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          ingredienteMaestroId: parseInt(formData.ingredienteMaestroId),
          cantidad: parseFloat(formData.cantidad),
          unidadMedidaId: parseInt(formData.unidadMedidaId),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          ingredienteMaestroId: '',
          cantidad: '',
          unidadMedidaId: '',
          fechaVencimiento: '',
          fechaCompra: '',
          notas: '',
        });
        loadPantry();
        loadStats();
        alert('Ingrediente agregado a la despensa');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al agregar ingrediente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar ingrediente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este ingrediente de la despensa?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/pantry/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      loadPantry();
      loadStats();
    } catch (error) {
      console.error('Error eliminando item:', error);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'fresco': return '#10b981';
      case 'por_vencer': return '#f59e0b';
      case 'vencido': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'fresco': return '✓ Fresco';
      case 'por_vencer': return '⚠️ Por vencer';
      case 'vencido': return '✗ Vencido';
      default: return 'Sin fecha';
    }
  };

  if (loading) {
    return <div className="pantry-loading">Cargando despensa...</div>;
  }

  return (
    <div className="my-pantry-container">
      <div className="pantry-header">
        <h2>🧺 Mi Despensa</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-add">
          {showForm ? '✕ Cancelar' : '+ Agregar Ingrediente'}
        </button>
      </div>

      {stats && (
        <div className="pantry-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.totalItems}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-card fresh">
            <span className="stat-number">{stats.itemsFrescos}</span>
            <span className="stat-label">Frescos</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-number">{stats.itemsPorVencer}</span>
            <span className="stat-label">Por Vencer</span>
          </div>
          <div className="stat-card danger">
            <span className="stat-number">{stats.itemsVencidos}</span>
            <span className="stat-label">Vencidos</span>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="pantry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Ingrediente *</label>
              <select
                value={formData.ingredienteMaestroId}
                onChange={(e) => setFormData({ ...formData, ingredienteMaestroId: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad *</label>
              <input
                type="number"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Unidad *</label>
              <select
                value={formData.unidadMedidaId}
                onChange={(e) => setFormData({ ...formData, unidadMedidaId: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Compra</label>
              <input
                type="date"
                value={formData.fechaCompra}
                onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Fecha de Vencimiento</label>
              <input
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <input
              type="text"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Ej: Comprado en Plaza Vea"
            />
          </div>
          <button type="submit" className="btn-submit">Agregar a Despensa</button>
        </form>
      )}

      <div className="pantry-items">
        {items.length === 0 ? (
          <div className="no-items">
            <p>Tu despensa está vacía</p>
            <p>Agrega ingredientes para comenzar</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="pantry-item">
                <div className="item-header">
                  <h3>{item.ingredienteMaestro.nombre}</h3>
                  <span
                    className="item-status"
                    style={{ backgroundColor: getStatusColor(item.estado) }}
                  >
                    {getStatusText(item.estado)}
                  </span>
                </div>
                <div className="item-details">
                  <p className="item-quantity">
                    {item.cantidad} {item.unidadMedida.abreviatura}
                  </p>
                  {item.fechaVencimiento && (
                    <p className="item-expiry">
                      Vence: {new Date(item.fechaVencimiento).toLocaleDateString('es-PE')}
                    </p>
                  )}
                  {item.notas && (
                    <p className="item-notes">{item.notas}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(item.id)} className="btn-delete">
                  🗑️ Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPantry;
