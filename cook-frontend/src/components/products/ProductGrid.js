import React from 'react';
import './ProductGrid.css';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={() => onClick?.(product)}>
      <div className="product-image">
        <img 
          src={product.imageUrl || product.imagenUrl || '/placeholder.svg'} 
          alt={product.name || product.nombre}
          onError={(e) => {
            e.target.src = '/placeholder.svg';
          }}
        />
      </div>
      <div className="product-content">
        <h3 className="product-title">{product.name || product.nombre}</h3>
        <p className="product-description">
          {product.description || product.descripcion || 'Producto de calidad premium'}
        </p>
        {product.price && (
          <p className="product-price">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
          </p>
        )}
      </div>
    </div>
  );
};

const ProductGrid = ({ products, loading, onProductClick, emptyMessage }) => {
  if (loading) {
    return (
      <div className="product-grid-loading">
        <div className="loading-spinner">⏳</div>
        <p>Cargando productos increíbles...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <div className="empty-icon">🛍️</div>
        <h3>No hay productos disponibles</h3>
        <p>{emptyMessage || 'No se encontraron productos que coincidan con tu búsqueda. Intenta con otros filtros.'}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id || index} 
          product={product} 
          onClick={onProductClick} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;
