const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El seguidor es requerido']
  },
  followeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El seguido es requerido']
  }
}, {
  timestamps: true,
  collection: 'contacts'
});

// Índices
contactSchema.index({ followerId: 1 });
contactSchema.index({ followeeId: 1 });
contactSchema.index({ createdAt: -1 });

// Índice compuesto único para evitar seguimientos duplicados
contactSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

// Método estático para seguir a un usuario
contactSchema.statics.follow = async function(followerId, followeeId) {
  // Validar que no se siga a sí mismo
  if (followerId.equals(followeeId)) {
    throw new Error('No puedes seguirte a ti mismo');
  }
  
  // Crear la relación de seguimiento
  const contact = new this({
    followerId,
    followeeId
  });
  
  return await contact.save();
};

// Método estático para dejar de seguir
contactSchema.statics.unfollow = async function(followerId, followeeId) {
  return await this.findOneAndDelete({
    followerId,
    followeeId
  });
};

// Método estático para obtener seguidores de un usuario
contactSchema.statics.getFollowers = function(userId, limit = 50, skip = 0) {
  return this.find({ followeeId: userId })
    .populate('followerId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Método estático para obtener seguidos de un usuario
contactSchema.statics.getFollowing = function(userId, limit = 50, skip = 0) {
  return this.find({ followerId: userId })
    .populate('followeeId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Método estático para verificar si un usuario sigue a otro
contactSchema.statics.isFollowing = async function(followerId, followeeId) {
  const contact = await this.findOne({
    followerId,
    followeeId
  });
  return !!contact;
};

// Método estático para obtener conteo de seguidores y seguidos
contactSchema.statics.getCounts = async function(userId) {
  const [followersCount, followingCount] = await Promise.all([
    this.countDocuments({ followeeId: userId }),
    this.countDocuments({ followerId: userId })
  ]);
  
  return {
    followers: followersCount,
    following: followingCount
  };
};

// Método estático para obtener usuarios mutuos
contactSchema.statics.getMutualFollows = async function(userId) {
  // Obtener usuarios que el usuario sigue
  const following = await this.find({ followerId: userId }).select('followeeId');
  const followingIds = following.map(f => f.followeeId);
  
  // Obtener usuarios que también siguen al usuario
  const mutualFollows = await this.find({
    followerId: { $in: followingIds },
    followeeId: userId
  }).populate('followerId', 'firstName lastName email');
  
  return mutualFollows;
};

// Pre-save middleware para validar
contactSchema.pre('save', function(next) {
  if (this.followerId.equals(this.followeeId)) {
    const error = new Error('No puedes seguirte a ti mismo');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema); 