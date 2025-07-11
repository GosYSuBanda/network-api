const { uploadFiles, uploadImages, uploadDocuments } = require('../config/cloudinary');

/**
 * Middleware para manejar errores de subida de archivos
 */
const handleUploadError = (error, req, res, next) => {
  if (error) {
    // Errores específicos de multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Archivo demasiado grande. Límite máximo: 5MB',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo permitido: 8 archivos',
        error: 'TOO_MANY_FILES'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
        error: 'UNEXPECTED_FILE_FIELD'
      });
    }
    
    // Errores de validación de tipo de archivo
    if (error.message.includes('Solo se permiten') || error.message.includes('Tipo de archivo no permitido')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'INVALID_FILE_TYPE'
      });
    }
    
    // Errores de Cloudinary
    if (error.message.includes('cloudinary')) {
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivo al servicio de almacenamiento',
        error: 'UPLOAD_SERVICE_ERROR'
      });
    }
    
    // Error genérico
    return res.status(400).json({
      success: false,
      message: error.message || 'Error en la subida de archivos',
      error: 'UPLOAD_ERROR'
    });
  }
  
  next();
};

/**
 * Middleware para subir archivos múltiples (imágenes + documentos)
 */
const uploadMultipleFiles = (fieldName = 'files') => {
  return [
    uploadFiles.array(fieldName, 8), // Máximo 8 archivos
    handleUploadError
  ];
};

/**
 * Middleware para subir solo imágenes
 */
const uploadMultipleImages = (fieldName = 'images') => {
  return [
    uploadImages.array(fieldName, 5), // Máximo 5 imágenes
    handleUploadError
  ];
};

/**
 * Middleware para subir solo documentos
 */
const uploadMultipleDocuments = (fieldName = 'documents') => {
  return [
    uploadDocuments.array(fieldName, 3), // Máximo 3 documentos
    handleUploadError
  ];
};

/**
 * Middleware para subir archivo único
 */
const uploadSingleFile = (fieldName = 'file') => {
  return [
    uploadFiles.single(fieldName),
    handleUploadError
  ];
};

/**
 * Middleware para subir imagen única
 */
const uploadSingleImage = (fieldName = 'image') => {
  return [
    uploadImages.single(fieldName),
    handleUploadError
  ];
};

/**
 * Middleware para subir documento único
 */
const uploadSingleDocument = (fieldName = 'document') => {
  return [
    uploadDocuments.single(fieldName),
    handleUploadError
  ];
};

/**
 * Middleware para procesar archivos subidos y agregar metadata
 */
const processUploadedFiles = (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Procesar array de archivos
      req.uploadedFiles = req.files.map(file => ({
        type: file.mimetype.startsWith('image/') ? 'image' : 
              ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.mimetype) ? 'document' : 'file',
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      }));
    } else if (req.file) {
      // Procesar archivo único
      req.uploadedFile = {
        type: req.file.mimetype.startsWith('image/') ? 'image' : 
              ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(req.file.mimetype) ? 'document' : 'file',
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      };
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar archivos subidos',
      error: error.message
    });
  }
};

/**
 * Middleware para validar que se subieron archivos (cuando son requeridos)
 */
const requireFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere al menos un archivo',
      error: 'NO_FILES_UPLOADED'
    });
  }
  next();
};

/**
 * Middleware para validar que se subió un archivo (cuando es requerido)
 */
const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un archivo',
      error: 'NO_FILE_UPLOADED'
    });
  }
  next();
};

module.exports = {
  uploadMultipleFiles,
  uploadMultipleImages,
  uploadMultipleDocuments,
  uploadSingleFile,
  uploadSingleImage,
  uploadSingleDocument,
  processUploadedFiles,
  requireFiles,
  requireFile,
  handleUploadError
}; 