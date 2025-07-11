const { body } = require('express-validator');

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Formato de teléfono inválido')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),

  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Formato de teléfono inválido'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('La edad debe estar entre 13 y 120 años');
      }
      return true;
    }),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La calle no puede exceder 100 caracteres'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La ciudad no puede exceder 50 caracteres'),

  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El estado no puede exceder 50 caracteres'),

  body('address.zipCode')
    .optional()
    .trim()
    .matches(/^[0-9]{4,10}$/)
    .withMessage('Código postal inválido'),

  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres'),

  body('preferences.language')
    .optional()
    .isIn(['es', 'en'])
    .withMessage('Idioma debe ser "es" o "en"'),

  body('preferences.currency')
    .optional()
    .isIn(['MXN', 'USD', 'EUR'])
    .withMessage('Moneda debe ser MXN, USD o EUR'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Notificación email debe ser true o false'),

  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('Notificación SMS debe ser true o false'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Notificación push debe ser true o false')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
}; 