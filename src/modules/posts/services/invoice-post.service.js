const Post = require('../models/post.model');
const Invoice = require('../../invoices/models/invoice.model');
const User = require('../../users/models/user.model');
const Contact = require('../../contacts/models/contact.model');

class InvoicePostService {
  
  /**
   * Crear post de factura con información empresarial enriquecida
   */
  async createInvoicePost(postData, userId) {
    try {
      // Validar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Validar que la factura existe
      const invoice = await Invoice.findById(postData.invoiceId);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Enriquecer el post con información de la factura
      const enrichedPostData = {
        ...postData,
        authorId: userId,
        postType: 'invoice',
        title: postData.title || `Factura ${invoice.code}`,
        content: postData.content || this.generateDefaultContent(invoice),
        invoiceId: invoice._id,
        businessInfo: {
          companyName: invoice.company.name,
          companyRuc: invoice.company.ruc,
          invoiceCode: invoice.code,
          invoiceTotal: invoice.total,
          invoiceStatus: invoice.status,
          issuedAt: invoice.issuedAt,
          paidAt: invoice.paidAt
        },
        tags: this.generateTags(invoice),
        category: this.getInvoiceCategory(invoice)
      };

      const post = new Post(enrichedPostData);
      await post.save();
      
      // Popular referencias antes de devolver
      await post.populateReferences();
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener posts de facturas con filtros empresariales
   */
  async getInvoicePosts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyRuc,
        invoiceStatus,
        amountRange,
        dateRange,
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Construir query de filtros
      const query = { postType: 'invoice' };
      
      if (companyRuc) query['businessInfo.companyRuc'] = companyRuc;
      if (invoiceStatus) query['businessInfo.invoiceStatus'] = invoiceStatus;
      if (category) query.category = category;
      
      // Filtro por rango de monto
      if (amountRange) {
        query['businessInfo.invoiceTotal'] = {};
        if (amountRange.min !== undefined) query['businessInfo.invoiceTotal'].$gte = amountRange.min;
        if (amountRange.max !== undefined) query['businessInfo.invoiceTotal'].$lte = amountRange.max;
      }
      
      // Filtro por rango de fechas
      if (dateRange) {
        query['businessInfo.issuedAt'] = {};
        if (dateRange.start) query['businessInfo.issuedAt'].$gte = new Date(dateRange.start);
        if (dateRange.end) query['businessInfo.issuedAt'].$lte = new Date(dateRange.end);
      }

      // Calcular skip
      const skip = (page - 1) * limit;

      // Construir sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consultas en paralelo
      const [posts, total] = await Promise.all([
        Post.find(query)
          .populate('authorId', 'firstName lastName email')
          .populate('invoiceId')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Post.countDocuments(query)
      ]);

      return {
        posts,
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
   * Obtener estadísticas de posts de facturas
   */
  async getInvoicePostStats(companyRuc = null) {
    try {
      const matchQuery = { postType: 'invoice' };
      if (companyRuc) matchQuery['businessInfo.companyRuc'] = companyRuc;

      const stats = await Post.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalAmount: { $sum: '$businessInfo.invoiceTotal' },
            avgAmount: { $avg: '$businessInfo.invoiceTotal' },
            maxAmount: { $max: '$businessInfo.invoiceTotal' },
            minAmount: { $min: '$businessInfo.invoiceTotal' },
            totalEngagement: { 
              $sum: { 
                $add: [
                  { $size: '$reactions' },
                  { $size: '$comments' }
                ]
              }
            },
            avgEngagement: { 
              $avg: { 
                $add: [
                  { $size: '$reactions' },
                  { $size: '$comments' }
                ]
              }
            }
          }
        }
      ]);

      // Estadísticas por estado
      const statusStats = await Post.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$businessInfo.invoiceStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$businessInfo.invoiceTotal' }
          }
        }
      ]);

      // Estadísticas por categoría
      const categoryStats = await Post.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalAmount: { $sum: '$businessInfo.invoiceTotal' }
          }
        }
      ]);

      // Estadísticas por mes
      const monthlyStats = await Post.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$businessInfo.issuedAt' },
              month: { $month: '$businessInfo.issuedAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$businessInfo.invoiceTotal' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      return {
        general: stats[0] || {
          totalPosts: 0,
          totalAmount: 0,
          avgAmount: 0,
          maxAmount: 0,
          minAmount: 0,
          totalEngagement: 0,
          avgEngagement: 0
        },
        byStatus: statusStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
          return acc;
        }, {}),
        byCategory: categoryStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
          return acc;
        }, {}),
        monthly: monthlyStats.map(stat => ({
          year: stat._id.year,
          month: stat._id.month,
          count: stat.count,
          totalAmount: stat.totalAmount
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar posts de facturas por empresa
   */
  async getPostsByCompany(companyRuc, options = {}) {
    try {
      const posts = await Post.find({
        postType: 'invoice',
        'businessInfo.companyRuc': companyRuc
      })
      .populate('authorId', 'firstName lastName email')
      .populate('invoiceId')
      .sort({ createdAt: -1 })
      .limit(options.limit || 20);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener posts de facturas por rango de fechas
   */
  async getPostsByDateRange(startDate, endDate, options = {}) {
    try {
      const posts = await Post.find({
        postType: 'invoice',
        'businessInfo.issuedAt': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .populate('authorId', 'firstName lastName email')
      .populate('invoiceId')
      .sort({ 'businessInfo.issuedAt': -1 })
      .limit(options.limit || 50);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener posts de facturas trending (mayor engagement)
   */
  async getTrendingInvoicePosts(options = {}) {
    try {
      const posts = await Post.aggregate([
        { $match: { postType: 'invoice' } },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $size: '$reactions' },
                { $multiply: [{ $size: '$comments' }, 2] }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1, createdAt: -1 } },
        { $limit: options.limit || 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $lookup: {
            from: 'invoices',
            localField: 'invoiceId',
            foreignField: '_id',
            as: 'invoice'
          }
        },
        {
          $addFields: {
            authorId: { $arrayElemAt: ['$author', 0] },
            invoiceId: { $arrayElemAt: ['$invoice', 0] }
          }
        },
        {
          $unset: ['author', 'invoice']
        }
      ]);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar contenido por defecto para post de factura
   */
  generateDefaultContent(invoice) {
    const statusText = {
      pending: 'pendiente de pago',
      paid: 'pagada',
      overdue: 'vencida',
      cancelled: 'cancelada'
    };

    return `Factura ${invoice.code} por un total de S/.${invoice.total.toFixed(2)} - Estado: ${statusText[invoice.status] || invoice.status}. 
    Emitida por ${invoice.company.name} el ${invoice.issuedAt.toLocaleDateString('es-PE')}.`;
  }

  /**
   * Generar tags automáticos para post de factura
   */
  generateTags(invoice) {
    const tags = ['factura', 'empresa', invoice.status];
    
    // Agregar tags basados en el monto
    if (invoice.total > 10000) tags.push('alto-valor');
    if (invoice.total < 1000) tags.push('bajo-valor');
    
    // Agregar tags basados en el estado
    if (invoice.status === 'paid') tags.push('pagada');
    if (invoice.status === 'overdue') tags.push('vencida');
    
    return tags;
  }

  /**
   * Obtener categoría de factura
   */
  getInvoiceCategory(invoice) {
    // Categorizar basado en el monto
    if (invoice.total > 50000) return 'alto-valor';
    if (invoice.total > 10000) return 'medio-valor';
    return 'bajo-valor';
  }

  /**
   * Actualizar estado de post cuando cambia la factura
   */
  async updatePostOnInvoiceChange(invoiceId, newStatus) {
    try {
      const posts = await Post.find({
        postType: 'invoice',
        invoiceId: invoiceId
      });

      for (const post of posts) {
        post.businessInfo.invoiceStatus = newStatus;
        if (newStatus === 'paid') {
          post.businessInfo.paidAt = new Date();
        }
        await post.save();
      }

      return posts.length;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InvoicePostService(); 