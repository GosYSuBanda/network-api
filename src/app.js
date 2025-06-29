require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./shared/config/db');
const errorMiddleware = require('./shared/middleware/error.middleware');
const logger = require('./shared/utils/logger');
const swaggerUiExpress = require('swagger-ui-express');
const swaggerSpecs = require('./shared/config/swagger');


// Importar rutas de módulos
const roleRoutes = require('./modules/roles/routes/role.routes');
const userRoutes = require('./modules/users/routes/user.routes');
const postRoutes = require('./modules/posts/routes/post.routes');
const invoiceRoutes = require('./modules/invoices/routes/invoice.routes');
const contactRoutes = require('./modules/contacts/routes/contact.routes');
const friendRequestRoutes = require('./modules/friendRequests/routes/friendRequest.routes');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware global
app.use(cors({
    origin: '*',
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FinSmart Network API Documentation'
  }));
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check del servidor
 *     description: Verifica el estado y salud del servidor API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Servidor funcionando correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
/**
 * @swagger
 * /:
 *   get:
 *     summary: Información general de la API
 *     description: Endpoint raíz que proporciona información básica sobre la API y todos los endpoints disponibles
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información completa de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "🚀 Bienvenido a FinSmart Network API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 endpoints:
 *                   type: object
 *                   description: Lista de endpoints principales
 *                 endpointDetails:
 *                   type: object
 *                   description: Documentación detallada de todos los endpoints
 */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Bienvenido a FinSmart Network API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      roles: '/api/roles',
      users: '/api/users',
      posts: '/api/posts',
      invoices: '/api/invoices',
      contacts: '/api/contacts',
      friendRequests: '/api/friend-requests'
    },
    endpointDetails: {
      health: 'GET /health',
      roles: {
        'GET /api/roles': 'Obtener todos los roles',
        'POST /api/roles': 'Crear nuevo rol',
        'POST /api/roles/initialize': 'Inicializar roles por defecto',
        'GET /api/roles/:id': 'Obtener rol por ID',
        'PUT /api/roles/:id': 'Actualizar rol',
        'DELETE /api/roles/:id': 'Eliminar rol'
      },
      users: {
        'GET /api/users': 'Obtener usuarios con paginación',
        'POST /api/users': 'Crear nuevo usuario',
        'GET /api/users/stats': 'Estadísticas de usuarios',
        'GET /api/users/:id': 'Obtener usuario por ID',
        'GET /api/users/email/:email': 'Obtener usuario por email',
        'PUT /api/users/:id': 'Actualizar usuario',
        'DELETE /api/users/:id': 'Eliminar usuario'
      },
      posts: {
        'GET /api/posts': 'Obtener posts con paginación',
        'POST /api/posts': 'Crear nuevo post',
        'GET /api/posts/feed': 'Obtener feed de posts',
        'GET /api/posts/stats': 'Estadísticas de posts',
        'GET /api/posts/:id': 'Obtener post por ID',
        'PUT /api/posts/:id': 'Actualizar post',
        'DELETE /api/posts/:id': 'Eliminar post',
        'POST /api/posts/:id/reactions': 'Agregar reacción',
        'DELETE /api/posts/:id/reactions': 'Remover reacción',
        'POST /api/posts/:id/comments': 'Agregar comentario'
      },
      invoices: {
        'GET /api/invoices': 'Obtener facturas con paginación',
        'POST /api/invoices': 'Crear nueva factura',
        'GET /api/invoices/stats': 'Estadísticas de facturas',
        'GET /api/invoices/overdue': 'Facturas vencidas',
        'GET /api/invoices/:id': 'Obtener factura por ID',
        'GET /api/invoices/code/:code': 'Obtener factura por código',
        'GET /api/invoices/company/:ruc': 'Facturas por empresa',
        'PUT /api/invoices/:id': 'Actualizar factura',
        'PATCH /api/invoices/:id/pay': 'Marcar como pagada',
        'DELETE /api/invoices/:id': 'Eliminar factura'
      },
      contacts: {
        'POST /api/contacts/follow': 'Seguir usuario',
        'DELETE /api/contacts/unfollow': 'Dejar de seguir',
        'GET /api/contacts/:userId/followers': 'Obtener seguidores',
        'GET /api/contacts/:userId/following': 'Obtener seguidos',
        'GET /api/contacts/:userId/counts': 'Conteos de seguimiento',
        'GET /api/contacts/:userId/mutual': 'Seguidores mutuos',
        'GET /api/contacts/:userId/suggestions': 'Sugerencias de usuarios',
        'GET /api/contacts/check/:followerId/:followeeId': 'Verificar seguimiento'
      },
      friendRequests: {
        'POST /api/friend-requests': 'Enviar solicitud de amistad',
        'GET /api/friend-requests/post/:postId': 'Solicitudes de un post',
        'GET /api/friend-requests/sent/:userId': 'Solicitudes enviadas',
        'GET /api/friend-requests/received/:userId': 'Solicitudes recibidas',
        'GET /api/friend-requests/stats/:userId': 'Estadísticas de solicitudes',
        'PATCH /api/friend-requests/:id/accept': 'Aceptar solicitud',
        'PATCH /api/friend-requests/:id/reject': 'Rechazar solicitud',
        'DELETE /api/friend-requests/:id': 'Cancelar solicitud'
      }
    }
  });
});

// Rutas de la API
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/friend-requests', friendRequestRoutes);

// Middleware de manejo de errores
app.use(errorMiddleware);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api-docs',
      '/api/roles',
      '/api/users',
      '/api/posts',
      '/api/invoices',
      '/api/contacts',
      '/api/friend-requests'
    ]
  });
});

// Manejo global de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 FinSmart Network API está funcionando!
📍 Puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📚 Documentación: http://localhost:${PORT}/api-docs
🔍 Health Check: http://localhost:${PORT}/health

📊 Endpoints disponibles:
  • Documentación: http://localhost:${PORT}/api-docs
  • Health: http://localhost:${PORT}/health
  • Roles: http://localhost:${PORT}/api/roles
  • Usuarios: http://localhost:${PORT}/api/users  
  • Posts: http://localhost:${PORT}/api/posts
  • Facturas: http://localhost:${PORT}/api/invoices
  • Contactos: http://localhost:${PORT}/api/contacts
  • Solicitudes: http://localhost:${PORT}/api/friend-requests
  `);
});

module.exports = app; 