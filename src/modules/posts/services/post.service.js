const Post = require('../models/post.model');
const User = require('../../users/models/user.model');
const Contact = require('../../contacts/models/contact.model');
const cloudinary = require('../../../shared/config/cloudinary');

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

      // Manejar archivos multimedia
      if (updateData.media) {
        // Agregar nuevos archivos a los existentes
        post.media = post.media.concat(updateData.media);
        delete updateData.media;
      }

      // Manejar eliminación de archivos específicos
      if (updateData.filesToDelete && Array.isArray(updateData.filesToDelete)) {
        for (const fileId of updateData.filesToDelete) {
          const mediaIndex = post.media.findIndex(m => m._id.toString() === fileId);
          if (mediaIndex !== -1) {
            const mediaItem = post.media[mediaIndex];
            // Eliminar de Cloudinary
            if (mediaItem.cloudinaryId) {
              try {
                await cloudinary.uploader.destroy(mediaItem.cloudinaryId);
              } catch (cloudinaryError) {
                console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
              }
            }
            // Eliminar del array
            post.media.splice(mediaIndex, 1);
          }
        }
        delete updateData.filesToDelete;
      }

      // Actualizar resto de datos
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

      // Eliminar archivos multimedia de Cloudinary
      if (post.media && post.media.length > 0) {
        for (const mediaItem of post.media) {
          if (mediaItem.cloudinaryId) {
            try {
              await cloudinary.uploader.destroy(mediaItem.cloudinaryId);
            } catch (cloudinaryError) {
              console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
            }
          }
        }
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
   * Obtener feed inteligente de posts
   */
  async getFeed(userId, options = {}) {
    try {
      const { 
        limit = 10, 
        skip = 0, 
        feedType = 'following', // 'following', 'discover', 'trending'
        includeOwnPosts = true 
      } = options;

      let query = {};
      let posts = [];

      switch (feedType) {
        case 'following':
          posts = await this.getFollowingFeed(userId, limit, skip, includeOwnPosts);
          break;
        case 'discover':
          posts = await this.getDiscoverFeed(userId, limit, skip);
          break;
        case 'trending':
          posts = await this.getTrendingFeed(limit, skip);
          break;
        default:
          posts = await this.getFollowingFeed(userId, limit, skip, includeOwnPosts);
      }

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Feed de usuarios seguidos
   */
  async getFollowingFeed(userId, limit, skip, includeOwnPosts) {
    try {
      // Obtener usuarios seguidos
      const following = await Contact.find({ followerId: userId }).select('followeeId');
      const followingIds = following.map(f => f.followeeId);

      // Incluir posts propios si está habilitado
      if (includeOwnPosts) {
        followingIds.push(userId);
      }

      // Si no sigue a nadie y no incluye posts propios, devolver array vacío
      if (followingIds.length === 0) {
        return [];
      }

      // Obtener posts con score de relevancia
      const posts = await Post.aggregate([
        {
          $match: {
            authorId: { $in: followingIds }
          }
        },
        {
          $addFields: {
            // Calcular score de relevancia
            relevanceScore: {
              $add: [
                // Score por fecha (más reciente = más score)
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [new Date(), '$createdAt'] },
                        86400000 // 24 horas en ms
                      ]
                    },
                    -0.1 // Penalización por antigüedad
                  ]
                },
                // Score por engagement
                {
                  $multiply: [
                    { $add: [{ $size: '$reactions' }, { $size: '$comments' }] },
                    0.5
                  ]
                },
                // Bonus para posts con archivos multimedia
                {
                  $cond: [
                    { $gt: [{ $size: '$media' }, 0] },
                    2,
                    0
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { relevanceScore: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }]
          }
        },
        {
          $lookup: {
            from: 'invoices',
            localField: 'invoiceId',
            foreignField: '_id',
            as: 'invoice',
            pipeline: [{ $project: { code: 1, total: 1, status: 1, company: 1 } }]
          }
        },
        {
          $addFields: {
            authorId: { $arrayElemAt: ['$author', 0] },
            invoiceId: { $arrayElemAt: ['$invoice', 0] }
          }
        },
        {
          $unset: ['author', 'invoice']
        }
      ]);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Feed de descubrimiento (usuarios no seguidos)
   */
  async getDiscoverFeed(userId, limit, skip) {
    try {
      // Obtener usuarios seguidos para excluirlos
      const following = await Contact.find({ followerId: userId }).select('followeeId');
      const followingIds = following.map(f => f.followeeId);
      followingIds.push(userId); // Excluir posts propios también

      const posts = await Post.aggregate([
        {
          $match: {
            authorId: { $nin: followingIds }
          }
        },
        {
          $addFields: {
            // Score basado en engagement reciente
            discoverScore: {
              $add: [
                // Posts con más reacciones
                { $multiply: [{ $size: '$reactions' }, 2] },
                // Posts con más comentarios
                { $multiply: [{ $size: '$comments' }, 3] },
                // Penalización por antigüedad
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [new Date(), '$createdAt'] },
                        86400000 // 24 horas
                      ]
                    },
                    -0.2
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { discoverScore: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }]
          }
        },
        {
          $addFields: {
            authorId: { $arrayElemAt: ['$author', 0] }
          }
        },
        {
          $unset: ['author']
        }
      ]);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Feed de tendencias (posts más populares)
   */
  async getTrendingFeed(limit, skip) {
    try {
      const posts = await Post.aggregate([
        {
          $addFields: {
            // Score de tendencia basado en engagement en las últimas 24 horas
            trendingScore: {
              $add: [
                // Peso por reacciones
                { $multiply: [{ $size: '$reactions' }, 3] },
                // Peso por comentarios
                { $multiply: [{ $size: '$comments' }, 5] },
                // Bonus por posts recientes (últimas 24 horas)
                {
                  $cond: [
                    {
                      $gte: [
                        '$createdAt',
                        { $subtract: [new Date(), 86400000] } // 24 horas atrás
                      ]
                    },
                    10, // Bonus de 10 puntos
                    0
                  ]
                }
              ]
            }
          }
        },
        {
          $match: {
            trendingScore: { $gt: 0 } // Solo posts con algún engagement
          }
        },
        {
          $sort: { trendingScore: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }]
          }
        },
        {
          $addFields: {
            authorId: { $arrayElemAt: ['$author', 0] }
          }
        },
        {
          $unset: ['author']
        }
      ]);

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

  /**
   * Eliminar archivo multimedia específico
   */
  async deleteMedia(postId, mediaId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post no encontrado');
      }

      // Verificar que el usuario es el autor del post
      if (!post.authorId.equals(userId)) {
        throw new Error('No tienes permisos para eliminar archivos de este post');
      }

      // Buscar el archivo en la lista de media
      const mediaIndex = post.media.findIndex(m => m._id.toString() === mediaId);
      if (mediaIndex === -1) {
        throw new Error('Archivo no encontrado');
      }

      const mediaItem = post.media[mediaIndex];

      // Eliminar archivo de Cloudinary
      if (mediaItem.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(mediaItem.cloudinaryId);
        } catch (cloudinaryError) {
          console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
          // Continuamos con la eliminación del post aunque falle Cloudinary
        }
      }

      // Eliminar archivo del array de media
      post.media.splice(mediaIndex, 1);
      await post.save();

      return { message: 'Archivo eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PostService(); 