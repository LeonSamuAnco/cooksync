import React, { useState, useEffect } from 'react';
import './ProfileStyles.css';

const ModeratorProfile = ({ user }) => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [moderationStats, setModerationStats] = useState({});
  const [recentActions, setRecentActions] = useState([]);

  useEffect(() => {
    const loadRecentActions = async () => {
      try {
        const response = await fetch(`http://localhost:3002/moderation/recent-actions/${user.id}`);
        const data = await response.json();
        setRecentActions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando acciones recientes:', error);
        setRecentActions([]);
      }
    };

    loadPendingRecipes();
    loadReportedContent();
    loadModerationStats();
    loadRecentActions();
  }, [user.id]);

  const loadPendingRecipes = async () => {
    try {
      const response = await fetch('http://localhost:3002/moderation/pending-recipes');
      const data = await response.json();
      setPendingRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando recetas pendientes:', error);
      setPendingRecipes([]);
    }
  };

  const loadReportedContent = async () => {
    try {
      const response = await fetch('http://localhost:3002/moderation/reported-content');
      const data = await response.json();
      setReportedContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando contenido reportado:', error);
      setReportedContent([]);
    }
  };

  const loadModerationStats = async () => {
    try {
      const response = await fetch('http://localhost:3002/moderation/stats');
      const data = await response.json();
      setModerationStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas de moderación:', error);
    }
  };

  // loadRecentActions moved to useEffect

  const handleApproveRecipe = async (recipeId) => {
    try {
      await fetch(`http://localhost:3002/moderation/approve-recipe/${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moderatorId: user.id })
      });
      loadPendingRecipes(); // Recargar lista
    } catch (error) {
      console.error('Error aprobando receta:', error);
    }
  };

  const handleRejectRecipe = async (recipeId, reason) => {
    try {
      await fetch(`http://localhost:3002/moderation/reject-recipe/${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moderatorId: user.id, reason })
      });
      loadPendingRecipes(); // Recargar lista
    } catch (error) {
      console.error('Error rechazando receta:', error);
    }
  };

  return (
    <div className="profile-container moderator-profile">
      {/* Header del moderador */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={user.fotoPerfil || '/moderator-avatar.png'} 
            alt="Avatar"
            className="avatar-image"
          />
        </div>
        <div className="profile-info">
          <h1>Panel de Moderación 🛡️</h1>
          <p className="profile-subtitle">Moderador: {user.nombres} {user.apellidos}</p>
          <div className="moderator-stats">
            <div className="stat-item">
              <span className="stat-number">{pendingRecipes?.length || 0}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{reportedContent?.length || 0}</span>
              <span className="stat-label">Reportes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{moderationStats.approvedToday || 0}</span>
              <span className="stat-label">Aprobadas Hoy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard del moderador */}
      <div className="dashboard-grid">
        {/* Recetas pendientes de aprobación */}
        <div className="dashboard-card pending-recipes-card">
          <h3>⏳ Recetas Pendientes de Aprobación</h3>
          <div className="pending-recipes-list">
            {(pendingRecipes || []).slice(0, 3).map(recipe => (
              <div key={recipe.id} className="pending-recipe-item">
                <div className="recipe-preview">
                  <img src={recipe.imagenPrincipal} alt={recipe.nombre} />
                  <div className="recipe-info">
                    <h4>{recipe.nombre}</h4>
                    <p>Por: {recipe.autor.nombres} {recipe.autor.apellidos}</p>
                    <small>Enviado: {recipe.createdAt}</small>
                  </div>
                </div>
                <div className="recipe-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApproveRecipe(recipe.id)}
                  >
                    ✅ Aprobar
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleRejectRecipe(recipe.id, 'Revisión necesaria')}
                  >
                    ❌ Rechazar
                  </button>
                  <button className="review-btn">👁️ Revisar</button>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">Ver todas las pendientes ({pendingRecipes?.length || 0})</button>
        </div>

        {/* Contenido reportado */}
        <div className="dashboard-card reported-content-card">
          <h3>🚨 Contenido Reportado</h3>
          <div className="reported-content-list">
            {(reportedContent || []).slice(0, 4).map(report => (
              <div key={report.id} className="reported-item">
                <div className="report-info">
                  <h4>{report.tipo}: {report.contenido.titulo}</h4>
                  <p>Motivo: {report.motivo}</p>
                  <small>Reportado por: {report.reportadoPor.nombres}</small>
                </div>
                <div className="report-actions">
                  <button className="investigate-btn">🔍 Investigar</button>
                  <button className="dismiss-btn">✅ Descartar</button>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">Ver todos los reportes ({reportedContent?.length || 0})</button>
        </div>

        {/* Estadísticas de moderación */}
        <div className="dashboard-card moderation-stats-card">
          <h3>📊 Estadísticas de Moderación</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <h4>Hoy</h4>
              <p className="stat-value">{moderationStats.approvedToday || 0}</p>
              <small>recetas aprobadas</small>
            </div>
            <div className="stat-box">
              <h4>Esta Semana</h4>
              <p className="stat-value">{moderationStats.approvedWeek || 0}</p>
              <small>recetas aprobadas</small>
            </div>
            <div className="stat-box">
              <h4>Rechazadas</h4>
              <p className="stat-value">{moderationStats.rejectedWeek || 0}</p>
              <small>esta semana</small>
            </div>
            <div className="stat-box">
              <h4>Tiempo Promedio</h4>
              <p className="stat-value">{moderationStats.avgReviewTime || 0}h</p>
              <small>de revisión</small>
            </div>
          </div>
        </div>

        {/* Herramientas de moderación */}
        <div className="dashboard-card moderation-tools-card">
          <h3>🛠️ Herramientas de Moderación</h3>
          <div className="moderation-tools">
            <button className="moderation-tool-btn">
              <span className="tool-icon">🍽️</span>
              Revisar Recetas
            </button>
            <button className="moderation-tool-btn">
              <span className="tool-icon">💬</span>
              Moderar Comentarios
            </button>
            <button className="moderation-tool-btn">
              <span className="tool-icon">🚫</span>
              Gestionar Reportes
            </button>
            <button className="moderation-tool-btn">
              <span className="tool-icon">👥</span>
              Revisar Usuarios
            </button>
            <button className="moderation-tool-btn">
              <span className="tool-icon">📋</span>
              Generar Reportes
            </button>
            <button className="moderation-tool-btn">
              <span className="tool-icon">⚙️</span>
              Configurar Filtros
            </button>
          </div>
        </div>

        {/* Acciones recientes */}
        <div className="dashboard-card recent-actions-card">
          <h3>📈 Mis Acciones Recientes</h3>
          <div className="actions-list">
            {(recentActions || []).slice(0, 6).map((action, index) => (
              <div key={index} className="action-item">
                <span className="action-icon">{action.icon}</span>
                <div className="action-text">
                  <p>{action.description}</p>
                  <small>{action.timestamp}</small>
                </div>
                <span className={`action-status ${action.type}`}>
                  {action.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de moderación */}
        <div className="dashboard-card moderation-alerts-card">
          <h3>🔔 Alertas de Moderación</h3>
          <div className="alerts-list">
            <div className="alert-item high-priority">
              <span className="alert-icon">🚨</span>
              <div className="alert-text">
                <h4>Contenido Inapropiado Detectado</h4>
                <p>Sistema automático detectó posible contenido ofensivo</p>
                <small>Hace 5 min</small>
              </div>
            </div>
            <div className="alert-item medium-priority">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">
                <h4>Múltiples Reportes</h4>
                <p>Receta "Pollo a la brasa" ha sido reportada 3 veces</p>
                <small>Hace 30 min</small>
              </div>
            </div>
            <div className="alert-item low-priority">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-text">
                <h4>Cola de Revisión</h4>
                <p>15 recetas esperando revisión por más de 24h</p>
                <small>Hace 1 hora</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorProfile;
