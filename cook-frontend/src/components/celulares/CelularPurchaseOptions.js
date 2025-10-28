import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaMapMarkerAlt, FaGlobe, FaExternalLinkAlt, FaPhone } from 'react-icons/fa';
import './CelularPurchaseOptions.css';

const CelularPurchaseOptions = ({ celular, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('online'); // online, physical

  const onlineStores = [
    {
      id: 1,
      name: 'Linio',
      url: `https://www.linio.com.pe/search?q=${encodeURIComponent(celular.marca + ' ' + celular.modelo)}`,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Linio_logo.svg',
      description: 'Envío a todo el Perú'
    },
    {
      id: 2,
      name: 'Mercado Libre',
      url: `https://listado.mercadolibre.com.pe/${encodeURIComponent(celular.marca + '-' + celular.modelo)}`,
      logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
      description: 'Variedad de vendedores'
    },
    {
      id: 3,
      name: 'Ripley',
      url: `https://simple.ripley.com.pe/search/${encodeURIComponent(celular.marca + ' ' + celular.modelo)}`,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Ripley_logo.svg',
      description: 'Tienda departamental'
    },
    {
      id: 4,
      name: 'Saga Falabella',
      url: `https://www.falabella.com.pe/falabella-pe/search?Ntt=${encodeURIComponent(celular.marca + ' ' + celular.modelo)}`,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Saga_Falabella_logo.svg',
      description: 'Compra online con recojo en tienda'
    },
    {
      id: 5,
      name: 'Amazon',
      url: `https://www.amazon.com/s?k=${encodeURIComponent(celular.marca + ' ' + celular.modelo)}`,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      description: 'Envío internacional'
    }
  ];

  const physicalStores = [
    {
      id: 1,
      name: 'Tiendas Claro',
      address: 'Múltiples ubicaciones en Lima',
      phone: '0800-00-200',
      description: 'Operador con planes',
      mapsUrl: 'https://www.google.com/maps/search/Claro+tienda+Lima'
    },
    {
      id: 2,
      name: 'Tiendas Movistar',
      address: 'Múltiples ubicaciones en Lima',
      phone: '0800-00-123',
      description: 'Operador con planes',
      mapsUrl: 'https://www.google.com/maps/search/Movistar+tienda+Lima'
    },
    {
      id: 3,
      name: 'Tiendas Entel',
      address: 'Múltiples ubicaciones en Lima',
      phone: '0800-00-010',
      description: 'Operador con planes',
      mapsUrl: 'https://www.google.com/maps/search/Entel+tienda+Lima'
    },
    {
      id: 4,
      name: 'Plaza Vea',
      address: 'Centros comerciales',
      phone: '01-611-5000',
      description: 'Celulares liberados',
      mapsUrl: 'https://www.google.com/maps/search/Plaza+Vea+Lima'
    },
    {
      id: 5,
      name: 'Tiendas EFE',
      address: 'Polvos Azules y otros',
      phone: '01-332-3030',
      description: 'Tienda especializada',
      mapsUrl: 'https://www.google.com/maps/search/Tiendas+EFE+Lima'
    },
    {
      id: 6,
      name: 'Saga Falabella',
      address: 'Centros comerciales',
      phone: '01-611-5000',
      description: 'Tienda departamental',
      mapsUrl: 'https://www.google.com/maps/search/Saga+Falabella+Lima'
    }
  ];

  return (
    <div className="purchase-modal-overlay" onClick={onClose}>
      <div className="purchase-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="purchase-modal-header">
          <div className="purchase-modal-title">
            <FaShoppingCart />
            <div>
              <h2>Dónde Comprar</h2>
              <p>{celular.marca} {celular.modelo}</p>
            </div>
          </div>
          <button className="purchase-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="purchase-tabs">
          <button
            className={`purchase-tab ${selectedTab === 'online' ? 'active' : ''}`}
            onClick={() => setSelectedTab('online')}
          >
            <FaGlobe />
            Comprar en Línea
          </button>
          <button
            className={`purchase-tab ${selectedTab === 'physical' ? 'active' : ''}`}
            onClick={() => setSelectedTab('physical')}
          >
            <FaMapMarkerAlt />
            Tiendas Físicas
          </button>
        </div>

        <div className="purchase-modal-body">
          {selectedTab === 'online' && (
            <div className="purchase-section">
              <div className="purchase-section-header">
                <h3>Tiendas en Línea</h3>
                <p>Compra desde casa con envío a domicilio</p>
              </div>
              <div className="online-stores-grid">
                {onlineStores.map((store) => (
                  <div key={store.id} className="online-store-card">
                    <div className="store-info">
                      <h4>{store.name}</h4>
                      <p>{store.description}</p>
                    </div>
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-visit-btn"
                    >
                      <FaExternalLinkAlt />
                      Visitar Tienda
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'physical' && (
            <div className="purchase-section">
              <div className="purchase-section-header">
                <h3>Tiendas Físicas</h3>
                <p>Visita una tienda cerca de ti</p>
              </div>
              <div className="physical-stores-list">
                {physicalStores.map((store) => (
                  <div key={store.id} className="physical-store-card">
                    <div className="store-details">
                      <h4>{store.name}</h4>
                      <p className="store-address">
                        <FaMapMarkerAlt /> {store.address}
                      </p>
                      <p className="store-phone">
                        <FaPhone /> {store.phone}
                      </p>
                      <p className="store-description">{store.description}</p>
                    </div>
                    <a
                      href={store.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-maps-btn"
                    >
                      <FaMapMarkerAlt />
                      Ver en Mapa
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelularPurchaseOptions;
