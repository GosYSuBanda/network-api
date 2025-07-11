const jwtService = require('../utils/jwt');
const User = require('../../modules/users/models/user.model');

/**
 * Middleware de autenticación JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Extraer token del header
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar y decodificar token
    const decoded = jwtService.verifyToken(token);
    
    // Verificar que el usuario existe y está activo
    const user = await User.findById(decoded.userId).populate('roleId');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      _id: user._id,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.roleId,
      status: user.status
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // Primero verificar autenticación
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar rol de administrador
    if (!req.user.role || req.user.role.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado',
      error: error.message
    });
  }
};

/**
 * Middleware opcional de autenticación (no bloquea si no hay token)
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = jwtService.extractTokenFromHeader(authHeader);
      
      if (token) {
        try {
          const decoded = jwtService.verifyToken(token);
          const user = await User.findById(decoded.userId).populate('roleId');
          
          if (user && user.status === 'active') {
            req.user = {
              _id: user._id,
              userId: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.roleId,
              status: user.status
            };
          }
        } catch (error) {
          // Ignorar errores de token para middleware opcional
        }
      }
    }
    
    next();
  } catch (error) {
    // Continuar sin autenticación en caso de error
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
}; 