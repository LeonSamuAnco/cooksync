import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import tortasService from '../services/tortasService';
import activityService from '../services/activityService';
import TortaPurchaseOptions from '../components/tortas/TortaPurchaseOptions';
import './TortaDetailPage.css';

const TortaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [torta, setTorta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariacion, setSelectedVariacion] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadTorta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTorta = async () => {
    setLoading(true);
    try {
      const data = await tortasService.getById(id);
      setTorta(data);
      
      // Seleccionar la primera variación por defecto
      if (data.items?.torta_variaciones?.length > 0) {
        setSelectedVariacion(data.items.torta_variaciones[0]);
      }

      // Registrar actividad de vista (sin bloquear la carga)
      if (data && data.items) {
        // Ejecutar en background sin await para no bloquear la UI
        activityService.create({
          tipo: 'TORTA_VISTA',
          descripcion: `Viste la torta "${data.items.nombre}"`,
          referenciaId: parseInt(id),
          referenciaTipo: 'torta',
          metadata: {
            sabor: data.torta_sabores?.nombre,
            cobertura: data.torta_coberturas?.nombre,
            ocasion: data.torta_ocasiones?.nombre,
          },
        }).then(() => {
          console.log('✅ Actividad de torta registrada');
        }).catch((actError) => {
          console.warn('⚠️ No se pudo registrar la actividad:', actError.message);
        });
      }
    } catch (error) {
      console.error('Error al cargar torta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="torta-detail-loading">
        <div className="spinner"></div>
        <p>Cargando torta...</p>
      </div>
    );
  }

  if (!torta) {
    return (
      <div className="torta-detail-error">
        <h2>Torta no encontrada</h2>
        <button onClick={() => navigate('/tortas', { replace: true })}>
          Volver a Tortas
        </button>
      </div>
    );
  }

  const { items, torta_sabores, torta_rellenos, torta_coberturas, torta_ocasiones } = torta;

  return (
    <div className="torta-detail-page">
      <button className="back-button" onClick={() => navigate('/tortas', { replace: true })}>
        <FaArrowLeft /> Volver a Tortas
      </button>

      <div className="torta-detail-container">
        {/* Sección de imagen */}
        <div className="torta-detail-image">
          {items?.imagen_principal_url ? (
            <img src={items.imagen_principal_url} alt={items.nombre} />
          ) : (
            <div className="image-placeholder">
              <span className="placeholder-icon">🎂</span>
              <p>Imagen no disponible</p>
            </div>
          )}
        </div>

        <div className="torta-detail-info">
          <div className="torta-header-info">
            <span className="torta-sabor-label">{torta_sabores.nombre}</span>
            <h1 className="torta-title">{items.nombre}</h1>
          </div>
          
          <div className="torta-badges">
            {torta_ocasiones && (
              <span className="badge ocasion">{torta_ocasiones.nombre}</span>
            )}
            {torta.es_personalizable && (
              <span className="badge personalizable">Personalizable</span>
            )}
          </div>

          {/* Botón de Comprar */}
          <button 
            className="buy-button"
            onClick={() => setShowPurchaseModal(true)}
          >
            <FaShoppingCart /> Dónde Comprar
          </button>

          {/* Características */}
          <div className="torta-characteristics">
            <div className="characteristic-card">
              <div className="char-label">Sabor Principal</div>
              <div className="char-value">{torta_sabores.nombre}</div>
            </div>

            <div className="characteristic-card">
              <div className="char-label">Relleno</div>
              <div className="char-value">{torta_rellenos.nombre}</div>
            </div>

            <div className="characteristic-card">
              <div className="char-label">Cobertura</div>
              <div className="char-value">{torta_coberturas.nombre}</div>
            </div>

            {torta.vendedor_o_pasteleria && (
              <div className="characteristic-card">
                <div className="char-label">Pastelería</div>
                <div className="char-value">{torta.vendedor_o_pasteleria}</div>
              </div>
            )}

            {torta.tiempo_preparacion_horas && (
              <div className="characteristic-card">
                <div className="char-icon"><FaClock /></div>
                <div className="char-label">Tiempo de Preparación</div>
                <div className="char-value">{torta.tiempo_preparacion_horas} horas</div>
              </div>
            )}
          </div>

          {/* Variaciones de Tamaño */}
          {items.torta_variaciones && items.torta_variaciones.length > 0 && (
            <div className="variaciones-section">
              <h3>Tamaños Disponibles</h3>
              <div className="variaciones-grid">
                {items.torta_variaciones.map((variacion, index) => (
                  <div
                    key={index}
                    className={`variacion-card ${selectedVariacion === variacion ? 'selected' : ''}`}
                    onClick={() => setSelectedVariacion(variacion)}
                  >
                    <div className="variacion-tamano">
                      {variacion.descripcion_tamano}
                    </div>
                    <div className="variacion-porciones">
                      {variacion.porciones_aprox} porciones aprox.
                    </div>
                    <div className="variacion-precio">
                      ${parseFloat(variacion.precio_usd).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alérgenos */}
          {torta.alergenos && (
            <div className="alergenos-section">
              <h3><FaExclamationTriangle /> Alérgenos</h3>
              <p className="alergenos-text">{torta.alergenos}</p>
            </div>
          )}

          {/* Descripción */}
          {items.descripcion && (
            <div className="torta-description">
              <h3>Descripción</h3>
              <p>{items.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de opciones de compra */}
      {showPurchaseModal && (
        <TortaPurchaseOptions
          torta={{
            nombre: items.nombre,
            sabor: torta_sabores.nombre,
            vendedor: torta.vendedor_o_pasteleria,
          }}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default TortaDetailPage;
