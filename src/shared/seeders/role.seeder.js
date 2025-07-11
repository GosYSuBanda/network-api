const Role = require('../../modules/roles/models/role.model');
const logger = require('../utils/logger');

/**
 * Seeder para roles por defecto
 */
class RoleSeeder {
  
  /**
   * Ejecutar seeder de roles
   */
  static async run() {
    try {
      console.log('🌱 Iniciando seeder de roles...');
      
      // Verificar si ya existen roles
      const existingRoles = await Role.countDocuments();
      
      if (existingRoles > 0) {
        console.log('✅ Roles ya existen en la base de datos');
        return;
      }
      
      // Crear roles por defecto
      const defaultRoles = [
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
      
      // Insertar roles
      const createdRoles = await Role.insertMany(defaultRoles);
      
      console.log('✅ Roles por defecto creados exitosamente:');
      createdRoles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role._id})`);
      });
      
      logger.info('Roles por defecto inicializados correctamente');
      
    } catch (error) {
      console.error('❌ Error al ejecutar seeder de roles:', error);
      logger.error('Error en seeder de roles:', error);
      throw error;
    }
  }
  
  /**
   * Verificar si los roles existen
   */
  static async checkRoles() {
    try {
      const roles = await Role.find({});
      return {
        exists: roles.length > 0,
        count: roles.length,
        roles: roles.map(r => ({ id: r._id, name: r.name }))
      };
    } catch (error) {
      console.error('❌ Error al verificar roles:', error);
      return { exists: false, count: 0, roles: [] };
    }
  }
}

module.exports = RoleSeeder; 