const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'El post es requerido']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El remitente es requerido']
  },
  sentAt: {
    type: Date,
    required: [true, 'La fecha de envío es requerida'],
    default: Date.now
  },
  message: {
    type: String,
    trim: true,
    maxlength: [250, 'El mensaje no puede exceder 250 caracteres']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'friendRequests'
});

// Índices
friendRequestSchema.index({ postId: 1 });
friendRequestSchema.index({ senderId: 1 });
friendRequestSchema.index({ status: 1 });
friendRequestSchema.index({ sentAt: -1 });

// Índice compuesto para evitar solicitudes duplicadas
friendRequestSchema.index({ postId: 1, senderId: 1 }, { unique: true });

// Método para aceptar solicitud
friendRequestSchema.methods.accept = function() {
  this.status = 'accepted';
  return this.save();
};

// Método para rechazar solicitud
friendRequestSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Método estático para obtener solicitudes pendientes de un post
friendRequestSchema.statics.getPendingByPost = function(postId) {
  return this.find({ postId, status: 'pending' })
    .populate('senderId', 'firstName lastName email')
    .sort({ sentAt: -1 });
};

// Método estático para obtener solicitudes enviadas por un usuario
friendRequestSchema.statics.getSentByUser = function(senderId) {
  return this.find({ senderId })
    .populate('postId', 'title authorId')
    .populate('postId.authorId', 'firstName lastName')
    .sort({ sentAt: -1 });
};

// Método para popular referencias
friendRequestSchema.methods.populateReferences = function() {
  return this.populate([
    { path: 'postId', select: 'title authorId', populate: { path: 'authorId', select: 'firstName lastName' } },
    { path: 'senderId', select: 'firstName lastName email' }
  ]);
};

// Pre-save middleware para validar que el sender no sea el author del post
friendRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Post = mongoose.model('Post');
    const post = await Post.findById(this.postId);
    
    if (post && post.authorId.equals(this.senderId)) {
      const error = new Error('No puedes enviar solicitud de amistad a tu propio post');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema); 