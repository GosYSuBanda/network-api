const userSearchService = require('../services/user-search.service');

class UserSearchController {

  /**
   * Buscar usuarios
   * GET /api/users/search
   */
  async searchUsers(req, res) {
    try {
      const searchTerm = req.query.q || req.query.search || '';
      const options = {
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0,
        excludeFollowing: req.query.excludeFollowing === 'true',
        onlyFollowing: req.query.onlyFollowing === 'true'
      };

      const requestingUserId = req.user ? req.user.userId : null;
      
      const users = await userSearchService.searchUsers(searchTerm, options, requestingUserId);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: users,
        query: searchTerm,
        pagination: {
          limit: options.limit,
          skip: options.skip,
          hasMore: users.length === options.limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en la búsqueda de usuarios',
        error: error.message
      });
    }
  }

  /**
   * Obtener sugerencias de usuarios para seguir
   * GET /api/users/suggestions
   */
  async getUserSuggestions(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user.userId;
      
      const suggestions = await userSearchService.getUserSuggestions(userId, limit);
      
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
   * Obtener usuarios populares
   * GET /api/users/popular
   */
  async getPopularUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user ? req.user.userId : null;
      
      const users = await userSearchService.getPopularUsers(userId, limit);
      
      res.status(200).json({
        success: true,
        message: 'Usuarios populares obtenidos exitosamente',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios populares',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuarios trending
   * GET /api/users/trending
   */
  async getTrendingUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user ? req.user.userId : null;
      
      const users = await userSearchService.getTrendingUsers(userId, limit);
      
      res.status(200).json({
        success: true,
        message: 'Usuarios trending obtenidos exitosamente',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios trending',
        error: error.message
      });
    }
  }

  /**
   * Descubrir usuarios (combinando diferentes criterios)
   * GET /api/users/discover
   */
  async discoverUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const userId = req.user ? req.user.userId : null;
      
      if (!userId) {
        // Si no está autenticado, devolver usuarios populares
        const users = await userSearchService.getPopularUsers(null, limit);
        return res.status(200).json({
          success: true,
          message: 'Usuarios para descubrir',
          data: users
        });
      }

      // Combinar diferentes tipos de sugerencias
      const [suggestions, popular, trending] = await Promise.all([
        userSearchService.getUserSuggestions(userId, Math.ceil(limit * 0.5)),
        userSearchService.getPopularUsers(userId, Math.ceil(limit * 0.3)),
        userSearchService.getTrendingUsers(userId, Math.ceil(limit * 0.2))
      ]);

      // Combinar y mezclar resultados
      const allUsers = [
        ...suggestions.map(u => ({ ...u, category: 'suggestions' })),
        ...popular.map(u => ({ ...u, category: 'popular' })),
        ...trending.map(u => ({ ...u, category: 'trending' }))
      ];

      // Eliminar duplicados por ID
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u._id.toString() === user._id.toString())
      );

      // Limitar resultados
      const finalUsers = uniqueUsers.slice(0, limit);
      
      res.status(200).json({
        success: true,
        message: 'Usuarios para descubrir obtenidos exitosamente',
        data: finalUsers,
        categories: {
          suggestions: suggestions.length,
          popular: popular.length,
          trending: trending.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al descubrir usuarios',
        error: error.message
      });
    }
  }

  /**
   * Buscar usuarios por ubicación
   * GET /api/users/nearby
   */
  async searchNearbyUsers(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user ? req.user.userId : null;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren coordenadas (lat, lng)'
        });
      }

      const coordinates = [parseFloat(lng), parseFloat(lat)];
      const searchRadius = parseInt(radius) || 50;
      
      const users = await userSearchService.searchUsersByLocation(
        userId, 
        coordinates, 
        searchRadius, 
        limit
      );
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda por ubicación completada',
        data: users,
        searchParams: {
          coordinates,
          radius: searchRadius
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en búsqueda por ubicación',
        error: error.message
      });
    }
  }
}

module.exports = new UserSearchController(); 