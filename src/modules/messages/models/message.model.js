const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'El mensaje no puede exceder 2000 caracteres']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'system'],
    default: 'text'
  },
  // Archivos adjuntos
  attachments: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number }, // Para audio/video
    format: { type: String },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Mensaje al que se está respondiendo
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Estado del mensaje
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  // Información de entrega
  deliveryInfo: {
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    readAt: { type: Date }
  },
  // Usuarios que han leído el mensaje
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Reacciones al mensaje
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Mensaje editado
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Mensaje eliminado
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Metadata adicional
  metadata: {
    // Para mensajes de ubicación
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String }
    },
    // Para mensajes del sistema
    systemType: {
      type: String,
      enum: ['user_joined', 'user_left', 'user_added', 'user_removed', 'title_changed', 'settings_changed']
    },
    // Menciones de usuarios
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Índices
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ isDeleted: 1 });

// Virtual para obtener el número de reacciones
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual para obtener el número de usuarios que han leído
messageSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Método para marcar como leído por un usuario
messageSchema.methods.markAsRead = function(userId) {
  // Verificar si ya está marcado como leído
  const alreadyRead = this.readBy.find(r => r.user.equals(userId));
  if (alreadyRead) {
    return this;
  }
  
  this.readBy.push({
    user: userId,
    readAt: new Date()
  });
  
  // Actualizar estado general si es necesario
  if (this.status === 'delivered' || this.status === 'sent') {
    this.status = 'read';
    this.deliveryInfo.readAt = new Date();
  }
  
  return this.save();
};

// Método para agregar reacción
messageSchema.methods.addReaction = function(userId, emoji) {
  // Verificar si el usuario ya reaccionó
  const existingReaction = this.reactions.find(r => r.user.equals(userId));
  
  if (existingReaction) {
    // Actualizar emoji si es diferente
    if (existingReaction.emoji !== emoji) {
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    }
  } else {
    // Agregar nueva reacción
    this.reactions.push({
      user: userId,
      emoji: emoji
    });
  }
  
  return this.save();
};

// Método para remover reacción
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => !r.user.equals(userId));
  return this.save();
};

// Método para editar mensaje
messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Método para eliminar mensaje
messageSchema.methods.delete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.content = 'Mensaje eliminado';
  return this.save();
};

// Método para verificar si un usuario puede ver el mensaje
messageSchema.methods.canUserView = function(userId) {
  // Los mensajes eliminados solo pueden ser vistos por quien los eliminó
  if (this.isDeleted && !this.deletedBy.equals(userId)) {
    return false;
  }
  return true;
};

// Método estático para obtener mensajes de una conversación
messageSchema.statics.getConversationMessages = function(conversationId, options = {}) {
  const query = {
    conversation: conversationId,
    isDeleted: false
  };
  
  return this.find(query)
    .populate('sender', 'firstName lastName email')
    .populate('replyTo', 'content sender')
    .populate('readBy.user', 'firstName lastName')
    .populate('reactions.user', 'firstName lastName')
    .sort({ createdAt: options.sortOrder === 'asc' ? 1 : -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Método estático para obtener mensajes no leídos
messageSchema.statics.getUnreadMessages = function(userId, conversationId = null) {
  const query = {
    'readBy.user': { $ne: userId },
    sender: { $ne: userId },
    isDeleted: false
  };
  
  if (conversationId) {
    query.conversation = conversationId;
  }
  
  return this.find(query)
    .populate('sender', 'firstName lastName email')
    .populate('conversation', 'participants type title')
    .sort({ createdAt: -1 });
};

// Método estático para contar mensajes no leídos
messageSchema.statics.countUnreadMessages = function(userId, conversationId = null) {
  const query = {
    'readBy.user': { $ne: userId },
    sender: { $ne: userId },
    isDeleted: false
  };
  
  if (conversationId) {
    query.conversation = conversationId;
  }
  
  return this.countDocuments(query);
};

// Método estático para buscar mensajes
messageSchema.statics.searchMessages = function(conversationId, searchTerm, options = {}) {
  const query = {
    conversation: conversationId,
    content: { $regex: searchTerm, $options: 'i' },
    isDeleted: false
  };
  
  return this.find(query)
    .populate('sender', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

module.exports = mongoose.model('Message', messageSchema); 