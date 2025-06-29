const express = require('express');
const friendRequestController = require('../controllers/friendRequest.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Friend Requests
 *   description: Gestión de solicitudes de amistad basadas en publicaciones
 */

/**
 * @swagger
 * /api/friend-requests/post/{postId}:
 *   get:
 *     summary: Obtener solicitudes pendientes por publicación
 *     description: Lista todas las solicitudes de amistad pendientes para una publicación específica
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicación
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes
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
 *                         $ref: '#/components/schemas/FriendRequest'
 */
router.get('/post/:postId', friendRequestController.getPendingRequestsByPost);

/**
 * @swagger
 * /api/friend-requests/sent/{userId}:
 *   get:
 *     summary: Obtener solicitudes enviadas por usuario
 *     description: Lista todas las solicitudes de amistad enviadas por un usuario específico
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de solicitudes enviadas
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
 *                         $ref: '#/components/schemas/FriendRequest'
 */
router.get('/sent/:userId', friendRequestController.getSentRequestsByUser);

/**
 * @swagger
 * /api/friend-requests/received/{userId}:
 *   get:
 *     summary: Obtener solicitudes recibidas por usuario
 *     description: Lista todas las solicitudes de amistad recibidas por un usuario específico
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de solicitudes recibidas
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
 *                         $ref: '#/components/schemas/FriendRequest'
 */
router.get('/received/:userId', friendRequestController.getReceivedRequestsByUser);

/**
 * @swagger
 * /api/friend-requests/stats/{userId}:
 *   get:
 *     summary: Obtener estadísticas de solicitudes de amistad
 *     description: Obtiene estadísticas sobre las solicitudes de amistad de un usuario
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estadísticas de solicitudes de amistad
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
 *                         sent:
 *                           type: number
 *                           example: 15
 *                         received:
 *                           type: number
 *                           example: 8
 *                         pending:
 *                           type: number
 *                           example: 5
 *                         accepted:
 *                           type: number
 *                           example: 12
 *                         rejected:
 *                           type: number
 *                           example: 3
 */
router.get('/stats/:userId', friendRequestController.getFriendRequestStats);

/**
 * @swagger
 * /api/friend-requests/status/{status}:
 *   get:
 *     summary: Obtener solicitudes por estado
 *     description: Lista todas las solicitudes de amistad filtradas por estado
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: Estado de las solicitudes
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de solicitudes por estado
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
 *                         $ref: '#/components/schemas/FriendRequest'
 */
router.get('/status/:status', friendRequestController.getFriendRequestsByStatus);

/**
 * @swagger
 * /api/friend-requests/{id}/accept:
 *   patch:
 *     summary: Aceptar solicitud de amistad
 *     description: Acepta una solicitud de amistad pendiente
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud aceptada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FriendRequest'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/accept', friendRequestController.acceptFriendRequest);

/**
 * @swagger
 * /api/friend-requests/{id}/reject:
 *   patch:
 *     summary: Rechazar solicitud de amistad
 *     description: Rechaza una solicitud de amistad pendiente
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FriendRequest'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/reject', friendRequestController.rejectFriendRequest);

/**
 * @swagger
 * /api/friend-requests:
 *   post:
 *     summary: Enviar solicitud de amistad
 *     description: Envía una nueva solicitud de amistad basada en una publicación
 *     tags: [Friend Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - senderId
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               senderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               message:
 *                 type: string
 *                 example: "Me interesa tu publicación financiera"
 *     responses:
 *       201:
 *         description: Solicitud enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FriendRequest'
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', friendRequestController.sendFriendRequest);

/**
 * @swagger
 * /api/friend-requests/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     description: Obtiene una solicitud de amistad específica por su ID
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FriendRequest'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Cancelar solicitud de amistad
 *     description: Cancela (elimina) una solicitud de amistad enviada
 *     tags: [Friend Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', friendRequestController.getFriendRequestById);
router.delete('/:id', friendRequestController.cancelFriendRequest);

module.exports = router; 