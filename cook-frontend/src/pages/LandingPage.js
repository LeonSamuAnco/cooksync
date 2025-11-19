import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaHeart, FaHistory, FaChartLine, FaMagic, FaClock, FaUsers, FaStar } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaMagic />,
      title: 'Recomendaciones Inteligentes',
      description: 'Nuestro sistema de IA analiza tus preferencias y te sugiere recetas perfectas para ti.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
      color: '#667eea'
    },
    {
      icon: <FaHistory />,
      title: 'Historial Completo',
      description: 'Mantén un registro de todas tus recetas vistas, preparadas y calificadas.',
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
      color: '#f59e0b'
    },
    {
      icon: <FaChartLine />,
      title: 'Comparación Inteligente',
      description: 'Compara recetas basándote en ingredientes, tiempo y dificultad.',
      image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400',
      color: '#10b981'
    },
    {
      icon: <FaHeart />,
      title: 'Favoritos Personalizados',
      description: 'Guarda y organiza tus recetas favoritas en colecciones personalizadas.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      color: '#e83e8c'
    }
  ];

  const benefits = [
    {
      icon: <FaClock />,
      title: 'Ahorra Tiempo',
      description: 'Encuentra la receta perfecta en segundos sin buscar por horas.',
      stat: '80% más rápido'
    },
    {
      icon: <FaUsers />,
      title: 'Comunidad Activa',
      description: 'Únete a miles de cocineros compartiendo sus mejores recetas.',
      stat: '+10,000 usuarios'
    },
    {
      icon: <FaStar />,
      title: 'Calidad Garantizada',
      description: 'Todas las recetas están verificadas y calificadas por nuestra comunidad.',
      stat: '4.8/5 estrellas'
    }
  ];

  const recommendations = [
    {
      title: 'Pollo al Horno',
      category: 'Plato Principal',
      time: '45 min',
      difficulty: 'Medio',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300',
      rating: 4.8
    },
    {
      title: 'Pasta Carbonara',
      category: 'Pasta',
      time: '25 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300',
      rating: 4.9
    },
    {
      title: 'Ensalada César',
      category: 'Ensalada',
      time: '15 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      rating: 4.7
    },
    {
      title: 'Tacos de Pescado',
      category: 'Mexicana',
      time: '30 min',
      difficulty: 'Medio',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
      rating: 4.6
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section-main">
        <div className="hero-content-center">
          <h1 className="hero-title-main">
            Bienvenido a CookSync 🍳
          </h1>
          <p className="hero-subtitle-main">
            Tu asistente inteligente para descubrir productos, recetas y mucho más.
            <br />
            ¡Todo en un solo lugar!
          </p>
          <button className="btn-hero-main" onClick={() => navigate('/categorias')}>
            Explorar Productos
          </button>
        </div>
      </section>

      {/* Features Cards */}
      <section className="features-cards-section">
        <div className="features-cards-grid">
          <div className="feature-info-card">
            <div className="feature-info-icon">🛒</div>
            <h3 className="feature-info-title">Productos a tu Medida</h3>
            <p className="feature-info-description">
              Descubre recomendaciones de productos (celulares, ropa, etc.) basadas en tus gustos.
            </p>
          </div>
          <div className="feature-info-card">
            <div className="feature-info-icon">🍳</div>
            <h3 className="feature-info-title">Recetas Inteligentes</h3>
            <p className="feature-info-description">
              Encuentra recetas deliciosas basadas en los ingredientes que ya tienes en casa.
            </p>
          </div>
          <div className="feature-info-card">
            <div className="feature-info-icon">❤️</div>
            <h3 className="feature-info-title">Favoritos Unificados</h3>
            <p className="feature-info-description">
              Guarda y organiza todos tus productos y recetas favoritas en un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="info-banner-content">
          <p>
            Nuestro avanzado sistema de recomendación utiliza inteligencia artificial para analizar tus 
            preferencias y comportamiento, conectándote con los profesionales y servicios perfectos para ti. 
            Desde reparaciones del hogar hasta clases particulares, te ofrecemos soluciones a medida, 
            garantizando calidad, rapidez y confianza. Ahorra tiempo y encuentra exactamente lo que 
            necesitas con nuestras sugerencias inteligentes.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Proceso</span>
            <h2 className="section-title">¿Cómo Funciona?</h2>
            <p className="section-description">
              En solo 3 simples pasos, comienza a disfrutar de recomendaciones personalizadas
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3 className="step-title">Regístrate Gratis</h3>
              <p className="step-description">
                Crea tu cuenta en segundos y configura tus preferencias culinarias y de productos.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Explora y Descubre</h3>
              <p className="step-description">
                Navega por miles de recetas y productos recomendados especialmente para ti.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">❤️</div>
              <h3 className="step-title">Guarda tus Favoritos</h3>
              <p className="step-description">
                Organiza tus recetas y productos favoritos para acceder a ellos cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="recommendations-main-section">
        <div className="section-container">
          <h2 className="section-title-left">Recomendaciones para ti</h2>
          <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card" 
              onClick={() => navigate('/categorias')}
              style={{ cursor: 'pointer' }}
            >
              <div className="feature-image">
                <img src={feature.image} alt={feature.title} />
                <div className="feature-overlay"></div>
                <button className="favorite-btn-card">
                  <FaHeart />
                </button>
              </div>
              <div className="feature-content-simple">
                <h3 className="feature-title-white">{feature.title}</h3>
              </div>
            </div>
          ))}
          </div>
          
          {/* Servicios Populares */}
          <h2 className="section-title-left" style={{ marginTop: '4rem' }}>Servicios populares</h2>
          <div className="services-grid">
            <div className="service-card" onClick={() => navigate('/categorias')}>
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300" alt="Electricidad" />
              </div>
              <div className="service-content">
                <h3 className="service-title">Electricidad</h3>
                <p className="service-description">Instalaciones y reparaciones.</p>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/categorias')}>
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300" alt="Electrodomésticos" />
              </div>
              <div className="service-content">
                <h3 className="service-title">Electrodomésticos</h3>
                <p className="service-description">Técnicos especializados.</p>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/categorias')}>
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300" alt="Pintura" />
              </div>
              <div className="service-content">
                <h3 className="service-title">Pintura</h3>
                <p className="service-description">Interior y exterior de alta calidad.</p>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/categorias')}>
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300" alt="Carpintería" />
              </div>
              <div className="service-content">
                <h3 className="service-title">Carpintería</h3>
                <p className="service-description">Muebles a medida y reparaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-content">
            <span className="section-badge">Beneficios</span>
            <h2 className="section-title">¿Por qué elegir CookSync?</h2>
            <p className="section-description">
              Facilitamos tu vida en la cocina con tecnología inteligente y recomendaciones personalizadas
            </p>
            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <div className="benefit-text">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                    <span className="benefit-stat">{benefit.stat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="benefits-image">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600" 
              alt="Cocinando"
            />
            <div className="floating-card floating-card-1">
              <FaStar className="card-icon" />
              <span>Recetas Verificadas</span>
            </div>
            <div className="floating-card floating-card-2">
              <FaUsers className="card-icon" />
              <span>Comunidad Activa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Preview */}
      <section className="recommendations-section">
        <div className="section-header">
          <span className="section-badge">Recomendaciones</span>
          <h2 className="section-title">Recetas Destacadas Para Ti</h2>
          <p className="section-description">
            Basadas en tus preferencias y las tendencias más populares
          </p>
        </div>
        <div className="recommendations-grid">
          {recommendations.map((recipe, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-image">
                <img src={recipe.image} alt={recipe.title} />
                <button className="favorite-btn">
                  <FaHeart />
                </button>
                <span className="difficulty-badge">{recipe.difficulty}</span>
              </div>
              <div className="recommendation-content">
                <span className="recipe-category">{recipe.category}</span>
                <h3 className="recipe-title">{recipe.title}</h3>
                <div className="recipe-meta">
                  <span className="recipe-time">
                    <FaClock /> {recipe.time}
                  </span>
                  <span className="recipe-rating">
                    <FaStar /> {recipe.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-cta">
          <button className="btn-primary" onClick={() => navigate('/home')}>
            Ver Todas las Recetas
          </button>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-card">
            <div className="info-icon">📱</div>
            <h3>Acceso desde cualquier lugar</h3>
            <p>
              Accede a tus recetas favoritas desde tu computadora, tablet o smartphone.
              Tu despensa virtual siempre contigo.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔒</div>
            <h3>Datos seguros y privados</h3>
            <p>
              Tus preferencias y datos están protegidos con los más altos estándares de seguridad.
              Tu privacidad es nuestra prioridad.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Recomendaciones precisas</h3>
            <p>
              Nuestro algoritmo aprende de tus preferencias para ofrecerte sugerencias cada vez más acertadas.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">💡</div>
            <h3>Consejos de expertos</h3>
            <p>
              Recibe tips y trucos de chefs profesionales para mejorar tus habilidades culinarias constantemente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para transformar tu experiencia culinaria?</h2>
          <p className="cta-description">
            Únete a miles de usuarios que ya disfrutan de recomendaciones personalizadas
          </p>
          <div className="cta-buttons">
            <button className="btn-large btn-primary" onClick={() => navigate('/registro')}>
              <FaRocket /> Registrarse Gratis
            </button>
            <button className="btn-large btn-secondary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
          </div>
          <p className="cta-note">
            ✓ Sin tarjeta de crédito &nbsp;&nbsp; ✓ Acceso inmediato &nbsp;&nbsp; ✓ Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CookSync</h4>
            <p>Tu asistente inteligente para descubrir las mejores recetas del mundo.</p>
          </div>
          <div className="footer-section">
            <h4>Navegación</h4>
            <ul>
              <li><a href="/home">Inicio</a></li>
              <li><a href="/categorias">Categorías</a></li>
              <li><a href="/favoritas">Favoritos</a></li>
              <li><a href="/activity">Actividad</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Soporte</h4>
            <ul>
              <li><a href="/ayuda">Centro de Ayuda</a></li>
              <li><a href="/contacto">Contacto</a></li>
              <li><a href="/terminos">Términos</a></li>
              <li><a href="/privacidad">Privacidad</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Síguenos</h4>
            <div className="social-links">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="social-link">📘 Facebook</a>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="social-link">📷 Instagram</a>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="social-link">🐦 Twitter</a>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="social-link">📺 YouTube</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CookSync. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
