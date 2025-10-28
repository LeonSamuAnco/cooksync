import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaMapMarkerAlt, FaGlobe, FaExternalLinkAlt, FaPhone } from 'react-icons/fa';
import './TortaPurchaseOptions.css';

const TortaPurchaseOptions = ({ torta, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('online');

  const onlineStores = [
    {
      id: 1,
      name: 'Rappi',
      url: `https://rappi.com.pe/search?query=${encodeURIComponent(torta.nombre)}`,
      description: 'Delivery en 30-45 minutos'
    },
    {
      id: 2,
      name: 'PedidosYa',
      url: `https://www.pedidosya.com.pe/busqueda?query=${encodeURIComponent(torta.nombre)}`,
      description: 'Envío rápido a domicilio'
    },
    {
      id: 3,
      name: 'Uber Eats',
      url: `https://www.ubereats.com/pe/search?q=${encodeURIComponent(torta.nombre)}`,
      description: 'Delivery express'
    },
    {
      id: 4,
      name: 'Glovo',
      url: `https://glovoapp.com/pe/es/search/?q=${encodeURIComponent(torta.nombre)}`,
      description: 'Entrega en minutos'
    },
    {
      id: 5,
      name: 'Mercado Libre',
      url: `https://listado.mercadolibre.com.pe/${encodeURIComponent(torta.nombre)}`,
      description: 'Variedad de vendedores'
    }
  ];

  const physicalStores = [
    {
      id: 1,
      name: torta.vendedor || 'Pastelería Local',
      address: 'Múltiples ubicaciones en Lima',
      phone: '01-234-5678',
      description: 'Especialistas en tortas personalizadas',
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(torta.vendedor || 'pastelería Lima')}`
    },
    {
      id: 2,
      name: 'Wong',
      address: 'Av. Benavides 123, Miraflores',
      phone: '01-611-5000',
      description: 'Sección de panadería',
      mapsUrl: 'https://www.google.com/maps/search/Wong+Lima'
    },
    {
      id: 3,
      name: 'Metro',
      address: 'Av. Javier Prado 456, San Isidro',
      phone: '01-611-5000',
      description: 'Tortas y pasteles variados',
      mapsUrl: 'https://www.google.com/maps/search/Metro+Lima'
    },
    {
      id: 4,
      name: 'Saga Falabella',
      address: 'Centros comerciales',
      phone: '01-611-5000',
      description: 'Sección gourmet',
      mapsUrl: 'https://www.google.com/maps/search/Saga+Falabella+Lima'
    },
    {
      id: 5,
      name: 'Plaza Vea',
      address: 'Múltiples ubicaciones',
      phone: '01-611-5000',
      description: 'Panadería y pastelería',
      mapsUrl: 'https://www.google.com/maps/search/Plaza+Vea+Lima'
    },
    {
      id: 6,
      name: 'Pastelerías Artesanales',
      address: 'Miraflores, San Isidro, Barranco',
      phone: 'Consultar por ubicación',
      description: 'Tortas premium y personalizadas',
      mapsUrl: 'https://www.google.com/maps/search/pastelería+artesanal+Lima'
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
              <p>{torta.nombre}</p>
              {torta.sabor && <span className="modal-sabor">Sabor: {torta.sabor}</span>}
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
                <p>Ordena tortas con delivery a domicilio</p>
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
                      Ordenar Ahora
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
                <p>Visita una pastelería cerca de ti</p>
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

export default TortaPurchaseOptions;
