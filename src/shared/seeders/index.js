const RoleSeeder = require('./role.seeder');
const logger = require('../utils/logger');

/**
 * Administrador principal de seeders
 */
class DatabaseSeeder {
  
  /**
   * Ejecutar todos los seeders
   */
  static async run() {
    try {
      console.log('🌱 Iniciando seeders de base de datos...');
      console.log('==========================================');
      
      // Ejecutar seeder de roles
      await RoleSeeder.run();
      
      // Aquí se pueden agregar más seeders en el futuro
      // await UserSeeder.run();
      // await PostSeeder.run();
      
      console.log('==========================================');
      console.log('✅ Todos los seeders ejecutados exitosamente');
      logger.info('Seeders de base de datos ejecutados correctamente');
      
    } catch (error) {
      console.error('❌ Error al ejecutar seeders:', error);
      logger.error('Error en seeders de base de datos:', error);
      throw error;
    }
  }
  
  /**
   * Verificar estado de la base de datos
   */
  static async checkDatabaseStatus() {
    try {
      console.log('🔍 Verificando estado de la base de datos...');
      
      const rolesStatus = await RoleSeeder.checkRoles();
      
      const status = {
        roles: rolesStatus,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Estado de la base de datos:');
      console.log(`   - Roles: ${rolesStatus.exists ? '✅' : '❌'} (${rolesStatus.count} registros)`);
      
      return status;
      
    } catch (error) {
      console.error('❌ Error al verificar estado de la base de datos:', error);
      return null;
    }
  }
}

module.exports = DatabaseSeeder; 