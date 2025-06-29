const express = require('express');
const contactController = require('../controllers/contact.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Gestión de contactos y seguimientos entre usuarios
 */

/**
 * @swagger
 * /api/contacts/follow:
 *   post:
 *     summary: Seguir a un usuario
 *     description: Crea una relación de seguimiento entre dos usuarios
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followerId
 *               - followeeId
 *             properties:
 *               followerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               followeeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Relación de seguimiento creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/follow', contactController.followUser);

/**
 * @swagger
 * /api/contacts/unfollow:
 *   delete:
 *     summary: Dejar de seguir a un usuario
 *     description: Elimina la relación de seguimiento entre dos usuarios
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followerId
 *               - followeeId
 *             properties:
 *               followerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               followeeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Relación de seguimiento eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Relación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/unfollow', contactController.unfollowUser);

/**
 * @swagger
 * /api/contacts/check/{followerId}/{followeeId}:
 *   get:
 *     summary: Verificar si un usuario sigue a otro
 *     description: Verifica si existe una relación de seguimiento entre dos usuarios
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario que sigue
 *       - in: path
 *         name: followeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario seguido
 *     responses:
 *       200:
 *         description: Estado de la relación de seguimiento
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
 *                         isFollowing:
 *                           type: boolean
 *                           example: true
 */
router.get('/check/:followerId/:followeeId', contactController.isFollowing);

/**
 * @swagger
 * /api/contacts/{userId}/followers:
 *   get:
 *     summary: Obtener seguidores de un usuario
 *     description: Lista todos los usuarios que siguen a un usuario específico
 *     tags: [Contacts]
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
 *         description: Lista de seguidores
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
 *                         $ref: '#/components/schemas/Contact'
 */
router.get('/:userId/followers', contactController.getFollowers);

/**
 * @swagger
 * /api/contacts/{userId}/following:
 *   get:
 *     summary: Obtener usuarios seguidos
 *     description: Lista todos los usuarios que sigue un usuario específico
 *     tags: [Contacts]
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
 *         description: Lista de usuarios seguidos
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
 *                         $ref: '#/components/schemas/Contact'
 */
router.get('/:userId/following', contactController.getFollowing);

/**
 * @swagger
 * /api/contacts/{userId}/counts:
 *   get:
 *     summary: Obtener contadores de un usuario
 *     description: Obtiene los contadores de seguidores y seguidos de un usuario
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Contadores del usuario
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
 *                         followers:
 *                           type: number
 *                           example: 125
 *                         following:
 *                           type: number
 *                           example: 85
 */
router.get('/:userId/counts', contactController.getUserCounts);

/**
 * @swagger
 * /api/contacts/{userId}/mutual:
 *   get:
 *     summary: Obtener seguimientos mutuos
 *     description: Lista los usuarios que se siguen mutuamente con el usuario especificado
 *     tags: [Contacts]
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
 *         description: Lista de seguimientos mutuos
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
 *                         $ref: '#/components/schemas/Contact'
 */
router.get('/:userId/mutual', contactController.getMutualFollows);

/**
 * @swagger
 * /api/contacts/{userId}/suggestions:
 *   get:
 *     summary: Obtener sugerencias de usuarios
 *     description: Obtiene sugerencias de usuarios para seguir basadas en conexiones mutuas
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de usuarios sugeridos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get('/:userId/suggestions', contactController.getSuggestedUsers);

/**
 * @swagger
 * /api/contacts/{userId}/activity:
 *   get:
 *     summary: Obtener actividad reciente de contactos
 *     description: Obtiene la actividad reciente de los contactos de un usuario
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Actividad reciente de contactos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                           action:
 *                             type: string
 *                             example: "started following"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 */
router.get('/:userId/activity', contactController.getRecentActivity);

/**
 * @swagger
 * /api/contacts/{userId}/followers/{followerId}:
 *   delete:
 *     summary: Remover seguidor
 *     description: Elimina un seguidor de un usuario específico
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario seguido
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del seguidor a remover
 *     responses:
 *       200:
 *         description: Seguidor removido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Relación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:userId/followers/:followerId', contactController.removeFollower);

module.exports = router; 