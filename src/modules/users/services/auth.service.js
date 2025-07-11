const User = require('../models/user.model');
const Role = require('../../roles/models/role.model');
const jwtService = require('../../../shared/utils/jwt');
const bcrypt = require('bcryptjs');

class AuthService {

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      // Verificar si ya existe un usuario con ese email
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Obtener rol por defecto si no se especifica
      let roleId = userData.roleId;
      if (!roleId) {
        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
          throw new Error('Rol de usuario por defecto no encontrado');
        }
        roleId = userRole._id;
      }

      // Crear usuario
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        roleId: roleId
      });

      await user.save();

      // Popular el rol
      await user.populate('roleId');

      // Generar tokens
      const tokens = jwtService.generateTokens(user);

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.roleId,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        },
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      // Buscar usuario por email incluyendo password
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password')
        .populate('roleId');

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar status del usuario
      if (user.status !== 'active') {
        throw new Error('Usuario inactivo o suspendido');
      }

      // Verificar password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar tokens
      const tokens = jwtService.generateTokens(user);

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.roleId,
          status: user.status,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin
        },
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = jwtService.verifyToken(refreshToken);
      
      // Buscar usuario
      const user = await User.findById(decoded.userId).populate('roleId');
      
      if (!user || user.status !== 'active') {
        throw new Error('Usuario no válido');
      }

      // Generar nuevos tokens
      const tokens = jwtService.generateTokens(user);

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.roleId,
          status: user.status
        },
        ...tokens
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId).populate('roleId');
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        role: user.roleId,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateProfile(userId, updateData) {
    try {
      // Campos que se pueden actualizar
      const allowedUpdates = [
        'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 
        'address', 'preferences'
      ];

      const updates = {};
      for (let field of allowedUpdates) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).populate('roleId');

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        role: user.roleId,
        status: user.status,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService(); 