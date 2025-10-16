import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaMapMarkerAlt, FaGlobe, FaExchangeAlt, FaCopy, FaCheck, FaShare, FaExternalLinkAlt, FaTimes, FaDollarSign, FaTruck } from 'react-icons/fa';
import './ShoppingList.css';

const ShoppingList = ({ missingIngredients, userLocation, onClose }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [purchaseOptions, setPurchaseOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all'); // all, physical, online
  const [sortBy, setSortBy] = useState('distance'); // distance, price, delivery
  const [copiedItems, setCopiedItems] = useState([]);

  useEffect(() => {
    loadShoppingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingIngredients]);

  const loadShoppingData = async () => {
    setLoading(true);
    try {
      // Crear lista de compras con cantidades sugeridas
      const list = missingIngredients.map(ing => ({
        id: ing.ingredienteMaestroId || ing.id,
        nombre: ing.ingredienteMaestro?.nombre || ing.nombre,
        cantidad: ing.cantidad || '1',
        unidad: ing.unidadMedida?.nombre || 'unidad',
        purchased: false,
        alternatives: []
      }));

      setShoppingList(list);

      // Obtener opciones de compra para cada ingrediente
      const options = {};
      for (const item of list) {
        options[item.id] = await fetchPurchaseOptions(item, userLocation);
      }
      setPurchaseOptions(options);
    } catch (error) {
      console.error('Error cargando datos de compra:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOptions = async (ingredient, location) => {
    // Simular llamada al backend
    // En producción, esto llamaría a un endpoint real
    return {
      physical: [
        {
          id: 1,
          name: 'Metro',
          address: 'Av. Javier Prado 123, San Isidro',
          distance: 1.2,
          price: 5.50,
          available: true,
          phone: '01-234-5678'
        },
        {
          id: 2,
          name: 'Plaza Vea',
          address: 'Av. Arequipa 456, Miraflores',
          distance: 2.5,
          price: 5.20,
          available: true,
          phone: '01-345-6789'
        },
        {
          id: 3,
          name: 'Wong',
          address: 'Av. Benavides 789, Surco',
          distance: 3.8,
          price: 6.00,
          available: true,
          phone: '01-456-7890'
        }
      ],
      online: [
        {
          id: 1,
          name: 'Rappi',
          url: `https://rappi.com.pe/search?query=${encodeURIComponent(ingredient.nombre)}`,
          price: 5.80,
          deliveryTime: '30-45 min',
          deliveryFee: 3.00,
          available: true
        },
        {
          id: 2,
          name: 'Cornershop',
          url: `https://cornershopapp.com/pe/search?query=${encodeURIComponent(ingredient.nombre)}`,
          price: 5.50,
          deliveryTime: '1-2 horas',
          deliveryFee: 2.50,
          available: true
        },
        {
          id: 3,
          name: 'Jokr',
          url: `https://jokr.com/pe/search?query=${encodeURIComponent(ingredient.nombre)}`,
          price: 6.20,
          deliveryTime: '15-20 min',
          deliveryFee: 0,
          available: true
        }
      ],
      alternatives: [
        {
          id: 1,
          name: `${ingredient.nombre} orgánico`,
          reason: 'Opción más saludable',
          priceDiff: '+20%'
        },
        {
          id: 2,
          name: `${ingredient.nombre} congelado`,
          reason: 'Mayor duración',
          priceDiff: '-10%'
        }
      ]
    };
  };

  const togglePurchased = (itemId) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const copyList = () => {
    const listText = shoppingList
      .map(item => {
        const status = item.purchased ? '✓' : '☐';
        return `${status} ${item.cantidad} ${item.unidad} ${item.nombre}`;
      })
      .join('\n');

    navigator.clipboard.writeText(listText);
    setCopiedItems(['all']);
    setTimeout(() => setCopiedItems([]), 2000);
  };

  const copyItem = (item) => {
    const itemText = `${item.cantidad} ${item.unidad} ${item.nombre}`;
    navigator.clipboard.writeText(itemText);
    setCopiedItems([item.id]);
    setTimeout(() => setCopiedItems([]), 2000);
  };

  const shareList = async () => {
    const listText = shoppingList
      .map(item => `${item.cantidad} ${item.unidad} ${item.nombre}`)
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de Compras - CookSync',
          text: `Ingredientes necesarios:\n\n${listText}`
        });
      } catch (error) {
        console.log('Error compartiendo:', error);
      }
    } else {
      copyList();
      alert('Lista copiada al portapapeles');
    }
  };

  const getSortedOptions = (options) => {
    if (!options) return [];

    let allOptions = [];

    if (selectedTab === 'all' || selectedTab === 'physical') {
      allOptions = [...allOptions, ...options.physical.map(opt => ({ ...opt, type: 'physical' }))];
    }

    if (selectedTab === 'all' || selectedTab === 'online') {
      allOptions = [...allOptions, ...options.online.map(opt => ({ ...opt, type: 'online' }))];
    }

    // Ordenar según criterio seleccionado
    return allOptions.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        case 'price':
          const priceA = a.price + (a.deliveryFee || 0);
          const priceB = b.price + (b.deliveryFee || 0);
          return priceA - priceB;
        case 'delivery':
          const timeA = a.deliveryTime ? parseInt(a.deliveryTime) : 999;
          const timeB = b.deliveryTime ? parseInt(b.deliveryTime) : 999;
          return timeA - timeB;
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="shopping-list-modal">
        <div className="shopping-list-container">
          <div className="loading-shopping">
            <div className="spinner"></div>
            <p>Cargando opciones de compra...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list-modal" onClick={onClose}>
      <div className="shopping-list-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="shopping-list-header">
          <div className="header-title">
            <FaShoppingCart />
            <h2>Lista de Compras</h2>
            <span className="items-count">{shoppingList.length} ingredientes</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="shopping-actions">
          <button className="action-btn" onClick={copyList}>
            {copiedItems.includes('all') ? <FaCheck /> : <FaCopy />}
            Copiar Lista
          </button>
          <button className="action-btn" onClick={shareList}>
            <FaShare />
            Compartir
          </button>
        </div>

        {/* Shopping List */}
        <div className="shopping-items-section">
          <h3>Ingredientes Necesarios</h3>
          <div className="shopping-items-list">
            {shoppingList.map(item => (
              <div key={item.id} className={`shopping-item ${item.purchased ? 'purchased' : ''}`}>
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={() => togglePurchased(item.id)}
                  />
                </div>
                <div className="item-info">
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-quantity">{item.cantidad} {item.unidad}</span>
                </div>
                <button
                  className="copy-item-btn"
                  onClick={() => copyItem(item)}
                  title="Copiar ingrediente"
                >
                  {copiedItems.includes(item.id) ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="purchase-filters">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedTab('all')}
            >
              Todas
            </button>
            <button
              className={`tab-btn ${selectedTab === 'physical' ? 'active' : ''}`}
              onClick={() => setSelectedTab('physical')}
            >
              <FaMapMarkerAlt /> Tiendas Físicas
            </button>
            <button
              className={`tab-btn ${selectedTab === 'online' ? 'active' : ''}`}
              onClick={() => setSelectedTab('online')}
            >
              <FaGlobe /> Tiendas Online
            </button>
          </div>

          <div className="sort-options">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="distance">Más cercano</option>
              <option value="price">Mejor precio</option>
              <option value="delivery">Envío rápido</option>
            </select>
          </div>
        </div>

        {/* Purchase Options */}
        <div className="purchase-options-section">
          <h3>Opciones de Compra</h3>
          {shoppingList.map(item => {
            const options = getSortedOptions(purchaseOptions[item.id]);
            if (options.length === 0) return null;

            return (
              <div key={item.id} className="ingredient-purchase-options">
                <h4>{item.nombre}</h4>
                <div className="options-grid">
                  {options.map((option, index) => (
                    <div key={index} className={`option-card ${option.type}`}>
                      {option.type === 'physical' ? (
                        <>
                          <div className="option-header">
                            <FaMapMarkerAlt className="option-icon" />
                            <div className="option-name">{option.name}</div>
                          </div>
                          <div className="option-details">
                            <p className="option-address">{option.address}</p>
                            <div className="option-meta">
                              <span className="distance">📍 {option.distance} km</span>
                              <span className="price">
                                <FaDollarSign /> S/ {option.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="phone">📞 {option.phone}</p>
                          </div>
                          <button
                            className="option-action-btn"
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(option.address)}`, '_blank')}
                          >
                            Ver en Mapa
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="option-header">
                            <FaGlobe className="option-icon" />
                            <div className="option-name">{option.name}</div>
                          </div>
                          <div className="option-details">
                            <div className="option-meta">
                              <span className="delivery-time">
                                <FaTruck /> {option.deliveryTime}
                              </span>
                              <span className="price">
                                <FaDollarSign /> S/ {option.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="delivery-fee">
                              Envío: S/ {option.deliveryFee.toFixed(2)}
                            </p>
                          </div>
                          <button
                            className="option-action-btn"
                            onClick={() => window.open(option.url, '_blank')}
                          >
                            Comprar Ahora <FaExternalLinkAlt />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Alternatives */}
                {purchaseOptions[item.id]?.alternatives && purchaseOptions[item.id].alternatives.length > 0 && (
                  <div className="alternatives-section">
                    <h5><FaExchangeAlt /> Alternativas</h5>
                    <div className="alternatives-list">
                      {purchaseOptions[item.id].alternatives.map((alt, index) => (
                        <div key={index} className="alternative-item">
                          <span className="alt-name">{alt.name}</span>
                          <span className="alt-reason">{alt.reason}</span>
                          <span className="alt-price">{alt.priceDiff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
