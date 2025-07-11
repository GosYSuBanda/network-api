const userMetricsService = require('../services/user-metrics.service');

class UserMetricsController {
  
  /**
   * Obtener métricas completas de un usuario
   * GET /api/users/:id/metrics
   */
  async getUserMetrics(req, res) {
    try {
      const userId = req.params.id;
      const metrics = await userMetricsService.getUserMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas obtenidas exitosamente',
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas propias del usuario autenticado
   * GET /api/users/me/metrics
   */
  async getMyMetrics(req, res) {
    try {
      const userId = req.user.userId;
      const metrics = await userMetricsService.getUserMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas obtenidas exitosamente',
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas',
        error: error.message
      });
    }
  }

  /**
   * Obtener resumen de métricas para perfil
   * GET /api/users/:id/metrics/summary
   */
  async getProfileSummary(req, res) {
    try {
      const userId = req.params.id;
      const summary = await userMetricsService.getProfileSummary(userId);

      res.status(200).json({
        success: true,
        message: 'Resumen obtenido exitosamente',
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas básicas de un usuario
   * GET /api/users/:id/metrics/basic
   */
  async getBasicMetrics(req, res) {
    try {
      const userId = req.params.id;
      const basicMetrics = await userMetricsService.getBasicMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas básicas obtenidas exitosamente',
        data: basicMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas básicas',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas de engagement
   * GET /api/users/:id/metrics/engagement
   */
  async getEngagementMetrics(req, res) {
    try {
      const userId = req.params.id;
      const engagementMetrics = await userMetricsService.getEngagementMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas de engagement obtenidas exitosamente',
        data: engagementMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de engagement',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas sociales
   * GET /api/users/:id/metrics/social
   */
  async getSocialMetrics(req, res) {
    try {
      const userId = req.params.id;
      const socialMetrics = await userMetricsService.getSocialMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas sociales obtenidas exitosamente',
        data: socialMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas sociales',
        error: error.message
      });
    }
  }

  /**
   * Obtener métricas de actividad
   * GET /api/users/:id/metrics/activity
   */
  async getActivityMetrics(req, res) {
    try {
      const userId = req.params.id;
      const activityMetrics = await userMetricsService.getActivityMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'Métricas de actividad obtenidas exitosamente',
        data: activityMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de actividad',
        error: error.message
      });
    }
  }
}

module.exports = new UserMetricsController(); 