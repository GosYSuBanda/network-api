const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'finsmart-network',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Configuración de almacenamiento para imágenes
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'finsmart-network/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Limitar tamaño máximo
      { quality: 'auto' }, // Optimización automática de calidad
      { fetch_format: 'auto' } // Formato automático (WebP cuando sea posible)
    ]
  }
});

// Configuración de almacenamiento para documentos
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'finsmart-network/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    resource_type: 'raw' // Para archivos que no son imágenes/videos
  }
});

// Configuración de almacenamiento para archivos generales
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determinar folder y configuración según tipo de archivo
    const isImage = file.mimetype.startsWith('image/');
    const isDocument = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.mimetype);
    
    let folder = 'finsmart-network/files';
    let resourceType = 'auto';
    let transformation = [];

    if (isImage) {
      folder = 'finsmart-network/images';
      transformation = [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    } else if (isDocument) {
      folder = 'finsmart-network/documents';
      resourceType = 'raw';
    } else {
      folder = 'finsmart-network/files';
      resourceType = 'raw';
    }

    return {
      folder: folder,
      resource_type: resourceType,
      transformation: transformation
    };
  }
});

// Middleware para subida de imágenes (solo imágenes)
const uploadImages = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
    files: 5 // Máximo 5 archivos por vez
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Middleware para subida de documentos (solo documentos)
const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
    files: 3 // Máximo 3 documentos por vez
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX o TXT'), false);
    }
  }
});

// Middleware para subida de archivos mixtos (imágenes + documentos)
const uploadFiles = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite por archivo
    files: 8 // Máximo 8 archivos por vez
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      // Imágenes
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPG, PNG, GIF, WebP) y documentos (PDF, DOC, DOCX, TXT)'), false);
    }
  }
});

// Función para eliminar archivo de Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Error al eliminar archivo: ' + error.message);
  }
};

// Función para eliminar múltiples archivos
const deleteFiles = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error('Error al eliminar archivos: ' + error.message);
  }
};

// Función para generar URL de transformación
const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Función para obtener información de archivo
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    throw new Error('Error al obtener información del archivo: ' + error.message);
  }
};

module.exports = {
  cloudinary,
  uploadImages,
  uploadDocuments,
  uploadFiles,
  deleteFile,
  deleteFiles,
  getTransformedUrl,
  getFileInfo
}; 