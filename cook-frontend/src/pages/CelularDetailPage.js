import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import celularService from '../services/celularService';
import activityService from '../services/activityService';
import CelularPurchaseOptions from '../components/celulares/CelularPurchaseOptions';
import './CelularDetailPage.css';

const CelularDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [celular, setCelular] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadCelular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCelular = async () => {
    setLoading(true);
    try {
      const data = await celularService.getById(id);
      setCelular(data);
      
      // Registrar actividad de vista (sin bloquear la carga)
      if (data && data.items) {
        // Ejecutar en background sin await para no bloquear la UI
        activityService.create({
          tipo: 'CELULAR_VISTO',
          descripcion: `Viste el celular "${data.items.nombre}"`,
          referenciaId: parseInt(id),
          referenciaTipo: 'celular',
          metadata: {
            marcaId: data.marca_id,
            gamaId: data.gama_id,
            marca: data.celular_marcas?.nombre,
            modelo: data.modelo,
          },
        }).then(() => {
          console.log('✅ Actividad de celular registrada');
        }).catch((actError) => {
          console.warn('⚠️ No se pudo registrar la actividad:', actError.message);
        });
      }
    } catch (error) {
      console.error('Error al cargar celular:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="celular-detail-loading">
        <div className="spinner"></div>
        <p>Cargando celular...</p>
      </div>
    );
  }

  if (!celular) {
    return (
      <div className="celular-detail-error">
        <h2>Celular no encontrado</h2>
        <button onClick={() => navigate('/celulares', { replace: true })}>
          Volver a Celulares
        </button>
      </div>
    );
  }

  const { items, celular_marcas, celular_gamas, celular_sistemas_operativos } = celular;
  const celular_camaras = items?.celular_camaras || [];

  return (
    <div className="celular-detail-page">
      <button className="back-button" onClick={() => navigate('/celulares', { replace: true })}>
        <FaArrowLeft /> Volver a Celulares
      </button>

      <div className="celular-detail-container">
        {/* Sección de imagen */}
        <div className="celular-detail-image">
          {items?.imagen_principal_url ? (
            <img src={items.imagen_principal_url} alt={items.nombre} />
          ) : (
            <div className="image-placeholder">
              <span className="placeholder-icon">📱</span>
              <p>Imagen no disponible</p>
            </div>
          )}
        </div>

        <div className="celular-detail-info">
          <div className="celular-brand-header">{celular_marcas.nombre}</div>
          <h1 className="celular-title">{items.nombre}</h1>
          
          <div className="celular-badges">
            <span className="badge gama">{celular_gamas.gama}</span>
            <span className="badge os">{celular_sistemas_operativos.nombre}</span>
            {celular.conectividad_5g && <span className="badge badge-5g">5G</span>}
          </div>

          {/* Botón de Dónde Comprar */}
          <button 
            className="buy-button"
            onClick={() => setShowPurchaseModal(true)}
          >
            <FaShoppingCart /> Dónde Comprar
          </button>

          <div className="celular-specs-grid">
            <div className="spec-card">
              <div className="spec-icon">📱</div>
              <div className="spec-label">Pantalla</div>
              <div className="spec-value">{celular.pantalla_tamano_pulgadas}"</div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">💾</div>
              <div className="spec-label">RAM</div>
              <div className="spec-value">{celular.memoria_ram_gb} GB</div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">📦</div>
              <div className="spec-label">Almacenamiento</div>
              <div className="spec-value">{celular.almacenamiento_interno_gb} GB</div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">🔋</div>
              <div className="spec-label">Batería</div>
              <div className="spec-value">{celular.bateria_capacidad_mah} mAh</div>
            </div>

            {celular.peso_gramos && (
              <div className="spec-card">
                <div className="spec-icon">⚖️</div>
                <div className="spec-label">Peso</div>
                <div className="spec-value">{celular.peso_gramos}g</div>
              </div>
            )}

            {celular.resistencia_agua_ip && (
              <div className="spec-card">
                <div className="spec-icon">💧</div>
                <div className="spec-label">Resistencia</div>
                <div className="spec-value">{celular.resistencia_agua_ip}</div>
              </div>
            )}
          </div>

          {celular_camaras && celular_camaras.length > 0 && (
            <div className="cameras-section">
              <h3>📷 Cámaras</h3>
              <div className="cameras-grid">
                {celular_camaras.map((camara, index) => (
                  <div key={index} className="camera-card">
                    <div className="camera-type">{camara.celular_tipos_lente?.tipo || 'N/A'}</div>
                    <div className="camera-mp">{camara.megapixeles} MP</div>
                    {camara.apertura && (
                      <div className="camera-aperture">f/{camara.apertura}</div>
                    )}
                    {camara.estabilizacion_optica && (
                      <div className="camera-ois">✓ OIS</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.descripcion && (
            <div className="celular-description">
              <h3>Descripción</h3>
              <p>{items.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de opciones de compra */}
      {showPurchaseModal && (
        <CelularPurchaseOptions
          celular={{
            marca: celular_marcas.nombre,
            modelo: items.nombre
          }}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default CelularDetailPage;
