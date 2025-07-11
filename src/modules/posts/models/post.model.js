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
  // Referencia a factura (opcional)
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false
  },

  // Información empresarial para posts de facturas
  businessInfo: {
    companyName: { type: String, trim: true },
    companyRuc: { type: String, trim: true },
    invoiceCode: { type: String, trim: true },
    invoiceTotal: { type: Number, min: 0 },
    invoiceStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    issuedAt: { type: Date },
    paidAt: { type: Date }
  },

  // Tags para categorización
  tags: {
    type: [String],
    default: []
  },

  // Categoría del post
  category: {
    type: String,
    enum: ['general', 'alto-valor', 'medio-valor', 'bajo-valor', 'urgente'],
    default: 'general'
  },

  // Multimedia con metadatos completos
  media: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  reactions: [reactionSchema],
  comments: [commentSchema]
}, {
  timestamps: true,
  collection: 'posts'
});

// Índices
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'reactions.userId': 1 });
postSchema.index({ 'comments.userId': 1 });

// Índices para posts empresariales
postSchema.index({ 'businessInfo.companyRuc': 1 });
postSchema.index({ 'businessInfo.invoiceStatus': 1 });
postSchema.index({ 'businessInfo.issuedAt': -1 });
postSchema.index({ 'businessInfo.invoiceTotal': -1 });
postSchema.index({ tags: 1 });
postSchema.index({ category: 1 });
postSchema.index({ postType: 1, category: 1 });
postSchema.index({ 'businessInfo.companyRuc': 1, 'businessInfo.invoiceStatus': 1 });

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
postSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Agregar contadores virtuales
  obj.reactionCount = this.reactionCount;
  obj.commentCount = this.commentCount;
  
  return obj;
};

// Middleware pre-save para validación
postSchema.pre('save', function(next) {
  // Validar que si es post de factura, tenga invoiceId
  if (this.postType === 'invoice' && !this.invoiceId) {
    next(new Error('Posts de tipo invoice requieren invoiceId'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Post', postSchema); 