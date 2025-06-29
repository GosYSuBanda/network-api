const userService = require('../services/user.service');

class UserController {

  /**
   * Registro de usuario (Sign Up)
   * POST /api/users/sign-up
   */
  async signUp(req, res) {
    try {
      const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        roleId: req.body.roleId // Opcional, se asignará rol 'user' por defecto
      };

      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user
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
   * Inicio de sesión (Sign In)
   * POST /api/users/sign-in
   */
  async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
          error: 'Datos incompletos'
        });
      }

      const result = await userService.authenticateUser(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      const statusCode = error.message === 'Credenciales inválidas' ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error en el login',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo usuario
   * POST /api/users
   */
  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los usuarios
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        roleId: req.query.roleId,
        search: req.query.search
      };

      const result = await userService.getAllUsers(options);

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuario por email
   * GET /api/users/email/:email
   */
  async getUserByEmail(req, res) {
    try {
      const user = await userService.getUserByEmail(req.params.email);

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  }

  /**
   * Eliminar usuario
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * GET /api/users/stats
   */
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new UserController(); 