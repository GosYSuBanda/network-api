const postService = require('../services/post.service');

class PostController {

  /**
   * Crear nuevo post
   * POST /api/posts
   */
  async createPost(req, res) {
    try {
      console.log('📝 Iniciando creación de post...');
      console.log('Usuario autenticado:', req.user?.userId);
      console.log('Datos recibidos:', req.body);
      console.log('Archivos subidos:', req.uploadedFiles?.length || 0);

      const postData = {
        ...req.body,
        authorId: req.user.userId // Usar ID del usuario autenticado
      };

      // Agregar archivos multimedia si fueron subidos
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        postData.media = req.uploadedFiles;
        console.log('📷 Archivos multimedia agregados:', req.uploadedFiles.length);
      }
      
      console.log('📋 Datos del post a crear:', postData);
      
      const post = await postService.createPost(postData);
      
      console.log('✅ Post creado exitosamente:', post._id);
      
      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: post,
        filesUploaded: req.uploadedFiles ? req.uploadedFiles.length : 0
      });
    } catch (error) {
      console.error('❌ Error al crear post:', error);
      res.status(400).json({
        success: false,
        message: 'Error al crear post',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los posts
   * GET /api/posts
   */
  async getAllPosts(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        postType: req.query.postType,
        authorId: req.query.authorId,
        search: req.query.search
      };

      const result = await postService.getAllPosts(options);

      res.status(200).json({
        success: true,
        message: 'Posts obtenidos exitosamente',
        data: result.posts,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts',
        error: error.message
      });
    }
  }

  /**
   * Obtener post por ID
   * GET /api/posts/:id
   */
  async getPostById(req, res) {
    try {
      const post = await postService.getPostById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Post obtenido exitosamente',
        data: post
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener post',
        error: error.message
      });
    }
  }

  /**
   * Actualizar post
   * PUT /api/posts/:id
   */
  async updatePost(req, res) {
    try {
      const userId = req.user.userId; // Obtener del usuario autenticado
      const updateData = { ...req.body };

      // Agregar archivos multimedia si fueron subidos
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        updateData.media = req.uploadedFiles;
      }

      const post = await postService.updatePost(req.params.id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: post,
        filesUploaded: req.uploadedFiles ? req.uploadedFiles.length : 0
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al actualizar post',
        error: error.message
      });
    }
  }

  /**
   * Eliminar post
   * DELETE /api/posts/:id
   */
  async deletePost(req, res) {
    try {
      const userId = req.user.userId; // Obtener del usuario autenticado
      const result = await postService.deletePost(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar post',
        error: error.message
      });
    }
  }

  /**
   * Agregar reacción
   * POST /api/posts/:id/reactions
   */
  async addReaction(req, res) {
    try {
      const { type } = req.body;
      const userId = req.user.userId; // Obtener del usuario autenticado
      const result = await postService.addReaction(req.params.id, userId, type);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al agregar reacción',
        error: error.message
      });
    }
  }

  /**
   * Remover reacción
   * DELETE /api/posts/:id/reactions
   */
  async removeReaction(req, res) {
    try {
      const userId = req.user.userId; // Obtener del usuario autenticado
      const result = await postService.removeReaction(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al remover reacción',
        error: error.message
      });
    }
  }

  /**
   * Agregar comentario
   * POST /api/posts/:id/comments
   */
  async addComment(req, res) {
    try {
      const { comment } = req.body;
      const userId = req.user.userId; // Usar ID del usuario autenticado
      const post = await postService.addComment(req.params.id, userId, comment);

      res.status(200).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: post
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al agregar comentario',
        error: error.message
      });
    }
  }

  /**
   * Obtener feed inteligente
   * GET /api/posts/feed
   */
  async getFeed(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0,
        feedType: req.query.feedType || 'following', // 'following', 'discover', 'trending'
        includeOwnPosts: req.query.includeOwnPosts !== 'false'
      };

      // Obtener userId del usuario autenticado o null si no está autenticado
      const userId = req.user ? req.user.userId : null;
      
      const posts = await postService.getFeed(userId, options);

      res.status(200).json({
        success: true,
        message: 'Feed obtenido exitosamente',
        data: posts,
        feedType: options.feedType,
        pagination: {
          limit: options.limit,
          skip: options.skip,
          hasMore: posts.length === options.limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener feed',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas
   * GET /api/posts/stats
   */
  async getPostStats(req, res) {
    try {
      const stats = await postService.getPostStats();

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

  /**
   * Eliminar archivo multimedia específico
   * DELETE /api/posts/:id/media/:mediaId
   */
  async deleteMedia(req, res) {
    try {
      const userId = req.user.userId; // Obtener del usuario autenticado
      const result = await postService.deleteMedia(req.params.id, req.params.mediaId, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Post no encontrado' ? 404 : 
                        error.message === 'Archivo no encontrado' ? 404 :
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar archivo',
        error: error.message
      });
    }
  }
}

module.exports = new PostController(); 