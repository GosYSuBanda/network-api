const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  createPost: {
    type: Boolean,
    required: true,
    default: false
  },
  comment: {
    type: Boolean,
    required: true,
    default: false
  },
  react: {
    type: Boolean,
    required: true,
    default: false
  },
  deleteOwnPost: {
    type: Boolean,
    required: true,
    default: false
  },
  deleteAnyPost: {
    type: Boolean,
    required: true,
    default: false
  },
  startChat: {
    type: Boolean,
    default: false
  },
  viewAnalytics: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del rol es requerido'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  permissions: {
    type: permissionSchema,
    required: [true, 'Los permisos son requeridos']
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// Índices
roleSchema.index({ name: 1 });

// Método estático para obtener roles por defecto
roleSchema.statics.getDefaultRoles = function() {
  return [
    {
      name: 'user',
      permissions: {
        createPost: true,
        comment: true,
        react: true,
        deleteOwnPost: true,
        deleteAnyPost: false,
        startChat: true,
        viewAnalytics: false
      }
    },
    {
      name: 'moderator',
      permissions: {
        createPost: true,
        comment: true,
        react: true,
        deleteOwnPost: true,
        deleteAnyPost: true,
        startChat: true,
        viewAnalytics: true
      }
    },
    {
      name: 'admin',
      permissions: {
        createPost: true,
        comment: true,
        react: true,
        deleteOwnPost: true,
        deleteAnyPost: true,
        startChat: true,
        viewAnalytics: true
      }
    }
  ];
};

module.exports = mongoose.model('Role', roleSchema); 