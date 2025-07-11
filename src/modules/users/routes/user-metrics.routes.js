const express = require('express');
const userMetricsController = require('../controllers/user-metrics.controller');
const { authMiddleware } = require('../../../shared/middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Metrics
 *   description: Métricas y estadísticas de usuarios
 */

/**
 * @swagger
 * /api/users/me/metrics:
 *   get:
 *     summary: Obtener métricas propias
 *     description: Obtiene las métricas completas del usuario autenticado
 *     tags: [User Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
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
 *                         basic:
 *                           type: object
 *                           properties:
 *                             totalPosts:
 *                               type: number
 *                               example: 25
 *                             postsByType:
 *                               type: object
 *                               example: {"text": 15, "image": 8, "invoice": 2}
 *                             memberSince:
 *                               type: string
 *                               format: date-time
 *                             daysActive:
 *                               type: number
 *                               example: 45
 *                         engagement:
 *                           type: object
 *                           properties:
 *                             received:
 *                               type: object
 *                               properties:
 *                                 totalReactions:
 *                                   type: number
 *                                   example: 150
 *                                 totalComments:
 *                                   type: number
 *                                   example: 75
 *                                 avgReactionsPerPost:
 *                                   type: number
 *                                   example: 6.25
 *                                 avgCommentsPerPost:
 *                                   type: number
 *                                   example: 3.12
 *                             given:
 *                               type: object
 *                               properties:
 *                                 totalReactions:
 *                                   type: number
 *                                   example: 200
 *                                 totalComments:
 *                                   type: number
 *                                   example: 50
 *                             engagementScore:
 *                               type: number
 *                               example: 45
 *                         social:
 *                           type: object
 *                           properties:
 *                             followers:
 *                               type: number
 *                               example: 120
 *                             following:
 *                               type: number
 *                               example: 80
 *                             mutualFollows:
 *                               type: number
 *                               example: 25
 *                             followRatio:
 *                               type: number
 *                               example: 1.5
 *                             socialScore:
 *                               type: number
 *                               example: 65
 *                         activity:
 *                           type: object
 *                           properties:
 *                             last30Days:
 *                               type: object
 *                               example: {"1": 2, "5": 1, "10": 3}
 *                             byWeekday:
 *                               type: object
 *                               example: {"Lunes": 5, "Martes": 3, "Miércoles": 7}
 *                             mostActiveDay:
 *                               type: string
 *                               example: "Miércoles"
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalScore:
 *                               type: number
 *                               example: 180
 *                             rank:
 *                               type: string
 *                               example: "Standard"
 *                             badges:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Contributor", "Conectado", "Establecido"]
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me/metrics', authMiddleware, userMetricsController.getMyMetrics);

/**
 * @swagger
 * /api/users/{id}/metrics:
 *   get:
 *     summary: Obtener métricas de un usuario
 *     description: Obtiene las métricas completas de un usuario específico
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Métricas completas del usuario
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/metrics', userMetricsController.getUserMetrics);

/**
 * @swagger
 * /api/users/{id}/metrics/summary:
 *   get:
 *     summary: Obtener resumen de métricas
 *     description: Obtiene un resumen rápido de las métricas principales de un usuario
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Resumen obtenido exitosamente
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
 *                         totalPosts:
 *                           type: number
 *                           example: 25
 *                         followers:
 *                           type: number
 *                           example: 120
 *                         following:
 *                           type: number
 *                           example: 80
 *                         totalEngagement:
 *                           type: number
 *                           example: 225
 */
router.get('/:id/metrics/summary', userMetricsController.getProfileSummary);

/**
 * @swagger
 * /api/users/{id}/metrics/basic:
 *   get:
 *     summary: Obtener métricas básicas
 *     description: Obtiene métricas básicas de actividad de un usuario
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Métricas básicas obtenidas exitosamente
 */
router.get('/:id/metrics/basic', userMetricsController.getBasicMetrics);

/**
 * @swagger
 * /api/users/{id}/metrics/engagement:
 *   get:
 *     summary: Obtener métricas de engagement
 *     description: Obtiene métricas de engagement (reacciones y comentarios) de un usuario
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Métricas de engagement obtenidas exitosamente
 */
router.get('/:id/metrics/engagement', userMetricsController.getEngagementMetrics);

/**
 * @swagger
 * /api/users/{id}/metrics/social:
 *   get:
 *     summary: Obtener métricas sociales
 *     description: Obtiene métricas sociales (seguidores, seguidos) de un usuario
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Métricas sociales obtenidas exitosamente
 */
router.get('/:id/metrics/social', userMetricsController.getSocialMetrics);

/**
 * @swagger
 * /api/users/{id}/metrics/activity:
 *   get:
 *     summary: Obtener métricas de actividad
 *     description: Obtiene métricas de actividad temporal de un usuario
 *     tags: [User Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Métricas de actividad obtenidas exitosamente
 */
router.get('/:id/metrics/activity', userMetricsController.getActivityMetrics);

module.exports = router; 