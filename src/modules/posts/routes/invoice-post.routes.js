const express = require('express');
const invoicePostController = require('../controllers/invoice-post.controller');
const { authMiddleware } = require('../../../shared/middleware/auth.middleware');
const { uploadMultipleFiles, processUploadedFiles } = require('../../../shared/middleware/upload.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoice Posts
 *   description: Posts de facturas empresariales
 */

/**
 * @swagger
 * /api/posts/invoice:
 *   post:
 *     summary: Crear post de factura empresarial
 *     description: Crea un nuevo post de factura con información empresarial enriquecida
 *     tags: [Invoice Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID de la factura
 *               title:
 *                 type: string
 *                 description: Título del post (opcional)
 *               content:
 *                 type: string
 *                 description: Contenido del post (opcional)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos multimedia (máximo 10, 5MB cada uno)
 *     responses:
 *       201:
 *         description: Post de factura creado exitosamente
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
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         content:
 *                           type: string
 *                         businessInfo:
 *                           type: object
 *                           properties:
 *                             companyName:
 *                               type: string
 *                             companyRuc:
 *                               type: string
 *                             invoiceCode:
 *                               type: string
 *                             invoiceTotal:
 *                               type: number
 *                             invoiceStatus:
 *                               type: string
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                         category:
 *                           type: string
 *                     filesUploaded:
 *                       type: number
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, uploadMultipleFiles, processUploadedFiles, invoicePostController.createInvoicePost);

/**
 * @swagger
 * /api/posts/invoice:
 *   get:
 *     summary: Obtener posts de facturas
 *     description: Obtiene posts de facturas con filtros empresariales avanzados
 *     tags: [Invoice Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: companyRuc
 *         schema:
 *           type: string
 *         description: Filtrar por RUC de empresa
 *       - in: query
 *         name: invoiceStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *         description: Filtrar por estado de factura
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Monto mínimo
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Monto máximo
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Posts de facturas obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Post de factura
 */
router.get('/', invoicePostController.getInvoicePosts);

/**
 * @swagger
 * /api/posts/invoice/stats:
 *   get:
 *     summary: Obtener estadísticas de posts de facturas
 *     description: Obtiene estadísticas detalladas de posts de facturas
 *     tags: [Invoice Posts]
 *     parameters:
 *       - in: query
 *         name: companyRuc
 *         schema:
 *           type: string
 *         description: Filtrar por RUC de empresa específica
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                         general:
 *                           type: object
 *                           properties:
 *                             totalPosts:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                             avgAmount:
 *                               type: number
 *                             totalEngagement:
 *                               type: number
 *                         byStatus:
 *                           type: object
 *                           description: Estadísticas por estado
 *                         byCategory:
 *                           type: object
 *                           description: Estadísticas por categoría
 *                         monthly:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: number
 *                               month:
 *                                 type: number
 *                               count:
 *                                 type: number
 *                               totalAmount:
 *                                 type: number
 */
router.get('/stats', invoicePostController.getInvoicePostStats);

/**
 * @swagger
 * /api/posts/invoice/company/{ruc}:
 *   get:
 *     summary: Obtener posts de facturas por empresa
 *     description: Obtiene todos los posts de facturas de una empresa específica
 *     tags: [Invoice Posts]
 *     parameters:
 *       - in: path
 *         name: ruc
 *         required: true
 *         schema:
 *           type: string
 *         description: RUC de la empresa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Máximo número de posts
 *     responses:
 *       200:
 *         description: Posts de empresa obtenidos exitosamente
 */
router.get('/company/:ruc', invoicePostController.getPostsByCompany);

/**
 * @swagger
 * /api/posts/invoice/date-range:
 *   get:
 *     summary: Obtener posts de facturas por rango de fechas
 *     description: Obtiene posts de facturas dentro de un rango de fechas específico
 *     tags: [Invoice Posts]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Máximo número de posts
 *     responses:
 *       200:
 *         description: Posts por rango de fechas obtenidos exitosamente
 */
router.get('/date-range', invoicePostController.getPostsByDateRange);

/**
 * @swagger
 * /api/posts/invoice/trending:
 *   get:
 *     summary: Obtener posts de facturas trending
 *     description: Obtiene posts de facturas con mayor engagement
 *     tags: [Invoice Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Máximo número de posts
 *     responses:
 *       200:
 *         description: Posts trending obtenidos exitosamente
 */
router.get('/trending', invoicePostController.getTrendingInvoicePosts);

/**
 * @swagger
 * /api/posts/invoice/update-status:
 *   put:
 *     summary: Actualizar estado de posts por cambio de factura
 *     description: Actualiza el estado de posts cuando cambia el estado de una factura
 *     tags: [Invoice Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - newStatus
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: ID de la factura
 *               newStatus:
 *                 type: string
 *                 enum: [pending, paid, overdue, cancelled]
 *                 description: Nuevo estado de la factura
 *     responses:
 *       200:
 *         description: Posts actualizados exitosamente
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
 *                         updatedCount:
 *                           type: number
 *                           description: Número de posts actualizados
 */
router.put('/update-status', authMiddleware, invoicePostController.updatePostsOnInvoiceChange);

module.exports = router; 