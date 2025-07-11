const express = require('express');
const postController = require('../controllers/post.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../../../shared/middleware/auth.middleware');
const { uploadMultipleFiles, processUploadedFiles } = require('../../../shared/middleware/upload.middleware');

const router = express.Router();

// Importar rutas de posts de facturas
const invoicePostRoutes = require('./invoice-post.routes');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Gestión de publicaciones y contenido social
 */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Obtener feed de publicaciones
 *     description: Obtiene un feed personalizado de publicaciones para el usuario
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID del usuario para personalizar el feed
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Feed de publicaciones
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
 *                         $ref: '#/components/schemas/Post'
 */
router.get('/feed', optionalAuthMiddleware, postController.getFeed);

/**
 * @swagger
 * /api/posts/stats:
 *   get:
 *     summary: Obtener estadísticas de posts
 *     description: Obtiene estadísticas generales sobre las publicaciones
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Estadísticas de posts
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
 *                           example: 500
 *                         postsByType:
 *                           type: object
 *                           example: {"text": 300, "invoice": 150, "image": 50}
 *                         totalReactions:
 *                           type: number
 *                           example: 2500
 *                         totalComments:
 *                           type: number
 *                           example: 800
 */
router.get('/stats', postController.getPostStats);

/**
 * @swagger
 * /api/posts/{id}/reactions:
 *   post:
 *     summary: Añadir reacción a un post
 *     description: Añade una reacción (like, love, laugh) a una publicación
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - reactionType
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               reactionType:
 *                 type: string
 *                 enum: [like, love, laugh]
 *                 example: "like"
 *     responses:
 *       200:
 *         description: Reacción añadida exitosamente
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
router.post('/:id/reactions', authMiddleware, postController.addReaction);

/**
 * @swagger
 * /api/posts/{id}/reactions:
 *   delete:
 *     summary: Eliminar reacción de un post
 *     description: Elimina la reacción de un usuario a una publicación
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Reacción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Reacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/reactions', authMiddleware, postController.removeReaction);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Añadir comentario a un post
 *     description: Añade un comentario a una publicación
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               content:
 *                 type: string
 *                 example: "Excelente publicación!"
 *     responses:
 *       201:
 *         description: Comentario añadido exitosamente
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
router.post('/:id/comments', authMiddleware, postController.addComment);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Obtener todas las publicaciones
 *     description: Lista todas las publicaciones con paginación y filtros
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: postType
 *         schema:
 *           type: string
 *           enum: [text, invoice, image]
 *         description: Filtrar por tipo de publicación
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filtrar por autor específico
 *     responses:
 *       200:
 *         description: Lista de publicaciones
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
 *                         $ref: '#/components/schemas/Post'
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Crear nueva publicación
 *     description: Crea una nueva publicación en el sistema con soporte para archivos multimedia
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - postType
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Mi nueva publicación"
 *               content:
 *                 type: string
 *                 example: "Contenido de la publicación..."
 *               postType:
 *                 type: string
 *                 enum: [text, invoice, image]
 *                 example: "text"
 *               invoiceId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos multimedia (máximo 10, 5MB cada uno)
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, uploadMultipleFiles, processUploadedFiles, postController.createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Obtener publicación por ID
 *     description: Obtiene una publicación específica por su ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Actualizar publicación
 *     description: Actualiza una publicación existente con soporte para archivos multimedia
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicación
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               postType:
 *                 type: string
 *                 enum: [text, invoice, image]
 *               invoiceId:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos multimedia (máximo 10, 5MB cada uno)
 *               filesToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de archivos a eliminar
 *     responses:
 *       200:
 *         description: Publicación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authMiddleware, uploadMultipleFiles, processUploadedFiles, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Eliminar publicación
 *     description: Elimina una publicación del sistema
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/media/{mediaId}:
 *   delete:
 *     summary: Eliminar archivo multimedia específico
 *     description: Elimina un archivo multimedia específico de una publicación
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicación
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo multimedia
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/media/:mediaId', authMiddleware, postController.deleteMedia);

// Rutas especializadas para posts de facturas
router.use('/invoice', invoicePostRoutes);

module.exports = router; 