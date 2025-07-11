# Seeders de Base de Datos

Los seeders son scripts que se ejecutan automáticamente al iniciar la aplicación para asegurar que la base de datos tenga los datos iniciales necesarios.

## 🚀 Ejecución Automática

Los seeders se ejecutan automáticamente cuando inicias la aplicación:

```bash
npm start
# o
npm run dev
```

## 🔧 Ejecución Manual

### Ejecutar todos los seeders

```bash
npm run seed
```

### Verificar estado de la base de datos

```bash
npm run seed:status
```

### Ver ayuda

```bash
npm run seed:help
```

## 📊 Endpoints de Verificación

### Estado de la base de datos
```
GET /db-status
```

Respuesta:
```json
{
  "success": true,
  "message": "Estado de la base de datos",
  "data": {
    "roles": {
      "exists": true,
      "count": 3,
      "roles": [
        { "id": "...", "name": "user" },
        { "id": "...", "name": "moderator" },
        { "id": "...", "name": "admin" }
      ]
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🏗️ Roles Creados

### 1. Usuario Normal (user)
- ✅ Crear posts
- ✅ Comentar
- ✅ Reaccionar
- ✅ Eliminar sus propios posts
- ❌ Eliminar posts de otros
- ✅ Iniciar chats
- ❌ Ver analíticas

### 2. Moderador (moderator)
- ✅ Crear posts
- ✅ Comentar
- ✅ Reaccionar
- ✅ Eliminar sus propios posts
- ✅ Eliminar posts de otros
- ✅ Iniciar chats
- ✅ Ver analíticas

### 3. Administrador (admin)
- ✅ Crear posts
- ✅ Comentar
- ✅ Reaccionar
- ✅ Eliminar sus propios posts
- ✅ Eliminar posts de otros
- ✅ Iniciar chats
- ✅ Ver analíticas

## 📝 Agregar Nuevos Seeders

Para agregar un nuevo seeder:

1. Crear el archivo del seeder en `src/shared/seeders/`
2. Seguir el patrón de `role.seeder.js`
3. Agregar el seeder en `src/shared/seeders/index.js`
4. Ejecutar con `npm run seed`

### Ejemplo de seeder:

```javascript
const Model = require('../../modules/model/models/model.model');

class ModelSeeder {
  static async run() {
    try {
      console.log('🌱 Iniciando seeder de modelos...');
      
      const existingModels = await Model.countDocuments();
      if (existingModels > 0) {
        console.log('✅ Modelos ya existen');
        return;
      }
      
      const defaultModels = [
        { name: 'Modelo 1', value: 'valor1' },
        { name: 'Modelo 2', value: 'valor2' }
      ];
      
      await Model.insertMany(defaultModels);
      console.log('✅ Modelos creados exitosamente');
      
    } catch (error) {
      console.error('❌ Error en seeder de modelos:', error);
      throw error;
    }
  }
  
  static async checkModels() {
    try {
      const models = await Model.find({});
      return {
        exists: models.length > 0,
        count: models.length,
        models: models.map(m => ({ id: m._id, name: m.name }))
      };
    } catch (error) {
      return { exists: false, count: 0, models: [] };
    }
  }
}

module.exports = ModelSeeder;
```

## 🔒 Seguridad

- Los seeders solo crean datos si no existen
- No sobrescriben datos existentes
- Los errores se manejan y se loggean apropiadamente
- La aplicación no se inicia si los seeders fallan

## 🔍 Troubleshooting

### Problema: Seeders no se ejecutan
- Verificar conexión a MongoDB
- Verificar que las variables de entorno estén configuradas
- Revisar los logs de la aplicación

### Problema: Datos duplicados
- Los seeders verifican si los datos ya existen antes de crearlos
- Si hay duplicados, verificar la lógica de verificación en el seeder

### Problema: Aplicación no inicia
- Revisar los logs de error
- Verificar que la base de datos esté disponible
- Ejecutar seeders manualmente: `npm run seed` 