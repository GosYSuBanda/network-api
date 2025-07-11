const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../../users/models/user.model');

class MessageService {
  
  /**
   * Iniciar conversación privada entre dos usuarios
   */
  async startPrivateConversation(userId1, userId2) {
    try {
      // Verificar que ambos usuarios existen
      const [user1, user2] = await Promise.all([
        User.findById(userId1),
        User.findById(userId2)
      ]);
      
      if (!user1 || !user2) {
        throw new Error('Usuario no encontrado');
      }
      
      if (userId1 === userId2) {
        throw new Error('No puedes iniciar una conversación contigo mismo');
      }
      
      // Verificar si ya existe una conversación
      let conversation = await Conversation.findPrivateConversation(userId1, userId2);
      
      if (conversation) {
        // Si existe pero está inactiva, reactivarla
        if (!conversation.isActive) {
          conversation.isActive = true;
          await conversation.save();
        }
        return conversation;
      }
      
      // Crear nueva conversación
      conversation = new Conversation({
        participants: [userId1, userId2],
        type: 'private',
        participantData: [
          { userId: userId1, joinedAt: new Date(), lastSeen: new Date() },
          { userId: userId2, joinedAt: new Date(), lastSeen: new Date() }
        ]
      });
      
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName email');
      
      return conversation;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(conversationId, senderId, messageData) {
    try {
      // Verificar que la conversación existe
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      // Verificar que el usuario es participante
      if (!conversation.isParticipant(senderId)) {
        throw new Error('No tienes permisos para enviar mensajes en esta conversación');
      }
      
      // Crear mensaje
      const message = new Message({
        conversation: conversationId,
        sender: senderId,
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        replyTo: messageData.replyTo || null,
        metadata: messageData.metadata || {}
      });
      
      await message.save();
      
      // Actualizar conversación
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      
      // Incrementar contador de no leídos para otros participantes
      conversation.participantData.forEach(participant => {
        if (!participant.userId.equals(senderId)) {
          participant.unreadCount += 1;
        }
      });
      
      await conversation.save();
      
      // Popular mensaje antes de retornar
      await message.populate('sender', 'firstName lastName email');
      await message.populate('replyTo', 'content sender');
      
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener conversaciones de un usuario
   */
  async getUserConversations(userId, options = {}) {
    try {
      const conversations = await Conversation.findUserConversations(userId, options);
      
      // Obtener información adicional para cada conversación
      const enrichedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          const conversationObj = conversation.toObject();
          
          // Obtener datos del participante actual
          const participantData = conversation.participantData.find(p => p.userId.equals(userId));
          if (participantData) {
            conversationObj.unreadCount = participantData.unreadCount;
            conversationObj.lastSeen = participantData.lastSeen;
            conversationObj.isMuted = participantData.isMuted;
          }
          
          // Para conversaciones privadas, obtener info del otro usuario
          if (conversation.type === 'private') {
            const otherParticipant = conversation.participants.find(p => !p._id.equals(userId));
            conversationObj.otherUser = otherParticipant;
          }
          
          return conversationObj;
        })
      );
      
      return enrichedConversations;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getConversationMessages(conversationId, userId, options = {}) {
    try {
      // Verificar que la conversación existe y el usuario es participante
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      if (!conversation.isParticipant(userId)) {
        throw new Error('No tienes permisos para ver esta conversación');
      }
      
      // Obtener mensajes
      const messages = await Message.getConversationMessages(conversationId, options);
      
      return messages;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(conversationId, userId) {
    try {
      // Verificar que la conversación existe
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      if (!conversation.isParticipant(userId)) {
        throw new Error('No tienes permisos para esta conversación');
      }
      
      // Marcar mensajes como leídos
      const unreadMessages = await Message.find({
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
        isDeleted: false
      });
      
      await Promise.all(
        unreadMessages.map(message => message.markAsRead(userId))
      );
      
      // Actualizar conversación
      await conversation.markAsRead(userId);
      
      return { markedCount: unreadMessages.length };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar mensajes en una conversación
   */
  async searchMessages(conversationId, userId, searchTerm, options = {}) {
    try {
      // Verificar permisos
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      if (!conversation.isParticipant(userId)) {
        throw new Error('No tienes permisos para buscar en esta conversación');
      }
      
      const messages = await Message.searchMessages(conversationId, searchTerm, options);
      
      return messages;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener mensajes no leídos de un usuario
   */
  async getUnreadMessages(userId, conversationId = null) {
    try {
      const messages = await Message.getUnreadMessages(userId, conversationId);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar mensajes no leídos
   */
  async countUnreadMessages(userId, conversationId = null) {
    try {
      const count = await Message.countUnreadMessages(userId, conversationId);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Editar mensaje
   */
  async editMessage(messageId, userId, newContent) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Mensaje no encontrado');
      }
      
      // Solo el remitente puede editar su mensaje
      if (!message.sender.equals(userId)) {
        throw new Error('No tienes permisos para editar este mensaje');
      }
      
      // No se pueden editar mensajes eliminados
      if (message.isDeleted) {
        throw new Error('No se puede editar un mensaje eliminado');
      }
      
      await message.edit(newContent);
      
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar mensaje
   */
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Mensaje no encontrado');
      }
      
      // Solo el remitente puede eliminar su mensaje
      if (!message.sender.equals(userId)) {
        throw new Error('No tienes permisos para eliminar este mensaje');
      }
      
      await message.delete(userId);
      
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agregar reacción a mensaje
   */
  async addReaction(messageId, userId, emoji) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Mensaje no encontrado');
      }
      
      // Verificar que el usuario es participante de la conversación
      const conversation = await Conversation.findById(message.conversation);
      if (!conversation.isParticipant(userId)) {
        throw new Error('No tienes permisos para reaccionar a este mensaje');
      }
      
      await message.addReaction(userId, emoji);
      
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover reacción de mensaje
   */
  async removeReaction(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Mensaje no encontrado');
      }
      
      await message.removeReaction(userId);
      
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de mensajería de un usuario
   */
  async getUserMessageStats(userId) {
    try {
      const [
        totalConversations,
        totalMessages,
        unreadCount,
        recentActivity
      ] = await Promise.all([
        Conversation.countDocuments({ participants: userId, isActive: true }),
        Message.countDocuments({ sender: userId, isDeleted: false }),
        Message.countUnreadMessages(userId),
        Message.find({ sender: userId, isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('conversation', 'participants type title')
      ]);
      
      return {
        totalConversations,
        totalMessages,
        unreadCount,
        recentActivity
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Silenciar/Desilenciar conversación
   */
  async toggleMuteConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      if (!conversation.isParticipant(userId)) {
        throw new Error('No tienes permisos para esta conversación');
      }
      
      const participantData = conversation.participantData.find(p => p.userId.equals(userId));
      if (participantData) {
        participantData.isMuted = !participantData.isMuted;
        await conversation.save();
      }
      
      return { isMuted: participantData.isMuted };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear conversación grupal
   */
  async createGroupConversation(creatorId, participantIds, title, description = '') {
    try {
      // Verificar que todos los participantes existen
      const participants = await User.find({ _id: { $in: participantIds } });
      if (participants.length !== participantIds.length) {
        throw new Error('Algunos usuarios no fueron encontrados');
      }
      
      // Asegurar que el creador esté en la lista de participantes
      const allParticipants = [...new Set([creatorId, ...participantIds])];
      
      // Crear conversación grupal
      const conversation = new Conversation({
        participants: allParticipants,
        type: 'group',
        title: title,
        description: description,
        admins: [creatorId],
        participantData: allParticipants.map(id => ({
          userId: id,
          joinedAt: new Date(),
          lastSeen: new Date()
        }))
      });
      
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName email');
      
      return conversation;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MessageService(); 