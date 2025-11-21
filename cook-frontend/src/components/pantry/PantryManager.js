import React, { useState, useEffect, useCallback } from 'react';
import './PantryManager.css';

const PantryManager = ({ user, onClose }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    ingredienteMaestroId: '',
    cantidad: '',
    unidadMedidaId: '',
    fechaVencimiento: '',
    fechaCompra: '',
    notas: ''
  });

  const loadPantryItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/pantry`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPantryItems(data.items || []);
      }
    } catch (error) {
      console.error('Error cargando despensa:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const loadAvailableIngredients = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3002/recipes/ingredients/all');
      if (response.ok) {
        const data = await response.json();
        setAvailableIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
    }
  }, []);

  useEffect(() => {
    loadPantryItems();
    loadAvailableIngredients();
  }, [loadPantryItems, loadAvailableIngredients]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/pantry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        await loadPantryItems();
        setNewItem({
          ingredienteMaestroId: '',
          cantidad: '',
          unidadMedidaId: '',
          fechaVencimiento: '',
          fechaCompra: '',
          notas: ''
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error agregando ingrediente:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/pantry/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadPantryItems();
      }
    } catch (error) {
      console.error('Error eliminando ingrediente:', error);
    }
  };

  const getExpirationStatus = (fechaVencimiento) => {
    if (!fechaVencimiento) return 'sin-fecha';

    const today = new Date();
    const expDate = new Date(fechaVencimiento);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'vencido';
    if (diffDays <= 3) return 'por-vencer';
    if (diffDays <= 7) return 'proximo';
    return 'fresco';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'vencido': return '#ef4444';
      case 'por-vencer': return '#f59e0b';
      case 'proximo': return '#eab308';
      case 'fresco': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'vencido': return 'Vencido';
      case 'por-vencer': return 'Por vencer';
      case 'proximo': return 'Próximo a vencer';
      case 'fresco': return 'Fresco';
      default: return 'Sin fecha';
    }
  };

  if (loading) {
    return (
      <div className="pantry-overlay">
        <div className="pantry-modal">
          <div className="loading">Cargando despensa...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pantry-overlay">
      <div className="pantry-modal">
        <div className="pantry-header">
          <h2>🥫 Mi Despensa Virtual</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pantry-content">
          <div className="pantry-stats">
            <div className="stat-card">
              <span className="stat-number">{pantryItems.length}</span>
              <span className="stat-label">Ingredientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {pantryItems.filter(item => getExpirationStatus(item.fechaVencimiento) === 'por-vencer').length}
              </span>
              <span className="stat-label">Por vencer</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {pantryItems.filter(item => getExpirationStatus(item.fechaVencimiento) === 'vencido').length}
              </span>
              <span className="stat-label">Vencidos</span>
            </div>
          </div>

          <div className="pantry-actions">
            <button
              className="add-ingredient-btn"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Agregar Ingrediente
            </button>
          </div>

          {showAddForm && (
            <div className="add-form">
              <h3>Agregar Nuevo Ingrediente</h3>
              <form onSubmit={handleAddItem}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ingrediente</label>
                    <select
                      value={newItem.ingredienteMaestroId}
                      onChange={(e) => setNewItem({ ...newItem, ingredienteMaestroId: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar ingrediente</option>
                      {availableIngredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.cantidad}
                      onChange={(e) => setNewItem({ ...newItem, cantidad: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Compra</label>
                    <input
                      type="date"
                      value={newItem.fechaCompra}
                      onChange={(e) => setNewItem({ ...newItem, fechaCompra: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={newItem.fechaVencimiento}
                      onChange={(e) => setNewItem({ ...newItem, fechaVencimiento: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notas (opcional)</label>
                  <input
                    type="text"
                    value={newItem.notas}
                    onChange={(e) => setNewItem({ ...newItem, notas: e.target.value })}
                    placeholder="Ej: Comprado en el mercado, orgánico, etc."
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddForm(false)}>Cancelar</button>
                  <button type="submit">Agregar</button>
                </div>
              </form>
            </div>
          )}

          <div className="pantry-items">
            {pantryItems.length === 0 ? (
              <div className="empty-pantry">
                <h3>Tu despensa está vacía</h3>
                <p>Comienza agregando los ingredientes que tienes disponibles</p>
              </div>
            ) : (
              <div className="items-grid">
                {pantryItems.map(item => {
                  const status = getExpirationStatus(item.fechaVencimiento);
                  return (
                    <div key={item.id} className="pantry-item">
                      <div className="item-header">
                        <h4>{item.nombre}</h4>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="item-details">
                        <span className="quantity">{item.cantidad} {item.unidad}</span>
                        <span
                          className="status"
                          style={{ color: getStatusColor(status) }}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>
                      {item.fechaVencimiento && (
                        <div className="expiry-date">
                          Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}
                        </div>
                      )}
                      {item.notas && (
                        <div className="item-notes">{item.notas}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantryManager;
