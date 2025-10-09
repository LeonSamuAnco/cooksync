import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Bienvenido a CookSync 🚀</h1>
        <p>Tu asistente inteligente para descubrir productos, recetas y mucho más. ¡Todo en un solo lugar!</p>
        <button className="cta-button" onClick={() => navigate('/productos')}>
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
    </div>
  );
};

export default HomePage;
