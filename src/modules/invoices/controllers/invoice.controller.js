const invoiceService = require('../services/invoice.service');

class InvoiceController {

  /**
   * Crear nueva factura
   * POST /api/invoices
   */
  async createInvoice(req, res) {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Factura creada exitosamente',
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las facturas
   * GET /api/invoices
   */
  async getAllInvoices(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        status: req.query.status,
        ruc: req.query.ruc,
        search: req.query.search
      };

      const result = await invoiceService.getAllInvoices(options);

      res.status(200).json({
        success: true,
        message: 'Facturas obtenidas exitosamente',
        data: result.invoices,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener facturas',
        error: error.message
      });
    }
  }

  /**
   * Obtener factura por ID
   * GET /api/invoices/:id
   */
  async getInvoiceById(req, res) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Factura obtenida exitosamente',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener factura por código
   * GET /api/invoices/code/:code
   */
  async getInvoiceByCode(req, res) {
    try {
      const invoice = await invoiceService.getInvoiceByCode(req.params.code);

      res.status(200).json({
        success: true,
        message: 'Factura obtenida exitosamente',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener factura',
        error: error.message
      });
    }
  }

  /**
   * Actualizar factura
   * PUT /api/invoices/:id
   */
  async updateInvoice(req, res) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Factura actualizada exitosamente',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al actualizar factura',
        error: error.message
      });
    }
  }

  /**
   * Eliminar factura
   * DELETE /api/invoices/:id
   */
  async deleteInvoice(req, res) {
    try {
      const result = await invoiceService.deleteInvoice(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar factura',
        error: error.message
      });
    }
  }

  /**
   * Marcar factura como pagada
   * PATCH /api/invoices/:id/pay
   */
  async markAsPaid(req, res) {
    try {
      const invoice = await invoiceService.markAsPaid(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Factura marcada como pagada',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al marcar factura como pagada',
        error: error.message
      });
    }
  }

  /**
   * Obtener facturas por empresa
   * GET /api/invoices/company/:ruc
   */
  async getInvoicesByCompany(req, res) {
    try {
      const invoices = await invoiceService.getInvoicesByCompany(req.params.ruc);

      res.status(200).json({
        success: true,
        message: 'Facturas de empresa obtenidas exitosamente',
        data: invoices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener facturas de empresa',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas
   * GET /api/invoices/stats
   */
  async getInvoiceStats(req, res) {
    try {
      const stats = await invoiceService.getInvoiceStats();

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
   * Obtener facturas vencidas
   * GET /api/invoices/overdue
   */
  async getOverdueInvoices(req, res) {
    try {
      const invoices = await invoiceService.getOverdueInvoices();

      res.status(200).json({
        success: true,
        message: 'Facturas vencidas obtenidas exitosamente',
        data: invoices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener facturas vencidas',
        error: error.message
      });
    }
  }
}

module.exports = new InvoiceController(); 