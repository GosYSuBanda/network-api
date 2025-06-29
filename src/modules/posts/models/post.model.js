const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'angry', 'sad'],
    required: [true, 'El tipo de reacción es requerido']
  },
  reactedAt: {
    type: Date,
    required: [true, 'La fecha de reacción es requerida'],
    default: Date.now
  }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    minlength: [1, 'El comentario no puede estar vacío'],
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  commentedAt: {
    type: Date,
    required: [true, 'La fecha del comentario es requerida'],
    default: Date.now
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es requerido']
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido'],
    trim: true,
    minlength: [1, 'El contenido no puede estar vacío'],
    maxlength: [1500, 'El contenido no puede exceder 1500 caracteres']
  },
  postType: {
    type: String,
    enum: ['general', 'financial', 'invoice', 'question', 'announcement'],
    default: 'general'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false // Opcional
  },
  images: [{
    type: Buffer,
    required: false
  }],
  reactions: [reactionSchema],
  comments: [commentSchema]
}, {
  timestamps: true,
  collection: 'posts'
});

// Índices
postSchema.index({ authorId: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ invoiceId: 1 });

// Virtual para contar reacciones
postSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual para contar comentarios
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Método para agregar reacción
postSchema.methods.addReaction = function(userId, type) {
  // Remover reacción anterior del mismo usuario
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  
  // Agregar nueva reacción
  this.reactions.push({
    userId,
    type,
    reactedAt: new Date()
  });
  
  return this.save();
};

// Método para remover reacción
postSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  return this.save();
};

// Método para agregar comentario
postSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    userId,
    comment,
    commentedAt: new Date()
  });
  
  return this.save();
};

// Método para popular referencias
postSchema.methods.populateReferences = function() {
  return this.populate([
    { path: 'authorId', select: 'firstName lastName email' },
    { path: 'invoiceId', select: 'code total status company' },
    { path: 'reactions.userId', select: 'firstName lastName' },
    { path: 'comments.userId', select: 'firstName lastName' }
  ]);
};

// Método estático para obtener posts del feed
postSchema.statics.getFeedPosts = function(limit = 10, skip = 0) {
  return this.find({})
    .populate('authorId', 'firstName lastName')
    .populate('invoiceId', 'code total status')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Transformar JSON response
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Post', postSchema); 