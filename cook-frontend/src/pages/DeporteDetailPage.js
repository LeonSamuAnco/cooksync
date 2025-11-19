import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import deporteService from '../services/deporteService';
import activityService from '../services/activityService';
import './DeporteDetailPage.css';

const DeporteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deporte, setDeporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariacion, setSelectedVariacion] = useState(null);

  useEffect(() => {
    const loadDeporte = async () => {
      setLoading(true);
      try {
        const data = await deporteService.getById(id);
        setDeporte(data);

        // Seleccionar primera variación por defecto
        const variaciones = data.items?.deporte_variaciones || [];
        if (variaciones.length > 0) {
          const firstVariacion = variaciones[0];
          setSelectedTalla(firstVariacion.talla);
          setSelectedColor(firstVariacion.color);
          setSelectedVariacion(firstVariacion);
        }

        // Registrar actividad de vista (sin bloquear la carga)
        if (data && data.items) {
          // Ejecutar en background sin await para no bloquear la UI
          activityService.create({
            tipo: 'DEPORTE_VISTO',
            descripcion: `Viste el producto deportivo "${data.items.nombre}"`,
            referenciaId: parseInt(id),
            referenciaTipo: 'deporte',
            metadata: {
              tipoId: data.deporte_tipo_id,
              marcaId: data.marca_id,
              marca: data.deporte_marcas?.nombre,
              tipo: data.deporte_tipos?.nombre,
              genero: data.genero,
            },
          }).then(() => {
          }).catch((actError) => {
            console.warn('⚠️ No se pudo registrar la actividad:', actError.message);
          });
        }
      } catch (error) {
        console.error('Error al cargar deporte:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeporte();
  }, [id]);

  const variaciones = React.useMemo(() => deporte?.items?.deporte_variaciones || [], [deporte]);
  
  // Obtener tallas únicas
  const tallasUnicas = [...new Set(variaciones.map((v) => v.talla))];
  
  // Obtener colores disponibles para la talla seleccionada
  const coloresDisponibles = selectedTalla
    ? [...new Set(variaciones.filter((v) => v.talla === selectedTalla).map((v) => v.color))]
    : [];

  // Actualizar variación seleccionada cuando cambian talla o color
  useEffect(() => {
    if (selectedTalla && selectedColor) {
      const variacion = variaciones.find(
        (v) => v.talla === selectedTalla && v.color === selectedColor
      );
      setSelectedVariacion(variacion || null);
    }
  }, [selectedTalla, selectedColor, variaciones]);

  const handleTallaChange = (talla) => {
    setSelectedTalla(talla);
    
    // Actualizar color si no está disponible en esta talla
    const coloresParaTalla = variaciones
      .filter((v) => v.talla === talla)
      .map((v) => v.color);
    
    if (!coloresParaTalla.includes(selectedColor)) {
      setSelectedColor(coloresParaTalla[0] || null);
    }
  };

  if (loading) {
    return (
      <div className="deporte-detail-loading">
        <div className="spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!deporte) {
    return (
      <div className="deporte-detail-error">
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate('/deportes')} className="btn-back">
          <FaArrowLeft /> Volver a Deportes
        </button>
      </div>
    );
  }

  const nombre = deporte.items?.nombre || 'Sin nombre';
  const descripcion = deporte.items?.descripcion || 'Sin descripción';
  const imagen = deporte.items?.imagen_principal_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen';
  const marca = deporte.deporte_marcas?.nombre || 'Sin marca';
  const deporteTipo = deporte.deporte_tipos?.nombre || '';
  const equipamientoTipo = deporte.deporte_equipamiento_tipos?.nombre || '';
  const genero = deporte.genero;
  const material = deporte.material_principal;
  const coleccion = deporte.coleccion;

  return (
    <div className="deporte-detail-page">
      <div className="deporte-detail-header">
        <button onClick={() => navigate('/deportes')} className="btn-back">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="deporte-detail-container">
        {/* Imagen */}
        <div className="deporte-detail-image">
          <img src={imagen} alt={nombre} />
          <div className="image-badge">
            <span className="badge-marca">{marca}</span>
          </div>
        </div>

        {/* Información y Selección */}
        <div className="deporte-detail-info">
          <div className="breadcrumb">
            <span>{deporteTipo}</span>
            {equipamientoTipo && (
              <>
                <i className="fas fa-chevron-right"></i>
                <span>{equipamientoTipo}</span>
              </>
            )}
          </div>

          <h1 className="product-title">{nombre}</h1>

          {coleccion && (
            <p className="product-collection">
              <i className="fas fa-layer-group"></i> Colección {coleccion}
            </p>
          )}

          <div className="product-specs">
            <div className="spec-item">
              <i className="fas fa-venus-mars"></i>
              <span>{genero}</span>
            </div>
            {material && (
              <div className="spec-item">
                <i className="fas fa-fabric"></i>
                <span>{material}</span>
              </div>
            )}
          </div>

          <p className="product-description">{descripcion}</p>

          {/* Selector de Variaciones */}
          {variaciones.length > 0 && (
            <div className="product-variations">
              {/* Selector de Talla */}
              <div className="variation-group">
                <label>Talla:</label>
                <div className="variation-options">
                  {tallasUnicas.map((talla) => (
                    <button
                      key={talla}
                      className={`variation-btn ${selectedTalla === talla ? 'active' : ''}`}
                      onClick={() => handleTallaChange(talla)}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Color */}
              {selectedTalla && coloresDisponibles.length > 0 && (
                <div className="variation-group">
                  <label>Color:</label>
                  <div className="variation-options">
                    {coloresDisponibles.map((color) => (
                      <button
                        key={color}
                        className={`variation-btn color-btn ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Precio y Stock */}
              {selectedVariacion && (
                <div className="variation-selected">
                  <div className="selected-price">
                    <span className="price-label">Precio:</span>
                    <span className="price-value">${parseFloat(selectedVariacion.precio_usd).toFixed(2)}</span>
                  </div>
                  <div className="selected-stock">
                    <i className={`fas fa-box ${selectedVariacion.stock > 0 ? 'in-stock' : 'out-stock'}`}></i>
                    <span>
                      {selectedVariacion.stock > 0
                        ? `${selectedVariacion.stock} disponibles`
                        : 'Agotado'}
                    </span>
                  </div>
                  {selectedVariacion.sku && (
                    <div className="selected-sku">
                      <span>SKU: {selectedVariacion.sku}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de Compra */}
              <button
                className="btn-add-cart"
                disabled={!selectedVariacion || selectedVariacion.stock === 0}
              >
                <FaShoppingCart />
                {selectedVariacion?.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
              </button>
            </div>
          )}

          {/* Tabla de Variaciones */}
          {variaciones.length > 0 && (
            <div className="variations-table">
              <h3>Todas las Variaciones Disponibles</h3>
              <table>
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th>Color</th>
                    <th>Precio</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variaciones.map((variacion, index) => (
                    <tr
                      key={index}
                      className={
                        variacion.talla === selectedTalla && variacion.color === selectedColor
                          ? 'selected-row'
                          : ''
                      }
                    >
                      <td>{variacion.talla}</td>
                      <td>{variacion.color}</td>
                      <td className="price-cell">${parseFloat(variacion.precio_usd).toFixed(2)}</td>
                      <td className={variacion.stock > 0 ? 'in-stock' : 'out-stock'}>
                        {variacion.stock > 0 ? variacion.stock : 'Agotado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeporteDetailPage;
