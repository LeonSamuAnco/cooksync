import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaGlobe, FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import lugarService from '../services/lugarService';
import activityService from '../services/activityService';
import './LugarDetailPage.css';

const LugarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLugar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadLugar = async () => {
    setLoading(true);
    try {
      const data = await lugarService.getById(id);
      setLugar(data);

      // Registrar actividad de vista (sin bloquear la carga)
      if (data && data.items) {
        // Ejecutar en background sin await para no bloquear la UI
        activityService.create({
          tipo: 'LUGAR_VISTO',
          descripcion: `Viste el lugar "${data.items.nombre}"`,
          referenciaId: parseInt(id),
          referenciaTipo: 'lugar',
          metadata: {
            tipoId: data.lugar_tipo_id,
            tipo: data.lugar_tipos?.nombre,
            ciudad: data.ciudad,
            pais: data.pais,
          },
        }).then(() => {
        }).catch((actError) => {
          console.warn('⚠️ No se pudo registrar la actividad:', actError.message);
        });
      }
    } catch (error) {
      console.error('Error al cargar lugar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lugar-detail-loading">
        <div className="spinner"></div>
        <p>Cargando lugar...</p>
      </div>
    );
  }

  if (!lugar) {
    return (
      <div className="lugar-detail-error">
        <h2>Lugar no encontrado</h2>
        <button onClick={() => navigate('/lugares')} className="btn-back">
          <FaArrowLeft /> Volver a Lugares
        </button>
      </div>
    );
  }

  const nombre = lugar.items?.nombre || 'Sin nombre';
  const descripcion = lugar.items?.descripcion || 'Sin descripción';
  const imagen = lugar.items?.imagen_principal_url || 'https://via.placeholder.com/800x500?text=Sin+Imagen';
  const tipo = lugar.lugar_tipos?.nombre || 'Sin tipo';
  const tipoIcono = lugar.lugar_tipos?.icono || 'fas fa-map-marker-alt';
  const rangoPrecio = lugar.lugar_rangos_precio;
  const horarios = lugar.items?.lugar_horarios || [];
  const servicios = lugar.items?.lugar_tiene_servicios || [];

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lugar.latitud},${lugar.longitud}`;
    window.open(url, '_blank');
  };

  return (
    <div className="lugar-detail-page">
      {/* Header con botón de regreso */}
      <div className="lugar-detail-header">
        <button onClick={() => navigate('/lugares')} className="btn-back">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Imagen principal */}
      <div className="lugar-detail-image">
        <img src={imagen} alt={nombre} />
        <div className="lugar-detail-badges">
          <span className="badge-tipo">
            <i className={tipoIcono}></i> {tipo}
          </span>
          {rangoPrecio && (
            <span className="badge-precio" title={rangoPrecio.descripcion}>
              {rangoPrecio.simbolo}
            </span>
          )}
        </div>
      </div>

      <div className="lugar-detail-container">
        <div className="lugar-detail-main">
          {/* Información principal */}
          <section className="lugar-detail-info">
            <h1 className="lugar-detail-title">{nombre}</h1>
            <p className="lugar-detail-description">{descripcion}</p>
          </section>

          {/* Ubicación */}
          <section className="lugar-detail-section">
            <h2><FaMapMarkerAlt /> Ubicación</h2>
            <div className="location-info">
              <p className="location-main">
                <strong>{lugar.ciudad}, {lugar.pais}</strong>
              </p>
              <p className="location-address">{lugar.direccion}</p>
              <button onClick={openGoogleMaps} className="btn-map">
                <FaMapMarkerAlt /> Ver en Google Maps
              </button>
            </div>
          </section>

          {/* Horarios */}
          {horarios.length > 0 && (
            <section className="lugar-detail-section">
              <h2><FaClock /> Horarios de Atención</h2>
              <div className="horarios-grid">
                {diasSemana.map((dia) => {
                  const horario = horarios.find((h) => h.dia_semana === dia);
                  return (
                    <div key={dia} className={`horario-item ${horario ? 'active' : 'inactive'}`}>
                      <span className="horario-dia">{dia}</span>
                      <span className="horario-horas">
                        {horario
                          ? `${formatTime(horario.hora_apertura)} - ${formatTime(horario.hora_cierre)}`
                          : 'Cerrado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Servicios */}
          {servicios.length > 0 && (
            <section className="lugar-detail-section">
              <h2><FaStar /> Servicios Disponibles</h2>
              <div className="servicios-grid">
                {servicios.map((servicio, index) => (
                  <div key={index} className="servicio-item">
                    <i className={servicio.lugar_servicios?.icono || 'fas fa-check'}></i>
                    <span>{servicio.lugar_servicios?.nombre}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar con acciones */}
        <aside className="lugar-detail-sidebar">
          <div className="sidebar-card">
            <h3>Contacto</h3>
            
            {lugar.telefono && (
              <a href={`tel:${lugar.telefono}`} className="contact-btn phone-btn">
                <FaPhone />
                <div>
                  <span className="contact-label">Llamar</span>
                  <span className="contact-value">{lugar.telefono}</span>
                </div>
              </a>
            )}

            {lugar.sitio_web && (
              <a
                href={lugar.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn web-btn"
              >
                <FaGlobe />
                <div>
                  <span className="contact-label">Visitar Sitio Web</span>
                  <span className="contact-value">Ver más información</span>
                </div>
              </a>
            )}

            <button onClick={openGoogleMaps} className="contact-btn map-btn">
              <FaMapMarkerAlt />
              <div>
                <span className="contact-label">Cómo llegar</span>
                <span className="contact-value">Abrir en Maps</span>
              </div>
            </button>
          </div>

          {rangoPrecio && (
            <div className="sidebar-card price-card">
              <h3>Rango de Precio</h3>
              <div className="price-info">
                <span className="price-symbol">{rangoPrecio.simbolo}</span>
                <span className="price-description">{rangoPrecio.descripcion}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LugarDetailPage;
