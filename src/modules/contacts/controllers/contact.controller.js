const contactService = require('../services/contact.service');

class ContactController {

  /**
   * Seguir a un usuario
   * POST /api/contacts/follow
   */
  async followUser(req, res) {
    try {
      const { followerId, followeeId } = req.body;
      const contact = await contactService.followUser(followerId, followeeId);
      
      res.status(201).json({
        success: true,
        message: 'Usuario seguido exitosamente',
        data: contact
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al seguir usuario',
        error: error.message
      });
    }
  }

  /**
   * Dejar de seguir a un usuario
   * DELETE /api/contacts/unfollow
   */
  async unfollowUser(req, res) {
    try {
      const { followerId, followeeId } = req.body;
      const result = await contactService.unfollowUser(followerId, followeeId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al dejar de seguir usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener seguidores de un usuario
   * GET /api/contacts/:userId/followers
   */
  async getFollowers(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };

      const result = await contactService.getFollowers(req.params.userId, options);

      res.status(200).json({
        success: true,
        message: 'Seguidores obtenidos exitosamente',
        data: result.followers,
        meta: {
          total: result.total,
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener seguidores',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuarios que sigue un usuario
   * GET /api/contacts/:userId/following
   */
  async getFollowing(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };

      const result = await contactService.getFollowing(req.params.userId, options);

      res.status(200).json({
        success: true,
        message: 'Usuarios seguidos obtenidos exitosamente',
        data: result.following,
        meta: {
          total: result.total,
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios seguidos',
        error: error.message
      });
    }
  }

  /**
   * Verificar si un usuario sigue a otro
   * GET /api/contacts/check/:followerId/:followeeId
   */
  async isFollowing(req, res) {
    try {
      const { followerId, followeeId } = req.params;
      const result = await contactService.isFollowing(followerId, followeeId);

      res.status(200).json({
        success: true,
        message: 'Verificación realizada exitosamente',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar seguimiento',
        error: error.message
      });
    }
  }

  /**
   * Obtener conteos de seguidores y seguidos
   * GET /api/contacts/:userId/counts
   */
  async getUserCounts(req, res) {
    try {
      const counts = await contactService.getUserCounts(req.params.userId);

      res.status(200).json({
        success: true,
        message: 'Conteos obtenidos exitosamente',
        data: counts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener conteos',
        error: error.message
      });
    }
  }

  /**
   * Obtener seguidores mutuos
   * GET /api/contacts/:userId/mutual
   */
  async getMutualFollows(req, res) {
    try {
      const mutualFollows = await contactService.getMutualFollows(req.params.userId);

      res.status(200).json({
        success: true,
        message: 'Seguidores mutuos obtenidos exitosamente',
        data: mutualFollows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener seguidores mutuos',
        error: error.message
      });
    }
  }

  /**
   * Obtener sugerencias de usuarios
   * GET /api/contacts/:userId/suggestions
   */
  async getSuggestedUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const suggestions = await contactService.getSuggestedUsers(req.params.userId, limit);

      res.status(200).json({
        success: true,
        message: 'Sugerencias obtenidas exitosamente',
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener sugerencias',
        error: error.message
      });
    }
  }

  /**
   * Obtener actividad reciente
   * GET /api/contacts/:userId/activity
   */
  async getRecentActivity(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const activity = await contactService.getRecentActivity(req.params.userId, limit);

      res.status(200).json({
        success: true,
        message: 'Actividad reciente obtenida exitosamente',
        data: activity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener actividad reciente',
        error: error.message
      });
    }
  }

  /**
   * Remover seguidor
   * DELETE /api/contacts/:userId/followers/:followerId
   */
  async removeFollower(req, res) {
    try {
      const { userId, followerId } = req.params;
      const result = await contactService.removeFollower(userId, followerId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al remover seguidor',
        error: error.message
      });
    }
  }
}

module.exports = new ContactController(); 