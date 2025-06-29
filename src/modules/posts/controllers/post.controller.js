const postService = require('../services/post.service');

class PostController {

  /**
   * Crear nuevo post
   * POST /api/posts
   */
  async createPost(req, res) {
    try {
      const post = await postService.createPost(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: post
      });
    } catch (error) {
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
      // Por ahora usamos el authorId del body, en una app real vendría del token JWT
      const userId = req.body.userId || req.body.authorId;
      const post = await postService.updatePost(req.params.id, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: post
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
      // Por ahora usamos el userId del query, en una app real vendría del token JWT
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId para eliminar el post'
        });
      }

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
      const { userId, type } = req.body;
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
      const { userId } = req.body;
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
      const { userId, comment } = req.body;
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
   * Obtener feed
   * GET /api/posts/feed
   */
  async getFeed(req, res) {
    try {
      const userId = req.query.userId;
      const options = {
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0
      };

      const posts = await postService.getFeed(userId, options);

      res.status(200).json({
        success: true,
        message: 'Feed obtenido exitosamente',
        data: posts
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
}

module.exports = new PostController(); 