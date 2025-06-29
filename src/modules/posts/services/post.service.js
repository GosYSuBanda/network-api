const Post = require('../models/post.model');
const User = require('../../users/models/user.model');

class PostService {
  
  /**
   * Crear un nuevo post
   */
  async createPost(postData) {
    try {
      // Verificar que el autor existe
      const author = await User.findById(postData.authorId);
      if (!author) {
        throw new Error('Autor no encontrado');
      }

      const post = new Post(postData);
      await post.save();
      
      // Popular referencias antes de devolver
      await post.populateReferences();
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los posts con paginación
   */
  async getAllPosts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        postType,
        authorId,
        search
      } = options;

      // Construir query de filtros
      const query = {};
      
      if (postType) query.postType = postType;
      if (authorId) query.authorId = authorId;
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      // Calcular skip
      const skip = (page - 1) * limit;

      // Construir sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consultas en paralelo
      const [posts, total] = await Promise.all([
        Post.find(query)
          .populate('authorId', 'firstName lastName')
          .populate('invoiceId', 'code total status company')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Post.countDocuments(query)
      ]);

      return {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener post por ID
   */
  async getPostById(postId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }
      
      await post.populateReferences();
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar post
   */
  async updatePost(postId, updateData, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      // Verificar que el usuario es el autor del post
      if (!post.authorId.equals(userId)) {
        throw new Error('No tienes permisos para editar este post');
      }

      // Actualizar post
      Object.assign(post, updateData);
      await post.save();
      
      await post.populateReferences();
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar post
   */
  async deletePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      // Verificar que el usuario es el autor del post o tiene permisos
      const user = await User.findById(userId).populate('roleId');
      const canDelete = post.authorId.equals(userId) || 
                       (user.roleId && user.roleId.permissions.deleteAnyPost);

      if (!canDelete) {
        throw new Error('No tienes permisos para eliminar este post');
      }

      await Post.findByIdAndDelete(postId);
      return { message: 'Post eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agregar reacción a un post
   */
  async addReaction(postId, userId, reactionType) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      await post.addReaction(userId, reactionType);
      return { message: 'Reacción agregada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover reacción de un post
   */
  async removeReaction(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      await post.removeReaction(userId);
      return { message: 'Reacción removida correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agregar comentario a un post
   */
  async addComment(postId, userId, comment) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      await post.addComment(userId, comment);
      await post.populateReferences();
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener feed de posts
   */
  async getFeed(userId, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      
      // Por ahora retorna todos los posts ordenados por fecha
      // En futuras versiones se puede implementar algoritmo de feed personalizado
      const posts = await Post.getFeedPosts(limit, skip);
      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de posts
   */
  async getPostStats() {
    try {
      const stats = await Post.aggregate([
        {
          $group: {
            _id: '$postType',
            count: { $sum: 1 },
            avgReactions: { $avg: { $size: '$reactions' } },
            avgComments: { $avg: { $size: '$comments' } }
          }
        }
      ]);

      const totalPosts = await Post.countDocuments();
      
      return {
        totalPosts,
        byType: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            avgReactions: Math.round(stat.avgReactions * 100) / 100,
            avgComments: Math.round(stat.avgComments * 100) / 100
          };
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PostService(); 