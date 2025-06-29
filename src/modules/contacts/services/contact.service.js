const Contact = require('../models/contact.model');
const User = require('../../users/models/user.model');

class ContactService {
  
  /**
   * Seguir a un usuario
   */
  async followUser(followerId, followeeId) {
    try {
      // Verificar que ambos usuarios existen
      const [follower, followee] = await Promise.all([
        User.findById(followerId),
        User.findById(followeeId)
      ]);

      if (!follower) throw new Error('Usuario seguidor no encontrado');
      if (!followee) throw new Error('Usuario a seguir no encontrado');

      // Crear relación de seguimiento
      const contact = await Contact.follow(followerId, followeeId);
      return contact;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(followerId, followeeId) {
    try {
      const result = await Contact.unfollow(followerId, followeeId);
      if (!result) {
        throw new Error('Relación de seguimiento no encontrada');
      }
      return { message: 'Has dejado de seguir al usuario correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener seguidores de un usuario
   */
  async getFollowers(userId, options = {}) {
    try {
      const { limit = 50, skip = 0 } = options;
      
      const followers = await Contact.getFollowers(userId, limit, skip);
      const totalFollowers = await Contact.countDocuments({ followeeId: userId });
      
      return {
        followers,
        total: totalFollowers,
        hasMore: skip + limit < totalFollowers
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios que sigue un usuario
   */
  async getFollowing(userId, options = {}) {
    try {
      const { limit = 50, skip = 0 } = options;
      
      const following = await Contact.getFollowing(userId, limit, skip);
      const totalFollowing = await Contact.countDocuments({ followerId: userId });
      
      return {
        following,
        total: totalFollowing,
        hasMore: skip + limit < totalFollowing
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId, followeeId) {
    try {
      const isFollowing = await Contact.isFollowing(followerId, followeeId);
      return { isFollowing };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener conteos de seguidores y seguidos
   */
  async getUserCounts(userId) {
    try {
      const counts = await Contact.getCounts(userId);
      return counts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener seguidores mutuos
   */
  async getMutualFollows(userId) {
    try {
      const mutualFollows = await Contact.getMutualFollows(userId);
      return mutualFollows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sugerencias de usuarios para seguir
   */
  async getSuggestedUsers(userId, limit = 10) {
    try {
      // Obtener usuarios que el usuario actual no sigue
      const following = await Contact.find({ followerId: userId }).select('followeeId');
      const followingIds = following.map(f => f.followeeId);
      followingIds.push(userId); // Excluir al usuario actual

      // Obtener usuarios sugeridos (los más seguidos que no sigue)
      const suggestedUsers = await Contact.aggregate([
        {
          $match: {
            followeeId: { $nin: followingIds }
          }
        },
        {
          $group: {
            _id: '$followeeId',
            followerCount: { $sum: 1 }
          }
        },
        {
          $sort: { followerCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            followerCount: 1
          }
        }
      ]);

      return suggestedUsers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener actividad reciente de contactos
   */
  async getRecentActivity(userId, limit = 20) {
    try {
      const recentFollows = await Contact.find({ followerId: userId })
        .populate('followeeId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);

      return recentFollows.map(follow => ({
        type: 'follow',
        user: follow.followeeId,
        date: follow.createdAt
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover seguidor (bloquear)
   */
  async removeFollower(userId, followerId) {
    try {
      const result = await Contact.findOneAndDelete({
        followerId,
        followeeId: userId
      });

      if (!result) {
        throw new Error('Relación de seguimiento no encontrada');
      }

      return { message: 'Seguidor removido correctamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ContactService(); 