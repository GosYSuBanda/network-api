const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinSmart Network API',
      version: '1.0.0',
      description: '🚀 API para la red social financiera FinSmart Network - Sistema completo de gestión de usuarios, posts, facturas y contactos',
      contact: {
        name: 'FinSmart Team',
        email: 'contact@finsmart.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Role: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'user' },
            permissions: {
              type: 'object',
              properties: {
                createPost: { type: 'boolean', example: true },
                comment: { type: 'boolean', example: true },
                react: { type: 'boolean', example: true },
                deleteOwnPost: { type: 'boolean', example: true },
                deleteAnyPost: { type: 'boolean', example: false },
                startChat: { type: 'boolean', example: true },
                viewAnalytics: { type: 'boolean', example: false }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            phoneNumber: { type: 'string', example: '+52-555-123-4567' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-01-15' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Calle 123' },
                city: { type: 'string', example: 'Ciudad de México' },
                state: { type: 'string', example: 'CDMX' },
                zipCode: { type: 'string', example: '12345' },
                country: { type: 'string', example: 'México' }
              }
            },
            roleId: { 
              oneOf: [
                { type: 'string', example: '507f1f77bcf86cd799439012' },
                { $ref: '#/components/schemas/Role' }
              ]
            },
            status: { 
              type: 'string', 
              enum: ['active', 'inactive', 'suspended'], 
              example: 'active' 
            },
            emailVerified: { type: 'boolean', example: false },
            lastLogin: { type: 'string', format: 'date-time' },
            preferences: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'es' },
                currency: { type: 'string', example: 'MXN' },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean', example: true },
                    sms: { type: 'boolean', example: false },
                    push: { type: 'boolean', example: true }
                  }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Mi primera publicación financiera' },
            authorId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            content: { type: 'string', example: 'Contenido del post...' },
            postType: { type: 'string', enum: ['text', 'invoice', 'image'], example: 'text' },
            invoiceId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            images: { type: 'array', items: { type: 'string' } },
            reactions: {
              type: 'object',
              properties: {
                like: { type: 'number', example: 5 },
                love: { type: 'number', example: 2 },
                laugh: { type: 'number', example: 1 }
              }
            },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  content: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            code: { type: 'string', example: 'INV-2024-001' },
            total: { type: 'number', example: 1180.00 },
            file: { type: 'string', example: 'invoice_001.pdf' },
            issuedAt: { type: 'string', format: 'date-time' },
            paidAt: { type: 'string', format: 'date-time' },
            installments: { type: 'number', example: 3 },
            igvAmount: { type: 'number', example: 180.00 },
            netAmount: { type: 'number', example: 1000.00 },
            status: { type: 'string', enum: ['pending', 'paid', 'overdue'], example: 'pending' },
            company: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Empresa S.A.C.' },
                ruc: { type: 'string', example: '20123456789' },
                address: { type: 'string', example: 'Av. Principal 123' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            followerId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            followeeId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        FriendRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            postId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            senderId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            sentAt: { type: 'string', format: 'date-time' },
            message: { type: 'string', example: 'Me gustaría conectar contigo' },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error en la operación' },
            error: { type: 'string', example: 'Detalles del error' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operación exitosa' },
            data: { type: 'object' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'number', example: 1 },
                totalPages: { type: 'number', example: 5 },
                totalItems: { type: 'number', example: 50 },
                itemsPerPage: { type: 'number', example: 10 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false }
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1 },
          description: 'Número de página'
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
          description: 'Cantidad de elementos por página'
        },
        SearchParam: {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Término de búsqueda'
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../..', 'app.js'),
    path.join(__dirname, '../..', 'modules', '**', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'roles', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'users', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'posts', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'invoices', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'contacts', 'routes', '*.js'),
    path.join(__dirname, '../..', 'modules', 'friendRequests', 'routes', '*.js')
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 