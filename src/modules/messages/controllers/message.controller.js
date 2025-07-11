const messageService = require('../services/message.service');

class MessageController {
  
  /**
   * Iniciar conversación privada
   * POST /api/messages/conversations/private
   */
  async startPrivateConversation(req, res) {
    try {
      const userId = req.user.userId;
      const { recipientId } = req.body;
      
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del destinatario es requerido'
        });
      }
      
      const conversation = await messageService.startPrivateConversation(userId, recipientId);
      
      res.status(201).json({
        success: true,
        message: 'Conversación iniciada exitosamente',
        data: conversation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al iniciar conversación',
        error: error.message
      });
    }
  }

  /**
   * Crear conversación grupal
   * POST /api/messages/conversations/group
   */
  async createGroupConversation(req, res) {
    try {
      const userId = req.user.userId;
      const { participantIds, title, description } = req.body;
      
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere una lista de participantes'
        });
      }
      
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El título del grupo es requerido'
        });
      }
      
      const conversation = await messageService.createGroupConversation(
        userId, participantIds, title, description
      );
      
      res.status(201).json({
        success: true,
        message: 'Conversación grupal creada exitosamente',
        data: conversation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear conversación grupal',
        error: error.message
      });
    }
  }

  /**
   * Obtener conversaciones del usuario
   * GET /api/messages/conversations
   */
  async getUserConversations(req, res) {
    try {
      const userId = req.user.userId;
      const options = {
        limit: parseInt(req.query.limit) || 50
      };
      
      const conversations = await messageService.getUserConversations(userId, options);
      
      res.status(200).json({
        success: true,
        message: 'Conversaciones obtenidas exitosamente',
        data: conversations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener conversaciones',
        error: error.message
      });
    }
  }

  /**
   * Obtener mensajes de una conversación
   * GET /api/messages/conversations/:id/messages
   */
  async getConversationMessages(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sortOrder: req.query.sortOrder || 'desc'
      };
      
      const messages = await messageService.getConversationMessages(conversationId, userId, options);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes obtenidos exitosamente',
        data: messages,
        pagination: {
          limit: options.limit,
          skip: options.skip,
          hasMore: messages.length === options.limit
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 
                        error.message.includes('permisos') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al obtener mensajes',
        error: error.message
      });
    }
  }

  /**
   * Enviar mensaje
   * POST /api/messages/conversations/:id/messages
   */
  async sendMessage(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      const messageData = req.body;
      
      // Agregar archivos adjuntos si fueron subidos
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        messageData.attachments = req.uploadedFiles;
        messageData.type = 'file';
      }
      
      const message = await messageService.sendMessage(conversationId, userId, messageData);
      
      res.status(201).json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: message,
        filesUploaded: req.uploadedFiles ? req.uploadedFiles.length : 0
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al enviar mensaje',
        error: error.message
      });
    }
  }

  /**
   * Marcar mensajes como leídos
   * PUT /api/messages/conversations/:id/read
   */
  async markMessagesAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      
      const result = await messageService.markMessagesAsRead(conversationId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes marcados como leídos',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 
                        error.message.includes('permisos') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al marcar mensajes como leídos',
        error: error.message
      });
    }
  }

  /**
   * Buscar mensajes
   * GET /api/messages/conversations/:id/search
   */
  async searchMessages(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      const searchTerm = req.query.q;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda es requerido'
        });
      }
      
      const options = {
        limit: parseInt(req.query.limit) || 20
      };
      
      const messages = await messageService.searchMessages(conversationId, userId, searchTerm, options);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: messages,
        searchTerm: searchTerm
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 
                        error.message.includes('permisos') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al buscar mensajes',
        error: error.message
      });
    }
  }

  /**
   * Obtener mensajes no leídos
   * GET /api/messages/unread
   */
  async getUnreadMessages(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.query.conversationId;
      
      const messages = await messageService.getUnreadMessages(userId, conversationId);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes no leídos obtenidos exitosamente',
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener mensajes no leídos',
        error: error.message
      });
    }
  }

  /**
   * Contar mensajes no leídos
   * GET /api/messages/unread/count
   */
  async countUnreadMessages(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.query.conversationId;
      
      const count = await messageService.countUnreadMessages(userId, conversationId);
      
      res.status(200).json({
        success: true,
        message: 'Conteo obtenido exitosamente',
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al contar mensajes no leídos',
        error: error.message
      });
    }
  }

  /**
   * Editar mensaje
   * PUT /api/messages/:id
   */
  async editMessage(req, res) {
    try {
      const userId = req.user.userId;
      const messageId = req.params.id;
      const { content } = req.body;
      
      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El contenido del mensaje es requerido'
        });
      }
      
      const message = await messageService.editMessage(messageId, userId, content);
      
      res.status(200).json({
        success: true,
        message: 'Mensaje editado exitosamente',
        data: message
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al editar mensaje',
        error: error.message
      });
    }
  }

  /**
   * Eliminar mensaje
   * DELETE /api/messages/:id
   */
  async deleteMessage(req, res) {
    try {
      const userId = req.user.userId;
      const messageId = req.params.id;
      
      const message = await messageService.deleteMessage(messageId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Mensaje eliminado exitosamente',
        data: message
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al eliminar mensaje',
        error: error.message
      });
    }
  }

  /**
   * Agregar reacción a mensaje
   * POST /api/messages/:id/reactions
   */
  async addReaction(req, res) {
    try {
      const userId = req.user.userId;
      const messageId = req.params.id;
      const { emoji } = req.body;
      
      if (!emoji) {
        return res.status(400).json({
          success: false,
          message: 'El emoji es requerido'
        });
      }
      
      const message = await messageService.addReaction(messageId, userId, emoji);
      
      res.status(200).json({
        success: true,
        message: 'Reacción agregada exitosamente',
        data: message
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 
                        error.message.includes('permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al agregar reacción',
        error: error.message
      });
    }
  }

  /**
   * Remover reacción de mensaje
   * DELETE /api/messages/:id/reactions
   */
  async removeReaction(req, res) {
    try {
      const userId = req.user.userId;
      const messageId = req.params.id;
      
      const message = await messageService.removeReaction(messageId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Reacción removida exitosamente',
        data: message
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: 'Error al remover reacción',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de mensajería
   * GET /api/messages/stats
   */
  async getUserMessageStats(req, res) {
    try {
      const userId = req.user.userId;
      
      const stats = await messageService.getUserMessageStats(userId);
      
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
   * Silenciar/Desilenciar conversación
   * PUT /api/messages/conversations/:id/mute
   */
  async toggleMuteConversation(req, res) {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      
      const result = await messageService.toggleMuteConversation(conversationId, userId);
      
      res.status(200).json({
        success: true,
        message: result.isMuted ? 'Conversación silenciada' : 'Conversación desilenciada',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 
                        error.message.includes('permisos') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Error al cambiar estado de silenciado',
        error: error.message
      });
    }
  }
}

module.exports = new MessageController(); 