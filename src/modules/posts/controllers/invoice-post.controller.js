const invoicePostService = require('../services/invoice-post.service');

class InvoicePostController {
  
  /**
   * Crear post de factura empresarial
   * POST /api/posts/invoice
   */
  async createInvoicePost(req, res) {
    try {
      const userId = req.user.userId;
      const postData = req.body;

      // Agregar archivos multimedia si fueron subidos
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        postData.media = req.uploadedFiles;
      }

      const post = await invoicePostService.createInvoicePost(postData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Post de factura creado exitosamente',
        data: post,
        filesUploaded: req.uploadedFiles ? req.uploadedFiles.length : 0
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear post de factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener posts de facturas con filtros empresariales
   * GET /api/posts/invoice
   */
  async getInvoicePosts(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        companyRuc: req.query.companyRuc,
        invoiceStatus: req.query.invoiceStatus,
        category: req.query.category,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      // Filtro por rango de monto
      if (req.query.minAmount || req.query.maxAmount) {
        options.amountRange = {};
        if (req.query.minAmount) options.amountRange.min = parseFloat(req.query.minAmount);
        if (req.query.maxAmount) options.amountRange.max = parseFloat(req.query.maxAmount);
      }

      // Filtro por rango de fechas
      if (req.query.startDate || req.query.endDate) {
        options.dateRange = {};
        if (req.query.startDate) options.dateRange.start = req.query.startDate;
        if (req.query.endDate) options.dateRange.end = req.query.endDate;
      }

      const result = await invoicePostService.getInvoicePosts(options);

      res.status(200).json({
        success: true,
        message: 'Posts de facturas obtenidos exitosamente',
        data: result.posts,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts de facturas',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de posts de facturas
   * GET /api/posts/invoice/stats
   */
  async getInvoicePostStats(req, res) {
    try {
      const companyRuc = req.query.companyRuc;
      const stats = await invoicePostService.getInvoicePostStats(companyRuc);

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
   * Obtener posts de facturas por empresa
   * GET /api/posts/invoice/company/:ruc
   */
  async getPostsByCompany(req, res) {
    try {
      const companyRuc = req.params.ruc;
      const options = {
        limit: parseInt(req.query.limit) || 20
      };

      const posts = await invoicePostService.getPostsByCompany(companyRuc, options);

      res.status(200).json({
        success: true,
        message: 'Posts de empresa obtenidos exitosamente',
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts de empresa',
        error: error.message
      });
    }
  }

  /**
   * Obtener posts de facturas por rango de fechas
   * GET /api/posts/invoice/date-range
   */
  async getPostsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren startDate y endDate'
        });
      }

      const options = {
        limit: parseInt(req.query.limit) || 50
      };

      const posts = await invoicePostService.getPostsByDateRange(startDate, endDate, options);

      res.status(200).json({
        success: true,
        message: 'Posts por rango de fechas obtenidos exitosamente',
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts por rango de fechas',
        error: error.message
      });
    }
  }

  /**
   * Obtener posts de facturas trending
   * GET /api/posts/invoice/trending
   */
  async getTrendingInvoicePosts(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 10
      };

      const posts = await invoicePostService.getTrendingInvoicePosts(options);

      res.status(200).json({
        success: true,
        message: 'Posts de facturas trending obtenidos exitosamente',
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts trending',
        error: error.message
      });
    }
  }

  /**
   * Actualizar estado de posts cuando cambia una factura
   * PUT /api/posts/invoice/update-status
   */
  async updatePostsOnInvoiceChange(req, res) {
    try {
      const { invoiceId, newStatus } = req.body;
      
      if (!invoiceId || !newStatus) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren invoiceId y newStatus'
        });
      }

      const updatedCount = await invoicePostService.updatePostOnInvoiceChange(invoiceId, newStatus);

      res.status(200).json({
        success: true,
        message: `${updatedCount} posts actualizados exitosamente`,
        data: { updatedCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar posts',
        error: error.message
      });
    }
  }
}

module.exports = new InvoicePostController(); 