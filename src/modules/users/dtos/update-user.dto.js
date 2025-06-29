const updateUserDTO = {
  firstName: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    message: 'El nombre debe tener entre 2 y 50 caracteres'
  },
  lastName: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    message: 'El apellido debe tener entre 2 y 50 caracteres'
  },
  phoneNumber: {
    required: false,
    type: 'string',
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Formato de teléfono inválido'
  },
  dateOfBirth: {
    required: false,
    type: 'date',
    message: 'Fecha de nacimiento inválida'
  },
  address: {
    required: false,
    type: 'object',
    properties: {
      street: { type: 'string', maxLength: 100 },
      city: { type: 'string', maxLength: 50 },
      state: { type: 'string', maxLength: 50 },
      zipCode: { type: 'string', maxLength: 10 },
      country: { type: 'string', maxLength: 50 }
    }
  },
  preferences: {
    required: false,
    type: 'object',
    properties: {
      language: { type: 'string', enum: ['es', 'en'] },
      currency: { type: 'string', enum: ['MXN', 'USD', 'EUR'] },
      notifications: {
        type: 'object',
        properties: {
          email: { type: 'boolean' },
          sms: { type: 'boolean' },
          push: { type: 'boolean' }
        }
      }
    }
  }
};

const validateUpdateUser = (data) => {
  const errors = [];
  
  // Si no hay datos para actualizar
  if (!data || Object.keys(data).length === 0) {
    errors.push('No se proporcionaron datos para actualizar');
    return { isValid: false, errors };
  }
  
  // Validar solo los campos que están presentes
  for (const [field, value] of Object.entries(data)) {
    const rules = updateUserDTO[field];
    
    if (!rules) {
      errors.push(`${field}: Campo no permitido para actualización`);
      continue;
    }
    
    if (value !== null && value !== undefined && value !== '') {
      // Validar tipo string
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field}: Debe ser una cadena de texto`);
        continue;
      }
      
      // Validar longitud mínima
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field}: ${rules.message}`);
        continue;
      }
      
      // Validar longitud máxima
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field}: ${rules.message}`);
        continue;
      }
      
      // Validar patrón
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field}: ${rules.message}`);
        continue;
      }
      
      // Validar enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field}: Valor no válido. Valores permitidos: ${rules.enum.join(', ')}`);
        continue;
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  updateUserDTO,
  validateUpdateUser
}; 