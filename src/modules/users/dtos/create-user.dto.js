const createUserDTO = {
  firstName: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    message: 'El nombre es requerido y debe tener entre 2 y 50 caracteres'
  },
  lastName: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    message: 'El apellido es requerido y debe tener entre 2 y 50 caracteres'
  },
  email: {
    required: true,
    type: 'email',
    message: 'Se requiere un email válido'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
    message: 'La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números'
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
  }
};

const validateCreateUser = (data) => {
  const errors = [];
  
  // Validar campos requeridos
  for (const [field, rules] of Object.entries(createUserDTO)) {
    if (rules.required && (!data[field] || data[field].toString().trim() === '')) {
      errors.push(`${field}: ${rules.message}`);
      continue;
    }
    
    if (data[field]) {
      // Validar tipo string
      if (rules.type === 'string' && typeof data[field] !== 'string') {
        errors.push(`${field}: Debe ser una cadena de texto`);
        continue;
      }
      
      // Validar email
      if (rules.type === 'email') {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(data[field])) {
          errors.push(`${field}: ${rules.message}`);
          continue;
        }
      }
      
      // Validar longitud mínima
      if (rules.minLength && data[field].length < rules.minLength) {
        errors.push(`${field}: ${rules.message}`);
        continue;
      }
      
      // Validar longitud máxima
      if (rules.maxLength && data[field].length > rules.maxLength) {
        errors.push(`${field}: ${rules.message}`);
        continue;
      }
      
      // Validar patrón
      if (rules.pattern && !rules.pattern.test(data[field])) {
        errors.push(`${field}: ${rules.message}`);
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
  createUserDTO,
  validateCreateUser
}; 