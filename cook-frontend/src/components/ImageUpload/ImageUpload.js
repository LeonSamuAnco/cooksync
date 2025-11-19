import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ 
  type = 'profile', 
  entityId, 
  currentImage, 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:3002';

  /**
   * Validar archivo antes de subir
   */
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP y GIF.';
    }

    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Máximo 5MB.';
    }

    return null;
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    uploadImage(file);
  };

  /**
   * Subir imagen al servidor
   */
  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      if (entityId) {
        formData.append('entityId', entityId.toString());
      }

      // Determinar endpoint según tipo
      let endpoint = `${API_BASE_URL}/upload/${type}`;
      if (entityId && type !== 'profile') {
        endpoint = `${API_BASE_URL}/upload/${type}/${entityId}`;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      const data = await response.json();

      // Callback de éxito
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      setPreview(data.url);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError(err.message || 'Error al subir la imagen');
      
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Abrir selector de archivos
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Eliminar imagen
   */
  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-preview">
        {preview ? (
          <div className="preview-wrapper">
            <img 
              src={preview} 
              alt="Preview" 
              className={`preview-image ${type}-preview`}
            />
            {!uploading && (
              <button 
                className="remove-image-btn"
                onClick={handleRemoveImage}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className={`placeholder ${type}-placeholder`}>
            <span className="placeholder-icon">📷</span>
            <span className="placeholder-text">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="image-upload-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button
          className="upload-btn"
          onClick={handleButtonClick}
          disabled={uploading}
          type="button"
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Subiendo...
            </>
          ) : (
            <>
              📤 {preview ? 'Cambiar imagen' : 'Subir imagen'}
            </>
          )}
        </button>

        {error && (
          <div className="upload-error">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="upload-info">
        <small>Formatos: JPG, PNG, WEBP, GIF • Máximo: 5MB</small>
      </div>
    </div>
  );
};

export default ImageUpload;
