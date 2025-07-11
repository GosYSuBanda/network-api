const express = require('express');
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../../../shared/middleware/auth.middleware');
const { uploadMultipleFiles, processUploadedFiles } = require('../../../shared/middleware/upload.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Sistema de mensajería directa
 */

/**
 * @swagger
 * /api/messages/conversations/private:
 *   post:
 *     summary: Iniciar conversación privada
 *     description: Inicia una conversación privada entre dos usuarios
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID del usuario destinatario
 *     responses:
 *       201:
 *         description: Conversación iniciada exitosamente
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
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: object
 *                         type:
 *                           type: string
 *                           example: "private"
 *                         lastActivity:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/conversations/private', authMiddleware, messageController.startPrivateConversation);

/**
 * @swagger
 * /api/messages/conversations/group:
 *   post:
 *     summary: Crear conversación grupal
 *     description: Crea una nueva conversación grupal con múltiples participantes
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *               - title
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los participantes del grupo
 *               title:
 *                 type: string
 *                 description: Título del grupo
 *               description:
 *                 type: string
 *                 description: Descripción del grupo (opcional)
 *     responses:
 *       201:
 *         description: Conversación grupal creada exitosamente
 */
router.post('/conversations/group', authMiddleware, messageController.createGroupConversation);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Obtener conversaciones del usuario
 *     description: Obtiene todas las conversaciones del usuario autenticado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de conversaciones
 *     responses:
 *       200:
 *         description: Conversaciones obtenidas exitosamente
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
 *                           _id:
 *                             type: string
 *                           participants:
 *                             type: array
 *                             items:
 *                               type: object
 *                           type:
 *                             type: string
 *                             enum: [private, group]
 *                           title:
 *                             type: string
 *                           lastMessage:
 *                             type: object
 *                           lastActivity:
 *                             type: string
 *                             format: date-time
 *                           unreadCount:
 *                             type: number
 *                           isMuted:
 *                             type: boolean
 *                           otherUser:
 *                             type: object
 *                             description: Para conversaciones privadas
 */
router.get('/conversations', authMiddleware, messageController.getUserConversations);

/**
 * @swagger
 * /api/messages/conversations/{id}/messages:
 *   get:
 *     summary: Obtener mensajes de una conversación
 *     description: Obtiene los mensajes de una conversación específica
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de mensajes
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de mensajes a omitir
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los mensajes
 *     responses:
 *       200:
 *         description: Mensajes obtenidos exitosamente
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
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           sender:
 *                             type: object
 *                           type:
 *                             type: string
 *                             enum: [text, image, file, audio, video, location, system]
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: object
 *                           replyTo:
 *                             type: object
 *                           reactions:
 *                             type: array
 *                             items:
 *                               type: object
 *                           readBy:
 *                             type: array
 *                             items:
 *                               type: object
 *                           isEdited:
 *                             type: boolean
 *                           isDeleted:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: number
 *                         skip:
 *                           type: number
 *                         hasMore:
 *                           type: boolean
 *       403:
 *         description: No tienes permisos para ver esta conversación
 *       404:
 *         description: Conversación no encontrada
 */
router.get('/conversations/:id/messages', authMiddleware, messageController.getConversationMessages);

/**
 * @swagger
 * /api/messages/conversations/{id}/messages:
 *   post:
 *     summary: Enviar mensaje
 *     description: Envía un mensaje en una conversación específica
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido del mensaje
 *               type:
 *                 type: string
 *                 enum: [text, image, file, audio, video, location]
 *                 default: text
 *                 description: Tipo de mensaje
 *               replyTo:
 *                 type: string
 *                 description: ID del mensaje al que se responde
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos adjuntos
 *               metadata:
 *                 type: object
 *                 description: Metadatos adicionales (ubicación, menciones, etc.)
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Mensaje enviado
 *                     filesUploaded:
 *                       type: number
 *                       description: Número de archivos subidos
 *       400:
 *         description: Error en la validación
 *       403:
 *         description: No tienes permisos para enviar mensajes en esta conversación
 *       404:
 *         description: Conversación no encontrada
 */
router.post('/conversations/:id/messages', authMiddleware, uploadMultipleFiles, processUploadedFiles, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/conversations/{id}/read:
 *   put:
 *     summary: Marcar mensajes como leídos
 *     description: Marca todos los mensajes de una conversación como leídos
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos exitosamente
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
 *                         markedCount:
 *                           type: number
 *                           description: Número de mensajes marcados como leídos
 */
router.put('/conversations/:id/read', authMiddleware, messageController.markMessagesAsRead);

/**
 * @swagger
 * /api/messages/conversations/{id}/search:
 *   get:
 *     summary: Buscar mensajes en una conversación
 *     description: Busca mensajes por contenido en una conversación específica
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de resultados
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
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
 *                         description: Mensajes encontrados
 *                     searchTerm:
 *                       type: string
 *                       description: Término de búsqueda utilizado
 */
router.get('/conversations/:id/search', authMiddleware, messageController.searchMessages);

/**
 * @swagger
 * /api/messages/conversations/{id}/mute:
 *   put:
 *     summary: Silenciar/Desilenciar conversación
 *     description: Alterna el estado de silenciado de una conversación
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     responses:
 *       200:
 *         description: Estado de silenciado cambiado exitosamente
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
 *                         isMuted:
 *                           type: boolean
 *                           description: Estado actual de silenciado
 */
router.put('/conversations/:id/mute', authMiddleware, messageController.toggleMuteConversation);

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Obtener mensajes no leídos
 *     description: Obtiene todos los mensajes no leídos del usuario
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         description: ID de conversación específica (opcional)
 *     responses:
 *       200:
 *         description: Mensajes no leídos obtenidos exitosamente
 */
router.get('/unread', authMiddleware, messageController.getUnreadMessages);

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     summary: Contar mensajes no leídos
 *     description: Obtiene el número total de mensajes no leídos
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         description: ID de conversación específica (opcional)
 *     responses:
 *       200:
 *         description: Conteo obtenido exitosamente
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
 *                         count:
 *                           type: number
 *                           description: Número de mensajes no leídos
 */
router.get('/unread/count', authMiddleware, messageController.countUnreadMessages);

/**
 * @swagger
 * /api/messages/stats:
 *   get:
 *     summary: Obtener estadísticas de mensajería
 *     description: Obtiene estadísticas de mensajería del usuario autenticado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
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
 *                         totalConversations:
 *                           type: number
 *                         totalMessages:
 *                           type: number
 *                         unreadCount:
 *                           type: number
 *                         recentActivity:
 *                           type: array
 *                           items:
 *                             type: object
 */
router.get('/stats', authMiddleware, messageController.getUserMessageStats);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: Editar mensaje
 *     description: Edita el contenido de un mensaje enviado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nuevo contenido del mensaje
 *     responses:
 *       200:
 *         description: Mensaje editado exitosamente
 *       403:
 *         description: No tienes permisos para editar este mensaje
 *       404:
 *         description: Mensaje no encontrado
 */
router.put('/:id', authMiddleware, messageController.editMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Eliminar mensaje
 *     description: Elimina un mensaje enviado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       403:
 *         description: No tienes permisos para eliminar este mensaje
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete('/:id', authMiddleware, messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/{id}/reactions:
 *   post:
 *     summary: Agregar reacción a mensaje
 *     description: Agrega una reacción emoji a un mensaje
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: Emoji de reacción
 *     responses:
 *       200:
 *         description: Reacción agregada exitosamente
 *       404:
 *         description: Mensaje no encontrado
 */
router.post('/:id/reactions', authMiddleware, messageController.addReaction);

/**
 * @swagger
 * /api/messages/{id}/reactions:
 *   delete:
 *     summary: Remover reacción de mensaje
 *     description: Remueve la reacción del usuario a un mensaje
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Reacción removida exitosamente
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete('/:id/reactions', authMiddleware, messageController.removeReaction);

module.exports = router; 