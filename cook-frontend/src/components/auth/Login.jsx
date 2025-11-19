"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./AuthForms.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, getDashboardRoute } = useAuth()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        // Redirigir al dashboard según el rol del usuario (reemplazar en historial)
        navigate(getDashboardRoute(), { replace: true })
      } else {
        setError(result.error || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error al conectar con el servidor")
      console.error("Error en login:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modern-auth-container">
      {/* Lado izquierdo - Información */}
      <div className="auth-left-side">
        <div className="auth-brand">
          <span className="brand-icon">🍳</span>
          <span className="brand-text">CookSync</span>
        </div>
        
        <div className="auth-welcome">
          <h1>¡Bienvenido de <span className="highlight">vuelta!</span></h1>
          <p>Accede a tu cuenta para disfrutar de recetas personalizadas, seguimiento de ingredientes y una experiencia culinaria única.</p>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">👤</span>
            <span className="feature-text">Perfil personalizado</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⭐</span>
            <span className="feature-text">Recetas favoritas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛒</span>
            <span className="feature-text">Lista de compras inteligente</span>
          </div>
        </div>

        <div className="auth-image">
          <img 
            src="/chef-cooking.jpg" 
            alt="Chef cocinando" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="image-placeholder">
            <span className="placeholder-icon">👨‍🍳</span>
            <p>Descubre miles de recetas deliciosas</p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="auth-right-side">
        <div className="auth-form-container">
          <div className="form-header">
            <div className="form-logo">
              <span className="logo-icon">🍳</span>
            </div>
            <h2>Iniciar Sesión</h2>
            <p>Ingresa a tu cuenta de CookSync</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="email">Email o Teléfono</label>
              <div className="input-container">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com o 987654321"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Recordarme
              </label>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="modern-submit-btn" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿No tienes una cuenta? <span onClick={() => navigate("/registro")} className="auth-link">Regístrate aquí</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
