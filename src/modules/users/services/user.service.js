const User = require('../models/user.model');
const Role = require('../../roles/models/role.model');
const { validateCreateUser } = require('../dtos/create-user.dto');
const { validateUpdateUser } = require('../dtos/update-user.dto');

class UserService {
  
  /**
   * Autenticar usuario (Sign In)
   */
  async authenticateUser(email, password) {
    try {
      // Buscar usuario por email incluyendo password
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password')
        .populate('roleId');

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Retornar usuario sin password y datos de autenticación
      const userResponse = user.toJSON();
      
      return {
        user: userResponse,
        // TODO: Implementar JWT token si es necesario
        // token: generateJWT(user._id)
        message: 'Autenticación exitosa'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Si no se especifica roleId, asignar rol de usuario por defecto
      if (!userData.roleId) {
        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
          throw new Error('Rol por defecto no encontrado. Inicialice los roles primero.');
        }
        userData.roleId = userRole._id;
      }

      // Crear el usuario
      const user = new User(userData);
      await user.save();
      
      // Popular el rol antes de devolver
      await user.populateRole();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con paginación y filtros
   */
  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        roleId,
        search
      } = options;

      // Construir query de filtros
      const query = {};
      
      if (roleId) query.roleId = roleId;
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Calcular skip
      const skip = (page - 1) * limit;

      // Construir sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consultas en paralelo
      const [users, total] = await Promise.all([
        User.find(query)
          .populate('roleId', 'name permissions')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(query)
      ]);

      return {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).populate('roleId');
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(userId, updateData) {
    try {
      // Si se actualiza el rol, verificar que existe
      if (updateData.roleId) {
        const role = await Role.findById(updateData.roleId);
        if (!role) {
          throw new Error('Rol no encontrado');
        }
      }

      // Buscar y actualizar usuario
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).populate('roleId');

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    try {
      const stats = await User.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'role'
          }
        },
        {
          $unwind: '$role'
        },
        {
          $group: {
            _id: '$role.name',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalUsers = await User.countDocuments();
      
      return {
        totalUsers,
        byRole: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar permisos de usuario
   */
  async checkUserPermission(userId, permission) {
    try {
      const user = await User.findById(userId).populate('roleId');
      if (!user || !user.roleId) {
        return false;
      }
      
      return user.roleId.permissions[permission] || false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new UserService(); 