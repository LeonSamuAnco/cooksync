import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RecipeReviews.css';

const RecipeReviews = ({ recipeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    calificacion: 5,
    tituloResena: '',
    comentario: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = 'http://localhost:3002';

  useEffect(() => {
    loadReviews();
    loadStats();
    if (user) {
      loadUserReview();
    }
  }, [recipeId, page, user]);

  /**
   * Cargar reseñas de la receta
   */
  const loadReviews = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/recipe/${recipeId}?page=${page}&limit=5&orderBy=recent`
      );
      const data = await response.json();
      
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas de reseñas
   */
  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/recipe/${recipeId}/stats`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  /**
   * Cargar reseña del usuario actual
   */
  const loadUserReview = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/user/${user.id}/recipe/${recipeId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setUserReview(data);
        setFormData({
          calificacion: data.calificacion,
          tituloResena: data.tituloResena || '',
          comentario: data.comentario || '',
        });
      }
    } catch (error) {
      console.error('Error cargando reseña del usuario:', error);
    }
  };

  /**
   * Enviar reseña
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = userReview
        ? `${API_BASE_URL}/reviews/${userReview.id}`
        : `${API_BASE_URL}/reviews`;
      
      const method = userReview ? 'PUT' : 'POST';
      
      const body = userReview
        ? formData
        : { ...formData, recetaId: parseInt(recipeId) };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setUserReview(data);
        setShowForm(false);
        loadReviews();
        loadStats();
        alert(userReview ? 'Reseña actualizada' : 'Reseña publicada');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar reseña');
      }
    } catch (error) {
      console.error('Error guardando reseña:', error);
      alert('Error al guardar reseña');
    }
  };

  /**
   * Eliminar reseña
   */
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar tu reseña?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/reviews/${userReview.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUserReview(null);
        setFormData({ calificacion: 5, tituloResena: '', comentario: '' });
        loadReviews();
        loadStats();
        alert('Reseña eliminada');
      }
    } catch (error) {
      console.error('Error eliminando reseña:', error);
    }
  };

  /**
   * Marcar como útil
   */
  const handleMarkHelpful = async (reviewId) => {
    try {
      await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      loadReviews();
    } catch (error) {
      console.error('Error marcando como útil:', error);
    }
  };

  /**
   * Renderizar estrellas
   */
  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  /**
   * Renderizar distribución de calificaciones
   */
  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0
            ? (count / stats.totalReviews) * 100
            : 0;

          return (
            <div key={rating} className="rating-bar">
              <span className="rating-label">{rating} ★</span>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="rating-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Cargando reseñas...</div>;
  }

  return (
    <div className="recipe-reviews-container">
      {/* Estadísticas */}
      {stats && (
        <div className="reviews-stats">
          <div className="stats-summary">
            <div className="average-rating">
              <span className="rating-number">{stats.averageRating.toFixed(1)}</span>
              {renderStars(Math.round(stats.averageRating))}
              <span className="total-reviews">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {/* Formulario de reseña del usuario */}
      {user && (
        <div className="user-review-section">
          {userReview && !showForm ? (
            <div className="user-review-card">
              <h3>Tu reseña</h3>
              {renderStars(userReview.calificacion)}
              {userReview.tituloResena && (
                <h4>{userReview.tituloResena}</h4>
              )}
              {userReview.comentario && <p>{userReview.comentario}</p>}
              <div className="review-actions">
                <button onClick={() => setShowForm(true)} className="btn-edit">
                  ✏️ Editar
                </button>
                <button onClick={handleDelete} className="btn-delete">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ) : (
            <>
              {!userReview && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-write-review"
                >
                  ✍️ Escribir una reseña
                </button>
              )}

              {showForm && (
                <form onSubmit={handleSubmit} className="review-form">
                  <h3>{userReview ? 'Editar reseña' : 'Escribir reseña'}</h3>
                  
                  <div className="form-group">
                    <label>Calificación *</label>
                    {renderStars(formData.calificacion, true, (rating) =>
                      setFormData({ ...formData, calificacion: rating })
                    )}
                  </div>

                  <div className="form-group">
                    <label>Título (opcional)</label>
                    <input
                      type="text"
                      value={formData.tituloResena}
                      onChange={(e) =>
                        setFormData({ ...formData, tituloResena: e.target.value })
                      }
                      maxLength={200}
                      placeholder="Resume tu experiencia"
                    />
                  </div>

                  <div className="form-group">
                    <label>Comentario (opcional)</label>
                    <textarea
                      value={formData.comentario}
                      onChange={(e) =>
                        setFormData({ ...formData, comentario: e.target.value })
                      }
                      maxLength={2000}
                      rows={5}
                      placeholder="Cuéntanos qué te pareció esta receta..."
                    />
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="btn-submit">
                      {userReview ? 'Actualizar' : 'Publicar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-cancel"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="reviews-list">
        <h3>Reseñas de usuarios</h3>
        
        {reviews.length === 0 ? (
          <p className="no-reviews">
            Aún no hay reseñas. ¡Sé el primero en dejar una!
          </p>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img
                      src={review.usuario.fotoPerfil || '/default-avatar.png'}
                      alt={review.usuario.nombres}
                      className="reviewer-avatar"
                    />
                    <div>
                      <span className="reviewer-name">
                        {review.usuario.nombres} {review.usuario.apellidos}
                      </span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  </div>
                  {renderStars(review.calificacion)}
                </div>

                {review.tituloResena && (
                  <h4 className="review-title">{review.tituloResena}</h4>
                )}

                {review.comentario && (
                  <p className="review-comment">{review.comentario}</p>
                )}

                <div className="review-footer">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="btn-helpful"
                  >
                    👍 Útil ({review.esUtil})
                  </button>
                </div>
              </div>
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-page"
                >
                  ← Anterior
                </button>
                <span className="page-info">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-page"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeReviews;
