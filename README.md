# 🚀 FinSmart Network API

Una red social financiera completa desarrollada con Node.js, Express y MongoDB. Permite a los usuarios compartir información financiera, gestionar facturas, crear posts y establecer conexiones sociales.

## 📋 Características Principales

- **👥 Gestión de Usuarios** - Registro, autenticación y perfiles
- **🔐 Sistema de Roles** - Permisos granulares (user, moderator, admin)
- **📝 Posts Sociales** - Publicaciones con reacciones y comentarios
- **🧾 Gestión de Facturas** - Seguimiento y análisis financiero
- **👫 Red de Contactos** - Sistema de seguimiento entre usuarios
- **🤝 Solicitudes de Amistad** - Conexiones basadas en posts
- **📊 Análisis y Estadísticas** - Insights de la plataforma

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express 5.1.0
- **Base de Datos**: MongoDB, Mongoose 8.16.1
- **Autenticación**: JWT (preparado)
- **Validación**: Mongoose Schema Validators
- **Logging**: Sistema personalizado
- **Arquitectura**: MVC + Services + DTOs

## 📁 Estructura del Proyecto

```
finsmart-network/
├── src/
│   ├── app.js                     # Aplicación principal
│   ├── modules/
│   │   ├── roles/                 # Módulo de roles
│   │   │   ├── models/role.model.js
│   │   │   ├── services/role.service.js
│   │   │   ├── controllers/role.controller.js
│   │   │   └── routes/role.routes.js
│   │   ├── users/                 # Módulo de usuarios
│   │   │   ├── models/user.model.js
│   │   │   ├── services/user.service.js
│   │   │   ├── controllers/user.controller.js
│   │   │   └── routes/user.routes.js
│   │   ├── posts/                 # Módulo de posts
│   │   │   ├── models/post.model.js
│   │   │   ├── services/post.service.js
│   │   │   ├── controllers/post.controller.js
│   │   │   └── routes/post.routes.js
│   │   ├── invoices/              # Módulo de facturas
│   │   │   ├── models/invoice.model.js
│   │   │   ├── services/invoice.service.js
│   │   │   ├── controllers/invoice.controller.js
│   │   │   └── routes/invoice.routes.js
│   │   ├── contacts/              # Módulo de contactos
│   │   │   ├── models/contact.model.js
│   │   │   ├── services/contact.service.js
│   │   │   ├── controllers/contact.controller.js
│   │   │   └── routes/contact.routes.js
│   │   └── friendRequests/        # Módulo de solicitudes
│   │       ├── models/friendRequest.model.js
│   │       ├── services/friendRequest.service.js
│   │       ├── controllers/friendRequest.controller.js
│   │       └── routes/friendRequest.routes.js
│   └── shared/
│       ├── config/db.js           # Configuración de MongoDB
│       ├── middleware/            # Middlewares globales
│       └── utils/                 # Utilidades
├── examples/
│   └── user-examples.js           # Ejemplos de uso
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd finsmart-network
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env`:
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/Finsmart

# Servidor
PORT=3000
NODE_ENV=development

# JWT (opcional)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Iniciar el servidor
```bash
npm run dev
# o
npm start
```

## 📊 Modelos de Datos

### 👤 Usuario
```javascript
{
  firstName: String,      // Nombre
  lastName: String,       // Apellido
  email: String,          // Email único
  roleId: ObjectId,       // Referencia a Role
  createdAt: Date,        // Fecha de creación
  updatedAt: Date         // Fecha de actualización
}
```

### 🔐 Rol
```javascript
{
  name: String,           // Nombre del rol
  permissions: {
    createPost: Boolean,
    comment: Boolean,
    react: Boolean,
    deleteOwnPost: Boolean,
    deleteAnyPost: Boolean,
    startChat: Boolean,
    viewAnalytics: Boolean
  }
}
```

### 📝 Post
```javascript
{
  title: String,          // Título del post
  authorId: ObjectId,     // Autor
  content: String,        // Contenido (max 1500 chars)
  postType: String,       // general|financial|invoice|question|announcement
  invoiceId: ObjectId,    // Factura asociada (opcional)
  images: [Buffer],       // Imágenes
  reactions: [{
    userId: ObjectId,
    type: String,         // like|love|laugh|angry|sad
    reactedAt: Date
  }],
  comments: [{
    userId: ObjectId,
    comment: String,      // Comentario (max 500 chars)
    commentedAt: Date
  }]
}
```

### 🧾 Factura
```javascript
{
  code: String,           // Código único de factura
  total: Number,          // Total de la factura
  file: Buffer,           // Archivo PDF (opcional)
  issuedAt: Date,         // Fecha de emisión
  paidAt: Date,           // Fecha de pago (opcional)
  installments: Number,   // Número de cuotas
  igvAmount: Number,      // Monto del IGV
  netAmount: Number,      // Monto neto
  status: String,         // pending|paid|overdue|cancelled
  company: {
    name: String,         // Nombre de la empresa
    ruc: String          // RUC (11 dígitos)
  }
}
```

### 👫 Contacto
```javascript
{
  followerId: ObjectId,   // Usuario que sigue
  followeeId: ObjectId,   // Usuario seguido
  createdAt: Date         // Fecha de seguimiento
}
```

### 🤝 Solicitud de Amistad
```javascript
{
  postId: ObjectId,       // Post relacionado
  senderId: ObjectId,     // Usuario que envía solicitud
  sentAt: Date,           // Fecha de envío
  message: String,        // Mensaje (max 250 chars)
  status: String          // pending|accepted|rejected
}
```

## 🛠️ API Endpoints

### 🔐 Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/roles` | Obtener todos los roles |
| POST | `/api/roles` | Crear nuevo rol |
| POST | `/api/roles/initialize` | Inicializar roles por defecto |
| GET | `/api/roles/:id` | Obtener rol por ID |
| PUT | `/api/roles/:id` | Actualizar rol |
| DELETE | `/api/roles/:id` | Eliminar rol |

### 👥 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Obtener usuarios con paginación |
| POST | `/api/users` | Crear nuevo usuario |
| GET | `/api/users/stats` | Estadísticas de usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| GET | `/api/users/email/:email` | Obtener usuario por email |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

### 📝 Posts

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/posts` | Obtener posts con paginación |
| POST | `/api/posts` | Crear nuevo post |
| GET | `/api/posts/feed` | Obtener feed de posts |
| GET | `/api/posts/stats` | Estadísticas de posts |
| GET | `/api/posts/:id` | Obtener post por ID |
| PUT | `/api/posts/:id` | Actualizar post |
| DELETE | `/api/posts/:id` | Eliminar post |
| POST | `/api/posts/:id/reactions` | Agregar reacción |
| DELETE | `/api/posts/:id/reactions` | Remover reacción |
| POST | `/api/posts/:id/comments` | Agregar comentario |

### 🧾 Facturas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/invoices` | Obtener facturas con paginación |
| POST | `/api/invoices` | Crear nueva factura |
| GET | `/api/invoices/stats` | Estadísticas de facturas |
| GET | `/api/invoices/overdue` | Facturas vencidas |
| GET | `/api/invoices/:id` | Obtener factura por ID |
| GET | `/api/invoices/code/:code` | Obtener factura por código |
| GET | `/api/invoices/company/:ruc` | Facturas por empresa |
| PUT | `/api/invoices/:id` | Actualizar factura |
| PATCH | `/api/invoices/:id/pay` | Marcar como pagada |
| DELETE | `/api/invoices/:id` | Eliminar factura |

### 👫 Contactos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/contacts/follow` | Seguir usuario |
| DELETE | `/api/contacts/unfollow` | Dejar de seguir |
| GET | `/api/contacts/:userId/followers` | Obtener seguidores |
| GET | `/api/contacts/:userId/following` | Obtener seguidos |
| GET | `/api/contacts/:userId/counts` | Conteos de seguimiento |
| GET | `/api/contacts/:userId/mutual` | Seguidores mutuos |
| GET | `/api/contacts/:userId/suggestions` | Sugerencias de usuarios |
| GET | `/api/contacts/check/:followerId/:followeeId` | Verificar seguimiento |

### 🤝 Solicitudes de Amistad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/friend-requests` | Enviar solicitud de amistad |
| GET | `/api/friend-requests/post/:postId` | Solicitudes de un post |
| GET | `/api/friend-requests/sent/:userId` | Solicitudes enviadas |
| GET | `/api/friend-requests/received/:userId` | Solicitudes recibidas |
| GET | `/api/friend-requests/stats/:userId` | Estadísticas de solicitudes |
| PATCH | `/api/friend-requests/:id/accept` | Aceptar solicitud |
| PATCH | `/api/friend-requests/:id/reject` | Rechazar solicitud |
| DELETE | `/api/friend-requests/:id` | Cancelar solicitud |

## 💡 Ejemplos de Uso

### 1. Inicializar Roles por Defecto
```bash
curl -X POST http://localhost:3000/api/roles/initialize
```

### 2. Crear Usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com"
  }'
```

### 3. Crear Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primer post financiero",
    "authorId": "USER_ID",
    "content": "Compartiendo mis experiencias con inversiones",
    "postType": "financial"
  }'
```

### 4. Crear Factura
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "total": 1180,
    "netAmount": 1000,
    "issuedAt": "2024-01-15",
    "company": {
      "name": "Mi Empresa SAC",
      "ruc": "12345678901"
    }
  }'
```

### 5. Seguir Usuario
```bash
curl -X POST http://localhost:3000/api/contacts/follow \
  -H "Content-Type: application/json" \
  -d '{
    "followerId": "USER_ID_1",
    "followeeId": "USER_ID_2"
  }'
```

## 🔄 Flujo de Trabajo Típico

1. **Inicialización**: Crear roles por defecto
2. **Registro**: Crear usuarios con roles asignados
3. **Contenido**: Crear posts y facturas
4. **Interacción**: Reacciones, comentarios y seguimientos
5. **Networking**: Enviar y gestionar solicitudes de amistad
6. **Análisis**: Revisar estadísticas y métricas

## 🧪 Testing

Para probar la API puedes usar los archivos de ejemplo incluidos:

```bash
node examples/user-examples.js
```

## 🚀 Características Avanzadas

### Paginación
Todos los endpoints de listado soportan paginación:
```
GET /api/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Filtros y Búsqueda
```
GET /api/posts?postType=financial&search=inversión&authorId=USER_ID
```

### Agregaciones y Estadísticas
Cada módulo incluye endpoints de estadísticas con agregaciones MongoDB.

## 🔐 Seguridad

- Validación de datos con Mongoose
- Middleware de manejo de errores
- Logging de requests
- Preparado para JWT authentication

## 📈 Escalabilidad

- Arquitectura modular
- Servicios separados de controladores
- Índices optimizados en MongoDB
- Consultas eficientes con populate

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para la comunidad FinTech

---

**¡Gracias por usar FinSmart Network! 🚀**

Para más información o soporte, por favor contacta al equipo de desarrollo. 