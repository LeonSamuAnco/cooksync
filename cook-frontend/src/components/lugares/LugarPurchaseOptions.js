import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkedAlt, FaPhone, FaStar, FaUserTie, FaWhatsapp, FaInstagram, FaClock, FaCreditCard, FaTruck } from 'react-icons/fa';
import './LugarPurchaseOptions.css';

const LugarPurchaseOptions = ({ lugar, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('platform');
    const [platformVendors, setPlatformVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(true);

    // Cargar vendedores de la plataforma
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoadingVendors(true);
                // Categoría 17 = Lugares (Agencias, Guías, etc.)
                const response = await fetch('http://localhost:3002/vendors/by-category/17?limit=10');
                if (response.ok) {
                    const data = await response.json();
                    setPlatformVendors(data.vendors || []);
                }
            } catch (error) {
                console.error('Error cargando vendedores:', error);
            } finally {
                setLoadingVendors(false);
            }
        };

        fetchVendors();
    }, []);

    return (
        <div className="purchase-modal-overlay" onClick={onClose}>
            <div className="purchase-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="purchase-modal-header">
                    <div className="purchase-modal-title">
                        <FaMapMarkedAlt />
                        <div>
                            <h2>Servicios y Guías</h2>
                            <p>{lugar.items?.nombre}</p>
                            <span className="modal-tipo">{lugar.lugar_tipos?.nombre}</span>
                        </div>
                    </div>
                    <button className="purchase-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="purchase-tabs">
                    <button
                        className={`purchase-tab ${selectedTab === 'platform' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('platform')}
                    >
                        <FaUserTie />
                        Guías y Agencias
                    </button>
                    {/* Podríamos agregar más tabs como "Tours" o "Entradas" en el futuro */}
                </div>

                <div className="purchase-modal-body">
                    {selectedTab === 'platform' && (
                        <div className="purchase-section">
                            <div className="purchase-section-header">
                                <h3>Profesionales Verificados</h3>
                                <p>Encuentra guías turísticos, agencias y servicios relacionados</p>
                            </div>
                            {loadingVendors ? (
                                <div className="loading-vendors">
                                    <p>Cargando profesionales...</p>
                                </div>
                            ) : platformVendors.length > 0 ? (
                                <div className="platform-vendors-grid">
                                    {platformVendors.map((vendor) => (
                                        <div key={vendor.id} className="platform-vendor-card">
                                            <div className="vendor-header">
                                                {vendor.photo ? (
                                                    <img src={vendor.photo} alt={vendor.name} className="vendor-photo" />
                                                ) : (
                                                    <div className="vendor-photo-placeholder">
                                                        {vendor.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="vendor-info">
                                                    <h4>{vendor.businessName}</h4>
                                                    {vendor.stats.averageRating > 0 && (
                                                        <div className="vendor-rating">
                                                            <FaStar className="star-icon" />
                                                            <span>{vendor.stats.averageRating.toFixed(1)}</span>
                                                            <span className="reviews-count">({vendor.stats.totalReviews} reseñas)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {vendor.bio && (
                                                <p className="vendor-bio">{vendor.bio}</p>
                                            )}
                                            <div className="vendor-details">
                                                {vendor.address && (
                                                    <p className="vendor-address">
                                                        <FaMapMarkedAlt /> {vendor.address}
                                                    </p>
                                                )}
                                                {vendor.horarioAtencion && (
                                                    <p className="vendor-detail">
                                                        <FaClock /> {vendor.horarioAtencion}
                                                    </p>
                                                )}
                                                {vendor.tipoServicio && (
                                                    <p className="vendor-detail">
                                                        <FaTruck /> {vendor.tipoServicio}
                                                    </p>
                                                )}
                                                {vendor.metodosPago && (
                                                    <p className="vendor-detail">
                                                        <FaCreditCard /> {vendor.metodosPago}
                                                    </p>
                                                )}
                                                {vendor.phone && (
                                                    <p className="vendor-phone">
                                                        <FaPhone /> {vendor.phone}
                                                    </p>
                                                )}
                                                <p className="vendor-products">
                                                    🗺️ {vendor.stats.totalRecipes} servicios publicados
                                                </p>
                                            </div>
                                            <div className="vendor-actions">
                                                {vendor.whatsapp && (
                                                    <a
                                                        href={`https://wa.me/51${vendor.whatsapp.replace(/\s/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="vendor-contact-btn whatsapp"
                                                        style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
                                                    >
                                                        <FaWhatsapp /> WhatsApp
                                                    </a>
                                                )}
                                                {vendor.instagram && (
                                                    <a
                                                        href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="vendor-contact-btn instagram"
                                                        style={{ backgroundColor: '#E1306C', borderColor: '#E1306C', color: 'white' }}
                                                    >
                                                        <FaInstagram /> Instagram
                                                    </a>
                                                )}
                                                {vendor.phone && !vendor.whatsapp && (
                                                    <a
                                                        href={`tel:${vendor.phone}`}
                                                        className="vendor-contact-btn"
                                                    >
                                                        <FaPhone /> Contactar
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-vendors">
                                    <p>Aún no hay guías o agencias registradas.</p>
                                    <p>¿Ofreces servicios turísticos? ¡Regístrate en CookSync!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LugarPurchaseOptions;
