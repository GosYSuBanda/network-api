const Role = require('../models/role.model');

class RoleService {
  
  /**
   * Crear un nuevo rol
   */
  async createRole(roleData) {
    try {
      const role = new Role(roleData);
      await role.save();
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los roles
   */
  async getAllRoles() {
    try {
      const roles = await Role.find({}).sort({ name: 1 });
      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por ID
   */
  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por nombre
   */
  async getRoleByName(name) {
    try {
      const role = await Role.findOne({ name: name.toLowerCase() });
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  async updateRole(roleId, updateData) {
    try {
      const role = await Role.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar rol
   */
  async deleteRole(roleId) {
    try {
      // Verificar que no haya usuarios con este rol
      const User = require('../../users/models/user.model');
      const usersWithRole = await User.countDocuments({ roleId });
      
      if (usersWithRole > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
      }

      const role = await Role.findByIdAndDelete(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return { message: 'Rol eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicializar roles por defecto
   */
  async initializeDefaultRoles() {
    try {
      const existingRoles = await Role.countDocuments();
      
      if (existingRoles === 0) {
        const defaultRoles = Role.getDefaultRoles();
        await Role.insertMany(defaultRoles);
        console.log('✅ Roles por defecto creados');
        return defaultRoles;
      }
      
      console.log('✅ Roles ya existen en la base de datos');
      return await Role.find({});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar permisos de un rol
   */
  async checkPermission(roleId, permission) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        return false;
      }
      
      return role.permissions[permission] || false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new RoleService(); 