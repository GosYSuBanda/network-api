const FriendRequest = require('../models/friendRequest.model');
const Post = require('../../posts/models/post.model');
const User = require('../../users/models/user.model');

class FriendRequestService {
  
  /**
   * Enviar solicitud de amistad
   */
  async sendFriendRequest(friendRequestData) {
    try {
      // Verificar que el post y el usuario existen
      const [post, sender] = await Promise.all([
        Post.findById(friendRequestData.postId),
        User.findById(friendRequestData.senderId)
      ]);

      if (!post) throw new Error('Post no encontrado');
      if (!sender) throw new Error('Usuario no encontrado');

      // Verificar que no es el autor del post
      if (post.authorId.equals(friendRequestData.senderId)) {
        throw new Error('No puedes enviar solicitud de amistad a tu propio post');
      }

      // Verificar que no existe una solicitud previa
      const existingRequest = await FriendRequest.findOne({
        postId: friendRequestData.postId,
        senderId: friendRequestData.senderId
      });

      if (existingRequest) {
        throw new Error('Ya has enviado una solicitud de amistad para este post');
      }

      // Crear la solicitud
      const friendRequest = new FriendRequest(friendRequestData);
      await friendRequest.save();
      
      // Popular referencias
      await friendRequest.populateReferences();
      return friendRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener solicitudes pendientes de un post
   */
  async getPendingRequestsByPost(postId) {
    try {
      const requests = await FriendRequest.getPendingByPost(postId);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener solicitudes enviadas por un usuario
   */
  async getSentRequestsByUser(senderId) {
    try {
      const requests = await FriendRequest.getSentByUser(senderId);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener solicitudes recibidas por un usuario (autor de posts)
   */
  async getReceivedRequestsByUser(authorId, options = {}) {
    try {
      const { status = 'pending', limit = 20, skip = 0 } = options;

      // Obtener posts del usuario
      const userPosts = await Post.find({ authorId }).select('_id');
      const postIds = userPosts.map(post => post._id);

      // Obtener solicitudes para esos posts
      const requests = await FriendRequest.find({
        postId: { $in: postIds },
        status
      })
        .populate('senderId', 'firstName lastName email')
        .populate('postId', 'title')
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await FriendRequest.countDocuments({
        postId: { $in: postIds },
        status
      });

      return {
        requests,
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener solicitud por ID
   */
  async getFriendRequestById(requestId) {
    try {
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }
      
      await request.populateReferences();
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aceptar solicitud de amistad
   */
  async acceptFriendRequest(requestId, userId) {
    try {
      const request = await FriendRequest.findById(requestId).populate('postId');
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }

      // Verificar que el usuario es el autor del post
      if (!request.postId.authorId.equals(userId)) {
        throw new Error('No tienes permisos para aceptar esta solicitud');
      }

      if (request.status !== 'pending') {
        throw new Error('La solicitud ya fue procesada');
      }

      await request.accept();
      
      // Aquí se podría crear automáticamente la relación de contacto
      const Contact = require('../../contacts/models/contact.model');
      try {
        await Contact.follow(request.senderId, request.postId.authorId);
      } catch (contactError) {
        // Si ya son contactos, continuar
        console.log('Los usuarios ya son contactos o error al crear contacto:', contactError.message);
      }

      await request.populateReferences();
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rechazar solicitud de amistad
   */
  async rejectFriendRequest(requestId, userId) {
    try {
      const request = await FriendRequest.findById(requestId).populate('postId');
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }

      // Verificar que el usuario es el autor del post
      if (!request.postId.authorId.equals(userId)) {
        throw new Error('No tienes permisos para rechazar esta solicitud');
      }

      if (request.status !== 'pending') {
        throw new Error('La solicitud ya fue procesada');
      }

      await request.reject();
      await request.populateReferences();
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar solicitud enviada
   */
  async cancelFriendRequest(requestId, userId) {
    try {
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }

      // Verificar que el usuario es quien envió la solicitud
      if (!request.senderId.equals(userId)) {
        throw new Error('No tienes permisos para cancelar esta solicitud');
      }

      if (request.status !== 'pending') {
        throw new Error('Solo se pueden cancelar solicitudes pendientes');
      }

      await FriendRequest.findByIdAndDelete(requestId);
      return { message: 'Solicitud cancelada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  async getFriendRequestStats(userId) {
    try {
      // Obtener posts del usuario
      const userPosts = await Post.find({ authorId: userId }).select('_id');
      const postIds = userPosts.map(post => post._id);

      const stats = await FriendRequest.aggregate([
        {
          $facet: {
            sent: [
              { $match: { senderId: userId } },
              { 
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ],
            received: [
              { $match: { postId: { $in: postIds } } },
              { 
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      const result = {
        sent: {
          pending: 0,
          accepted: 0,
          rejected: 0
        },
        received: {
          pending: 0,
          accepted: 0,
          rejected: 0
        }
      };

      // Procesar estadísticas enviadas
      stats[0].sent.forEach(stat => {
        result.sent[stat._id] = stat.count;
      });

      // Procesar estadísticas recibidas
      stats[0].received.forEach(stat => {
        result.received[stat._id] = stat.count;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener solicitudes por status
   */
  async getFriendRequestsByStatus(status, limit = 50, skip = 0) {
    try {
      const requests = await FriendRequest.find({ status })
        .populate('senderId', 'firstName lastName email')
        .populate('postId', 'title authorId')
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await FriendRequest.countDocuments({ status });

      return {
        requests,
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FriendRequestService(); 