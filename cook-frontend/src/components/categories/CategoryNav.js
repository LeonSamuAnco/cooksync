import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryNav.css';

const CategoryNav = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    {
      id: 'recipes',
      name: 'Recetas',
      icon: '🍳',
      description: 'Encuentra recetas deliciosas',
      path: '/recipes',
      color: '#667eea',
    },
    {
      id: 'products',
      name: 'Productos',
      icon: '🛍️',
      description: 'Explora productos disponibles',
      path: '/products',
      color: '#f093fb',
    },
    {
      id: 'pantry',
      name: 'Mi Despensa',
      icon: '🥫',
      description: 'Gestiona tus ingredientes',
      path: '/pantry',
      color: '#4facfe',
    },
    {
      id: 'favorites',
      name: 'Favoritos',
      icon: '❤️',
      description: 'Tus recetas guardadas',
      path: '/favorites',
      color: '#fa709a',
    },
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    navigate(category.path);
  };

  return (
    <div className="category-nav">
      <div className="category-nav-header">
        <h2>📂 Categorías</h2>
        <p>Selecciona una categoría para explorar</p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
            style={{ '--category-color': category.color }}
          >
            <div className="category-icon">{category.icon}</div>
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
            <div className="category-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
