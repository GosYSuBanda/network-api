const Invoice = require('../models/invoice.model');

class InvoiceService {
  
  /**
   * Crear una nueva factura
   */
  async createInvoice(invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      
      // Calcular IGV si se proporciona netAmount
      if (invoiceData.netAmount && !invoiceData.igvAmount) {
        invoice.calculateIGV();
      }
      
      await invoice.save();
      return invoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las facturas con paginación
   */
  async getAllInvoices(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'issuedAt',
        sortOrder = 'desc',
        status,
        ruc,
        search
      } = options;

      // Construir query de filtros
      const query = {};
      
      if (status) query.status = status;
      if (ruc) query['company.ruc'] = ruc;
      
      if (search) {
        query.$or = [
          { code: { $regex: search, $options: 'i' } },
          { 'company.name': { $regex: search, $options: 'i' } },
          { 'company.ruc': { $regex: search, $options: 'i' } }
        ];
      }

      // Calcular skip
      const skip = (page - 1) * limit;

      // Construir sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consultas en paralelo
      const [invoices, total] = await Promise.all([
        Invoice.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Invoice.countDocuments(query)
      ]);

      return {
        invoices,
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
   * Obtener factura por ID
   */
  async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }
      return invoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener factura por código
   */
  async getInvoiceByCode(code) {
    try {
      const invoice = await Invoice.findOne({ code: code.toUpperCase() });
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }
      return invoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar factura
   */
  async updateInvoice(invoiceId, updateData) {
    try {
      const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      return invoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar factura
   */
  async deleteInvoice(invoiceId) {
    try {
      const invoice = await Invoice.findByIdAndDelete(invoiceId);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      return { message: 'Factura eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar factura como pagada
   */
  async markAsPaid(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      await invoice.markAsPaid();
      return invoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener facturas por empresa
   */
  async getInvoicesByCompany(ruc) {
    try {
      const invoices = await Invoice.findByCompany(ruc)
        .sort({ issuedAt: -1 });
      return invoices;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de facturas
   */
  async getInvoiceStats() {
    try {
      const stats = await Invoice.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            avgAmount: { $avg: '$total' }
          }
        }
      ]);

      const totalInvoices = await Invoice.countDocuments();
      const totalAmount = await Invoice.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      return {
        totalInvoices,
        totalAmount: totalAmount[0]?.total || 0,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
            avgAmount: Math.round(stat.avgAmount * 100) / 100
          };
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener facturas vencidas
   */
  async getOverdueInvoices() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const overdueInvoices = await Invoice.find({
        status: 'pending',
        issuedAt: { $lt: thirtyDaysAgo }
      }).sort({ issuedAt: 1 });

      // Marcar como vencidas
      await Invoice.updateMany(
        {
          status: 'pending',
          issuedAt: { $lt: thirtyDaysAgo }
        },
        { status: 'overdue' }
      );

      return overdueInvoices;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InvoiceService(); 