const roleService = require('../services/role.service');

class RoleController {

  /**
   * Crear nuevo rol
   * POST /api/roles
   */
  async createRole(req, res) {
    try {
      const role = await roleService.createRole(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: role
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear rol',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los roles
   * GET /api/roles
   */
  async getAllRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles();

      res.status(200).json({
        success: true,
        message: 'Roles obtenidos exitosamente',
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles',
        error: error.message
      });
    }
  }

  /**
   * Obtener rol por ID
   * GET /api/roles/:id
   */
  async getRoleById(req, res) {
    try {
      const role = await roleService.getRoleById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Rol obtenido exitosamente',
        data: role
      });
    } catch (error) {
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener rol',
        error: error.message
      });
    }
  }

  /**
   * Actualizar rol
   * PUT /api/roles/:id
   */
  async updateRole(req, res) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: role
      });
    } catch (error) {
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al actualizar rol',
        error: error.message
      });
    }
  }

  /**
   * Eliminar rol
   * DELETE /api/roles/:id
   */
  async deleteRole(req, res) {
    try {
      const result = await roleService.deleteRole(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Rol no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar rol',
        error: error.message
      });
    }
  }

  /**
   * Inicializar roles por defecto
   * POST /api/roles/initialize
   */
  async initializeDefaultRoles(req, res) {
    try {
      const roles = await roleService.initializeDefaultRoles();

      res.status(200).json({
        success: true,
        message: 'Roles inicializados correctamente',
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al inicializar roles',
        error: error.message
      });
    }
  }
}

module.exports = new RoleController(); 