const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Configuración de la conversación
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    // Solo para conversaciones grupales
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    // Solo para conversaciones grupales
    adminOnly: {
      type: Boolean,
      default: false
    }
  },
  // Administradores (solo para grupos)
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Metadatos de los participantes
  participantData: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  collection: 'conversations'
});

// Índices
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ 'participantData.userId': 1 });

// Validación: conversaciones privadas solo pueden tener 2 participantes
conversationSchema.pre('save', function(next) {
  if (this.type === 'private' && this.participants.length !== 2) {
    next(new Error('Las conversaciones privadas deben tener exactamente 2 participantes'));
  }
  next();
});

// Método para obtener el otro participante en conversaciones privadas
conversationSchema.methods.getOtherParticipant = function(userId) {
  if (this.type !== 'private') {
    throw new Error('Este método solo es válido para conversaciones privadas');
  }
  return this.participants.find(p => !p.equals(userId));
};

// Método para verificar si un usuario es participante
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.equals(userId));
};

// Método para verificar si un usuario es admin (solo grupos)
conversationSchema.methods.isAdmin = function(userId) {
  if (this.type !== 'group') return false;
  return this.admins.some(a => a.equals(userId));
};

// Método para actualizar última actividad
conversationSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Método para incrementar contador de no leídos
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const participantData = this.participantData.find(p => p.userId.equals(userId));
  if (participantData) {
    participantData.unreadCount += 1;
  }
  return this.save();
};

// Método para marcar como leído
conversationSchema.methods.markAsRead = function(userId) {
  const participantData = this.participantData.find(p => p.userId.equals(userId));
  if (participantData) {
    participantData.unreadCount = 0;
    participantData.lastSeen = new Date();
  }
  return this.save();
};

// Método para agregar participante (solo grupos)
conversationSchema.methods.addParticipant = function(userId, addedBy) {
  if (this.type !== 'group') {
    throw new Error('Solo se pueden agregar participantes a conversaciones grupales');
  }
  
  if (this.isParticipant(userId)) {
    throw new Error('El usuario ya es participante de la conversación');
  }
  
  this.participants.push(userId);
  this.participantData.push({
    userId: userId,
    joinedAt: new Date(),
    lastSeen: new Date(),
    unreadCount: 0
  });
  
  return this.save();
};

// Método para remover participante (solo grupos)
conversationSchema.methods.removeParticipant = function(userId, removedBy) {
  if (this.type !== 'group') {
    throw new Error('Solo se pueden remover participantes de conversaciones grupales');
  }
  
  if (!this.isParticipant(userId)) {
    throw new Error('El usuario no es participante de la conversación');
  }
  
  this.participants = this.participants.filter(p => !p.equals(userId));
  this.participantData = this.participantData.filter(p => !p.userId.equals(userId));
  this.admins = this.admins.filter(a => !a.equals(userId));
  
  return this.save();
};

// Método estático para encontrar conversación entre dos usuarios
conversationSchema.statics.findPrivateConversation = function(userId1, userId2) {
  return this.findOne({
    type: 'private',
    participants: { $all: [userId1, userId2] }
  });
};

// Método estático para obtener conversaciones de un usuario
conversationSchema.statics.findUserConversations = function(userId, options = {}) {
  const query = {
    participants: userId,
    isActive: true
  };
  
  return this.find(query)
    .populate('participants', 'firstName lastName email')
    .populate('lastMessage')
    .sort({ lastActivity: -1 })
    .limit(options.limit || 50);
};

module.exports = mongoose.model('Conversation', conversationSchema); 