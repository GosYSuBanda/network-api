const User = require('../models/user.model');
const Contact = require('../../contacts/models/contact.model');
const mongoose = require('mongoose');

class UserSearchService {

  /**
   * Buscar usuarios por criterios diversos
   */
  async searchUsers(searchTerm, options = {}, requestingUserId = null) {
    try {
      const {
        limit = 10,
        skip = 0,
        excludeFollowing = false,
        onlyFollowing = false
      } = options;

      let pipeline = [];

      // Construir filtros de búsqueda
      if (searchTerm && searchTerm.trim()) {
        const searchRegex = new RegExp(searchTerm.trim(), 'i');
        pipeline.push({
          $match: {
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { email: searchRegex },
              { 
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$firstName', ' ', '$lastName'] },
                    regex: searchTerm.trim(),
                    options: 'i'
                  }
                }
              }
            ],
            status: 'active' // Solo usuarios activos
          }
        });
      } else {
        pipeline.push({
          $match: { status: 'active' }
        });
      }

      // Filtrar según seguimiento si se proporciona userId
      if (requestingUserId) {
        // Obtener usuarios seguidos si es necesario
        let followingIds = [];
        if (excludeFollowing || onlyFollowing) {
          const following = await Contact.find({ followerId: requestingUserId }).select('followeeId');
          followingIds = following.map(f => f.followeeId.toString());
        }

        // Excluir el propio usuario
        pipeline.push({
          $match: {
            _id: { $ne: requestingUserId }
          }
        });

        // Aplicar filtros de seguimiento
        if (excludeFollowing && followingIds.length > 0) {
          pipeline.push({
            $match: {
              _id: { $nin: followingIds.map(id => new mongoose.Types.ObjectId(id)) }
            }
          });
        }

        if (onlyFollowing && followingIds.length > 0) {
          pipeline.push({
            $match: {
              _id: { $in: followingIds.map(id => new mongoose.Types.ObjectId(id)) }
            }
          });
        }
      }

      // Agregar información de seguimiento
      if (requestingUserId) {
        pipeline.push({
          $lookup: {
            from: 'contacts',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$followerId', requestingUserId] },
                      { $eq: ['$followeeId', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'isFollowing'
          }
        });

        pipeline.push({
          $addFields: {
            isFollowing: { $gt: [{ $size: '$isFollowing' }, 0] }
          }
        });
      }

      // Agregar conteos de seguidores y seguidos
      pipeline.push({
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: 'followeeId',
          as: 'followers'
        }
      });

      pipeline.push({
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: 'followerId',
          as: 'following'
        }
      });

      pipeline.push({
        $addFields: {
          followersCount: { $size: '$followers' },
          followingCount: { $size: '$following' }
        }
      });

      // Popular el rol
      pipeline.push({
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      });

      pipeline.push({
        $addFields: {
          role: { $arrayElemAt: ['$role', 0] }
        }
      });

      // Proyección final
      pipeline.push({
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          status: 1,
          role: { name: 1, permissions: 1 },
          followersCount: 1,
          followingCount: 1,
          isFollowing: 1,
          createdAt: 1,
          lastLogin: 1
        }
      });

      // Ordenar por relevancia (más seguidores primero, luego por fecha)
      pipeline.push({
        $sort: {
          followersCount: -1,
          createdAt: -1
        }
      });

      // Paginación
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const users = await User.aggregate(pipeline);

      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sugerencias de usuarios para seguir
   */
  async getUserSuggestions(userId, limit = 10) {
    try {
      // Obtener usuarios seguidos actualmente
      const following = await Contact.find({ followerId: userId }).select('followeeId');
      const followingIds = following.map(f => f.followeeId);
      followingIds.push(userId); // Excluir usuario actual

      // Obtener usuarios que los usuarios seguidos también siguen (amigos de amigos)
      const mutualConnections = await Contact.aggregate([
        {
          $match: {
            followerId: { $in: followingIds.slice(0, -1) }, // Excluir al usuario actual
            followeeId: { $nin: followingIds } // Excluir ya seguidos
          }
        },
        {
          $group: {
            _id: '$followeeId',
            mutualCount: { $sum: 1 },
            mutualFriends: { $push: '$followerId' }
          }
        },
        {
          $sort: { mutualCount: -1 }
        },
        {
          $limit: limit
        }
      ]);

      // Obtener información completa de usuarios sugeridos
      const suggestionIds = mutualConnections.map(mc => mc._id);
      
      if (suggestionIds.length === 0) {
        // Si no hay sugerencias mutuas, devolver usuarios populares
        return await this.getPopularUsers(userId, limit);
      }

      const suggestions = await User.aggregate([
        {
          $match: {
            _id: { $in: suggestionIds },
            status: 'active'
          }
        },
        {
          $lookup: {
            from: 'contacts',
            localField: '_id',
            foreignField: 'followeeId',
            as: 'followers'
          }
        },
        {
          $addFields: {
            followersCount: { $size: '$followers' },
            mutualCount: {
              $let: {
                vars: {
                  suggestion: {
                    $filter: {
                      input: mutualConnections,
                      cond: { $eq: ['$$this._id', '$_id'] }
                    }
                  }
                },
                in: { $arrayElemAt: ['$$suggestion.mutualCount', 0] }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            followersCount: 1,
            mutualCount: 1,
            reason: 'Amigos en común'
          }
        },
        {
          $sort: { mutualCount: -1, followersCount: -1 }
        }
      ]);

      return suggestions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios populares (más seguidores)
   */
  async getPopularUsers(excludeUserId, limit = 10) {
    try {
      const users = await User.aggregate([
        {
          $match: {
            _id: { $ne: excludeUserId },
            status: 'active'
          }
        },
        {
          $lookup: {
            from: 'contacts',
            localField: '_id',
            foreignField: 'followeeId',
            as: 'followers'
          }
        },
        {
          $addFields: {
            followersCount: { $size: '$followers' }
          }
        },
        {
          $match: {
            followersCount: { $gt: 0 } // Solo usuarios con al menos 1 seguidor
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            followersCount: 1,
            reason: 'Usuario popular'
          }
        },
        {
          $sort: { followersCount: -1, createdAt: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar usuarios por ubicación (si se implementa geolocalización)
   */
  async searchUsersByLocation(userId, coordinates, radius = 50, limit = 10) {
    try {
      // Esta funcionalidad requeriría agregar campos de geolocalización al modelo User
      // Por ahora devolvemos un array vacío
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios trending (más activos recientemente)
   */
  async getTrendingUsers(excludeUserId, limit = 10) {
    try {
      const users = await User.aggregate([
        {
          $match: {
            _id: { $ne: excludeUserId },
            status: 'active',
            lastLogin: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
            }
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'authorId',
            as: 'recentPosts',
            pipeline: [
              {
                $match: {
                  createdAt: { 
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                  }
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'contacts',
            localField: '_id',
            foreignField: 'followeeId',
            as: 'followers'
          }
        },
        {
          $addFields: {
            recentPostsCount: { $size: '$recentPosts' },
            followersCount: { $size: '$followers' },
            activityScore: {
              $add: [
                { $multiply: [{ $size: '$recentPosts' }, 2] },
                { $size: '$followers' }
              ]
            }
          }
        },
        {
          $match: {
            activityScore: { $gt: 0 }
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            followersCount: 1,
            recentPostsCount: 1,
            activityScore: 1,
            reason: 'Usuario trending'
          }
        },
        {
          $sort: { activityScore: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserSearchService(); 