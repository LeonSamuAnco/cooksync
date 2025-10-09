import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./AuthForms.css"

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    tipoDocumentoId: 1, // Default to DNI
    numeroDocumento: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "O",
    aceptaTerminos: false,
    aceptaMarketing: false,
    rolId: 1, // Cliente por defecto
  })
  const [roles, setRoles] = useState([])
  const [documentTypes, setDocumentTypes] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // Cargar roles y tipos de documento al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Cargando roles y tipos de documento...');
        
        const [rolesResponse, docTypesResponse] = await Promise.all([
          fetch("http://localhost:3002/auth/roles"),
          fetch("http://localhost:3002/auth/document-types")
        ])
        
        console.log('📡 Respuesta roles:', rolesResponse.status);
        console.log('📡 Respuesta tipos documento:', docTypesResponse.status);
        
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json()
          console.log('✅ Roles cargados:', rolesData);
          setRoles(rolesData)
        } else {
          console.error('❌ Error al cargar roles:', rolesResponse.statusText);
        }
        
        if (docTypesResponse.ok) {
          const docTypesData = await docTypesResponse.json()
          console.log('✅ Tipos de documento cargados:', docTypesData);
          setDocumentTypes(docTypesData)
        } else {
          console.error('❌ Error al cargar tipos de documento:', docTypesResponse.statusText);
        }
      } catch (error) {
        console.error("❌ Error cargando datos:", error)
      }
    }
    
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'tipoDocumentoId' || name === 'rolId' ? parseInt(value) : value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!formData.aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("http://localhost:3002/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          password: formData.password,
          tipoDocumentoId: formData.tipoDocumentoId,
          numeroDocumento: formData.numeroDocumento,
          telefono: formData.telefono || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          genero: formData.genero,
          aceptaTerminos: formData.aceptaTerminos,
          aceptaMarketing: formData.aceptaMarketing,
          rolId: formData.rolId,
        }),
      })

      if (response.ok) {
        const userData = await response.json()
        
        // Si el registro incluye login automático
        if (userData.access_token) {
          localStorage.setItem("authToken", userData.access_token)
          localStorage.setItem("user", JSON.stringify(userData.user))
          navigate("/dashboard")
        } else {
          // Si no, redirigir al login
          navigate("/login")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error al registrar el usuario")
      }
    } catch (err) {
      setError("Error al conectar con el servidor")
      console.error("Error en registro:", err)
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
          <h1>Crea tu cuenta y <span className="highlight">disfruta</span></h1>
          <p>Únete a miles de usuarios satisfechos y accede a recetas personalizadas, ofertas especiales y la mejor experiencia culinaria.</p>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Recomendaciones personalizadas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⭐</span>
            <span className="feature-text">Acceso a recetas exclusivas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span className="feature-text">Garantía de calidad en ingredientes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span className="feature-text">Soporte técnico prioritario</span>
          </div>
        </div>

        <div className="auth-image">
          <img 
            src="/cooking-ingredients.jpg" 
            alt="Ingredientes de cocina" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="image-placeholder">
            <span className="placeholder-icon">🥘</span>
            <p>Ingredientes frescos y recetas deliciosas</p>
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
            <h2>Crear Cuenta</h2>
            <p>Únete a la familia CookSync</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="nombres">Nombre</label>
                <div className="input-container">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div className="form-group half-width">
                <label htmlFor="apellidos">Apellido</label>
                <div className="input-container">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <div className="input-container">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="987 654 321"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
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
                    minLength="6"
                    placeholder="Mínimo 8 caracteres"
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

              <div className="form-group half-width">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="tipoDocumentoId">Tipo de Documento</label>
                <div className="input-container">
                  <span className="input-icon">📄</span>
                  <select
                    id="tipoDocumentoId"
                    name="tipoDocumentoId"
                    value={formData.tipoDocumentoId}
                    onChange={handleChange}
                    required
                  >
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group half-width">
                <label htmlFor="numeroDocumento">Número de Documento</label>
                <div className="input-container">
                  <span className="input-icon">🆔</span>
                  <input
                    type="text"
                    id="numeroDocumento"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    required
                    placeholder="12345678"
                    maxLength="20"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rolId">Tipo de Usuario</label>
              <div className="input-container">
                <span className="input-icon">👥</span>
                <select
                  id="rolId"
                  name="rolId"
                  value={formData.rolId}
                  onChange={handleChange}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                  required
                />
                <span className="checkmark"></span>
                Acepto los <a href="#" className="terms-link">términos y condiciones</a> y la <a href="#" className="terms-link">política de privacidad</a>
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="aceptaMarketing"
                  checked={formData.aceptaMarketing}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Quiero recibir ofertas especiales y novedades por email
              </label>
            </div>

            <button type="submit" className="modern-submit-btn" disabled={loading}>
              {loading ? "Creando Cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿Ya tienes una cuenta? <span onClick={() => navigate("/login")} className="auth-link">Inicia sesión aquí</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
