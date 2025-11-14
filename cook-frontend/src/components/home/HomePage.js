import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RecommendationsWidget from '../RecommendationsWidget';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Bienvenido a CookSync 🍳</h1>
        <p>Tu asistente inteligente para descubrir productos, recetas y mucho más. ¡Todo en un solo lugar!</p>
        <button className="cta-button" onClick={() => navigate('/categorias')}>
          Explorar Productos
        </button>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h3>🛍️ Productos a tu Medida</h3>
          <p>Descubre recomendaciones de productos (celulares, ropa, etc.) basadas en tus gustos.</p>
        </div>
        <div className="feature-card">
          <h3>🍳 Recetas Inteligentes</h3>
          <p>Encuentra recetas deliciosas basadas en los ingredientes que ya tienes en casa.</p>
        </div>
        <div className="feature-card">
          <h3>💖 Favoritos Unificados</h3>
          <p>Guarda y organiza todos tus productos y recetas favoritas en un solo lugar.</p>
        </div>
      </section>

      {/* Sección de Recomendaciones Personalizadas - Solo para usuarios autenticados */}
      {user && (
        <section className="recommendations-section">
          <RecommendationsWidget limit={8} />
        </section>
      )}

      {/* Sección Cómo Funciona */}
      <section className="how-it-works">
        <h2 className="section-title">¿Cómo Funciona?</h2>
        <p className="section-subtitle">En solo 3 simples pasos, comienza tu experiencia</p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Regístrate Gratis</h3>
            <p>Crea tu cuenta en segundos y personaliza tus preferencias.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">🔍</div>
            <h3>Explora Categorías</h3>
            <p>Navega por productos y recetas organizados especialmente para ti.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">❤️</div>
            <h3>Guarda y Disfruta</h3>
            <p>Organiza tus favoritos y accede a ellos cuando quieras.</p>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <h3 className="stat-number">10,000+</h3>
          <p className="stat-label">Recetas Disponibles</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <h3 className="stat-number">5,000+</h3>
          <p className="stat-label">Productos</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3 className="stat-number">15,000+</h3>
          <p className="stat-label">Usuarios Activos</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h3 className="stat-number">4.8/5</h3>
          <p className="stat-label">Calificación</p>
        </div>
      </section>

      {/* Sección de Categorías Populares */}
      <section className="popular-categories">
        <h2 className="section-title">Categorías Populares</h2>
        <p className="section-subtitle">Explora nuestras categorías más visitadas</p>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate('/categorias')}>
            <div className="category-icon">📱</div>
            <h3>Tecnología</h3>
            <p>Celulares, laptops y más</p>
          </div>
          <div className="category-card" onClick={() => navigate('/categorias')}>
            <div className="category-icon">🍽️</div>
            <h3>Cocina</h3>
            <p>Recetas y utensilios</p>
          </div>
          <div className="category-card" onClick={() => navigate('/categorias')}>
            <div className="category-icon">👕</div>
            <h3>Moda</h3>
            <p>Ropa y accesorios</p>
          </div>
          <div className="category-card" onClick={() => navigate('/categorias')}>
            <div className="category-icon">🏠</div>
            <h3>Hogar</h3>
            <p>Decoración y más</p>
          </div>
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="benefits-section">
        <h2 className="section-title">¿Por qué elegir CookSync?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🤖</div>
            <h3>Recomendaciones IA</h3>
            <p>Nuestro sistema de inteligencia artificial aprende de tus gustos para ofrecerte las mejores sugerencias.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <h3>Rápido y Fácil</h3>
            <p>Encuentra lo que necesitas en segundos. Interfaz intuitiva y búsqueda potente.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>
            <h3>Seguro y Confiable</h3>
            <p>Tus datos están protegidos con los más altos estándares de seguridad.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📱</div>
            <h3>Multiplataforma</h3>
            <p>Accede desde cualquier dispositivo: computadora, tablet o smartphone.</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <h2>¿Listo para comenzar?</h2>
        <p>Únete a miles de usuarios que ya disfrutan de CookSync</p>
        <div className="cta-buttons">
          <button className="cta-primary" onClick={() => navigate('/registro')}>
            Registrarse Gratis
          </button>
          <button className="cta-secondary" onClick={() => navigate('/categorias')}>
            Explorar Ahora
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
