const express = require('express');
const userController = require('../controllers/user.controller');
const userSearchController = require('../controllers/user-search.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../../../shared/middleware/auth.middleware');

const router = express.Router();

// Importar rutas de métricas
const userMetricsRoutes = require('./user-metrics.routes');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 */

/**
 * @swagger
 * /api/users/sign-up:
 *   post:
 *     summary: Registro de nuevo usuario
 *     description: Registra un nuevo usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Juan"
 *                 description: "Nombre del usuario"
 *               lastName:
 *                 type: string
 *                 example: "Pérez"
 *                 description: "Apellido del usuario"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *                 description: "Email único del usuario"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "miPassword123"
 *                 description: "Contraseña (mínimo 6 caracteres)"
 *               phoneNumber:
 *                 type: string
 *                 example: "+52-555-123-4567"
 *                 description: "Número de teléfono (opcional)"
 *               roleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: "ID del rol (opcional, por defecto será 'user')"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la validación o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/sign-up', userController.signUp);

/**
 * @swagger
 * /api/users/sign-in:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *                 description: "Email del usuario"
 *               password:
 *                 type: string
 *                 example: "miPassword123"
 *                 description: "Contraseña del usuario"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                           description: "JWT token para autenticación"
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/sign-in', userController.signIn);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     description: Obtiene estadísticas generales sobre los usuarios del sistema
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 150
 *                         usersByRole:
 *                           type: object
 *                           example: {"admin": 5, "user": 140, "moderator": 5}
 *                         recentRegistrations:
 *                           type: number
 *                           example: 25
 */
router.get('/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     summary: Buscar usuario por email
 *     description: Busca un usuario específico usando su dirección de email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/email/:email', userController.getUserByEmail);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Lista todos los usuarios con paginación y filtros opcionales
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por rol específico
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario (Admin)
 *     description: Crea un nuevo usuario en el sistema (endpoint administrativo)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Juan"
 *                 description: "Nombre del usuario"
 *               lastName:
 *                 type: string
 *                 example: "Pérez"
 *                 description: "Apellido del usuario"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *                 description: "Email único del usuario"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "miPassword123"
 *                 description: "Contraseña (mínimo 6 caracteres)"
 *               phoneNumber:
 *                 type: string
 *                 example: "+52-555-123-4567"
 *                 description: "Número de teléfono (opcional)"
 *               roleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: "ID del rol (opcional, por defecto será 'user')"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 example: "active"
 *                 description: "Estado del usuario (opcional)"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la validación o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Obtiene un usuario específico por su ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', userController.deleteUser);

// Rutas de búsqueda y descubrimiento
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Buscar usuarios
 *     description: Busca usuarios por nombre, apellido o email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de resultados
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: excludeFollowing
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Excluir usuarios ya seguidos
 *       - in: query
 *         name: onlyFollowing
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Solo mostrar usuarios seguidos
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/search', optionalAuthMiddleware, userSearchController.searchUsers);

/**
 * @swagger
 * /api/users/suggestions:
 *   get:
 *     summary: Obtener sugerencias de usuarios
 *     description: Obtiene sugerencias de usuarios para seguir basadas en conexiones mutuas
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de sugerencias
 *     responses:
 *       200:
 *         description: Sugerencias de usuarios
 */
router.get('/suggestions', authMiddleware, userSearchController.getUserSuggestions);

/**
 * @swagger
 * /api/users/popular:
 *   get:
 *     summary: Obtener usuarios populares
 *     description: Obtiene usuarios con más seguidores
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de usuarios
 *     responses:
 *       200:
 *         description: Usuarios populares
 */
router.get('/popular', optionalAuthMiddleware, userSearchController.getPopularUsers);

/**
 * @swagger
 * /api/users/trending:
 *   get:
 *     summary: Obtener usuarios trending
 *     description: Obtiene usuarios más activos recientemente
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de usuarios
 *     responses:
 *       200:
 *         description: Usuarios trending
 */
router.get('/trending', optionalAuthMiddleware, userSearchController.getTrendingUsers);

/**
 * @swagger
 * /api/users/discover:
 *   get:
 *     summary: Descubrir usuarios
 *     description: Combina diferentes criterios para descubrir usuarios interesantes
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de usuarios
 *     responses:
 *       200:
 *         description: Usuarios para descubrir
 */
router.get('/discover', optionalAuthMiddleware, userSearchController.discoverUsers);

/**
 * @swagger
 * /api/users/nearby:
 *   get:
 *     summary: Buscar usuarios cercanos
 *     description: Busca usuarios por proximidad geográfica
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Radio de búsqueda en km
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de usuarios
 *     responses:
 *       200:
 *         description: Usuarios cercanos
 */
router.get('/nearby', optionalAuthMiddleware, userSearchController.searchNearbyUsers);

// Rutas de métricas de usuario
router.use('/', userMetricsRoutes);

module.exports = router; 