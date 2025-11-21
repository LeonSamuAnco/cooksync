import React, { useState, useEffect } from 'react';
import {
    FaShoppingCart, FaPlus, FaTrash, FaCheck, FaTimes
} from 'react-icons/fa';
import './ShoppingListManager.css';

const ShoppingListManager = ({ user, onClose }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({
        nombre: '',
        cantidad: '',
        unidad: '',
        notas: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (user) {
            loadShoppingList();
        }
    }, [user]);

    const loadShoppingList = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/shopping-list/my-list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error cargando lista de compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/shopping-list', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ingredienteMaestroId: null,
                    nombre: newItem.nombre,
                    cantidad: parseFloat(newItem.cantidad) || 1,
                    unidadMedidaId: 1,
                    notas: newItem.notas
                })
            });

            if (response.ok) {
                await loadShoppingList();
                setNewItem({ nombre: '', cantidad: '', unidad: '', notas: '' });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error agregando item:', error);
        }
    };

    const togglePurchased = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3002/shopping-list/${id}/purchase`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadShoppingList();
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('¿Eliminar este item?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3002/shopping-list/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadShoppingList();
            }
        } catch (error) {
            console.error('Error eliminando item:', error);
        }
    };

    const clearPurchased = async () => {
        if (!window.confirm('¿Eliminar todos los items comprados?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/shopping-list/clear/purchased', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadShoppingList();
            }
        } catch (error) {
            console.error('Error limpiando lista:', error);
        }
    };

    return (
        <div className="shopping-overlay">
            <div className="shopping-modal">
                <div className="shopping-header">
                    <h2><FaShoppingCart /> Mi Lista de Compras</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="shopping-content">
                    <div className="shopping-actions-bar">
                        <button
                            className="add-item-btn"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            <FaPlus /> Agregar Item
                        </button>
                        <button
                            className="clear-purchased-btn"
                            onClick={clearPurchased}
                            disabled={!items.some(i => i.esComprado)}
                        >
                            <FaTrash /> Limpiar Comprados
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddItem} className="add-item-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Nombre del producto"
                                    value={newItem.nombre}
                                    onChange={e => setNewItem({ ...newItem, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="number"
                                    placeholder="Cant."
                                    value={newItem.cantidad}
                                    onChange={e => setNewItem({ ...newItem, cantidad: e.target.value })}
                                    className="small-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Notas (opcional)"
                                    value={newItem.notas}
                                    onChange={e => setNewItem({ ...newItem, notas: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="submit-btn">Agregar a la lista</button>
                        </form>
                    )}

                    <div className="shopping-list-items">
                        {loading ? (
                            <div className="loading">Cargando...</div>
                        ) : items.length === 0 ? (
                            <div className="empty-state">
                                <p>Tu lista está vacía</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className={`list-item ${item.esComprado ? 'purchased' : ''}`}>
                                    <div
                                        className="item-check"
                                        onClick={() => togglePurchased(item.id)}
                                    >
                                        {item.esComprado && <FaCheck />}
                                    </div>
                                    <div className="item-details">
                                        <span className="item-name">
                                            {item.ingredienteMaestro?.nombre || item.nombre || 'Item sin nombre'}
                                        </span>
                                        <span className="item-meta">
                                            {item.cantidad} {item.unidadMedida?.nombre || 'unid.'}
                                            {item.notas && <span className="item-notes"> • {item.notas}</span>}
                                        </span>
                                    </div>
                                    <button
                                        className="delete-item-btn"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingListManager;
