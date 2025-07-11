const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

class AuthController {

  /**
   * Registro de usuario
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        roleId: req.body.roleId
      };

      const result = await authService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error en el registro',
        error: error.message
      });
    }
  }

  /**
   * Inicio de sesión
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('Credenciales') || 
                        error.message.includes('inactivo') ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error en el login',
        error: error.message
      });
    }
  }

  /**
   * Refrescar token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requerido'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Error al refrescar token',
        error: error.message
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/me
   */
  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.userId);
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/auth/me
   */
  async updateProfile(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const user = await authService.updateProfile(req.user.userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  }

  /**
   * Cambiar contraseña
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user.userId, 
        currentPassword, 
        newPassword
      );
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('incorrecta') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // En una implementación completa, aquí invalidarías el token
      // Por ahora solo devolvemos un mensaje de éxito
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController(); 