const friendRequestService = require('../services/friendRequest.service');

class FriendRequestController {

  /**
   * Enviar solicitud de amistad
   * POST /api/friend-requests
   */
  async sendFriendRequest(req, res) {
    try {
      const friendRequest = await friendRequestService.sendFriendRequest(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Solicitud de amistad enviada exitosamente',
        data: friendRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al enviar solicitud de amistad',
        error: error.message
      });
    }
  }

  /**
   * Obtener solicitudes pendientes de un post
   * GET /api/friend-requests/post/:postId
   */
  async getPendingRequestsByPost(req, res) {
    try {
      const requests = await friendRequestService.getPendingRequestsByPost(req.params.postId);

      res.status(200).json({
        success: true,
        message: 'Solicitudes pendientes obtenidas exitosamente',
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes pendientes',
        error: error.message
      });
    }
  }

  /**
   * Obtener solicitudes enviadas por un usuario
   * GET /api/friend-requests/sent/:userId
   */
  async getSentRequestsByUser(req, res) {
    try {
      const requests = await friendRequestService.getSentRequestsByUser(req.params.userId);

      res.status(200).json({
        success: true,
        message: 'Solicitudes enviadas obtenidas exitosamente',
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes enviadas',
        error: error.message
      });
    }
  }

  /**
   * Obtener solicitudes recibidas por un usuario
   * GET /api/friend-requests/received/:userId
   */
  async getReceivedRequestsByUser(req, res) {
    try {
      const options = {
        status: req.query.status || 'pending',
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0
      };

      const result = await friendRequestService.getReceivedRequestsByUser(req.params.userId, options);

      res.status(200).json({
        success: true,
        message: 'Solicitudes recibidas obtenidas exitosamente',
        data: result.requests,
        meta: {
          total: result.total,
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes recibidas',
        error: error.message
      });
    }
  }

  /**
   * Obtener solicitud por ID
   * GET /api/friend-requests/:id
   */
  async getFriendRequestById(req, res) {
    try {
      const request = await friendRequestService.getFriendRequestById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Solicitud obtenida exitosamente',
        data: request
      });
    } catch (error) {
      const statusCode = error.message === 'Solicitud no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener solicitud',
        error: error.message
      });
    }
  }

  /**
   * Aceptar solicitud de amistad
   * PATCH /api/friend-requests/:id/accept
   */
  async acceptFriendRequest(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId para aceptar la solicitud'
        });
      }

      const request = await friendRequestService.acceptFriendRequest(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: 'Solicitud de amistad aceptada exitosamente',
        data: request
      });
    } catch (error) {
      const statusCode = error.message === 'Solicitud no encontrada' ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al aceptar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Rechazar solicitud de amistad
   * PATCH /api/friend-requests/:id/reject
   */
  async rejectFriendRequest(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId para rechazar la solicitud'
        });
      }

      const request = await friendRequestService.rejectFriendRequest(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: 'Solicitud de amistad rechazada exitosamente',
        data: request
      });
    } catch (error) {
      const statusCode = error.message === 'Solicitud no encontrada' ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al rechazar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Cancelar solicitud enviada
   * DELETE /api/friend-requests/:id
   */
  async cancelFriendRequest(req, res) {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId para cancelar la solicitud'
        });
      }

      const result = await friendRequestService.cancelFriendRequest(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Solicitud no encontrada' ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al cancelar solicitud',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   * GET /api/friend-requests/stats/:userId
   */
  async getFriendRequestStats(req, res) {
    try {
      const stats = await friendRequestService.getFriendRequestStats(req.params.userId);

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
   * Obtener solicitudes por status
   * GET /api/friend-requests/status/:status
   */
  async getFriendRequestsByStatus(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;

      const result = await friendRequestService.getFriendRequestsByStatus(req.params.status, limit, skip);

      res.status(200).json({
        success: true,
        message: 'Solicitudes obtenidas exitosamente',
        data: result.requests,
        meta: {
          total: result.total,
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes',
        error: error.message
      });
    }
  }
}

module.exports = new FriendRequestController(); 