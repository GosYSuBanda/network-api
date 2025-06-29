const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  ruc: {
    type: String,
    required: [true, 'El RUC es requerido'],
    trim: true,
    match: [/^\d{11}$/, 'El RUC debe tener 11 dígitos']
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código de factura es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total debe ser mayor a 0']
  },
  file: {
    type: Buffer,
    required: false // Opcional según el esquema
  },
  issuedAt: {
    type: Date,
    required: [true, 'La fecha de emisión es requerida']
  },
  paidAt: {
    type: Date,
    required: false
  },
  installments: {
    type: Number,
    min: [1, 'Las cuotas deben ser mínimo 1'],
    default: 1
  },
  igvAmount: {
    type: Number,
    min: [0, 'El IGV no puede ser negativo'],
    default: 0
  },
  netAmount: {
    type: Number,
    min: [0, 'El monto neto no puede ser negativo'],
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  company: {
    type: companySchema,
    required: [true, 'La información de la empresa es requerida']
  }
}, {
  timestamps: true,
  collection: 'invoices'
});

// Índices
invoiceSchema.index({ code: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issuedAt: -1 });
invoiceSchema.index({ 'company.ruc': 1 });

// Método para calcular IGV (18% en Perú)
invoiceSchema.methods.calculateIGV = function() {
  if (this.netAmount > 0) {
    this.igvAmount = this.netAmount * 0.18;
    this.total = this.netAmount + this.igvAmount;
  }
};

// Método para marcar como pagada
invoiceSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.paidAt = new Date();
  return this.save();
};

// Método estático para buscar por empresa
invoiceSchema.statics.findByCompany = function(ruc) {
  return this.find({ 'company.ruc': ruc });
};

// Pre-save middleware para generar código si no existe
invoiceSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    const timestamp = Date.now().toString().slice(-6);
    this.code = `INV-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema); 