#!/usr/bin/env node

require('dotenv').config();
const connectDB = require('../config/db');
const DatabaseSeeder = require('../seeders/index');

/**
 * Script para ejecutar seeders manualmente
 */
async function runSeeders() {
  try {
    console.log('🌱 Iniciando ejecución manual de seeders...');
    
    // Conectar a la base de datos
    await connectDB();
    
    // Ejecutar seeders
    await DatabaseSeeder.run();
    
    console.log('✅ Seeders ejecutados exitosamente');
    
    // Verificar estado
    const status = await DatabaseSeeder.checkDatabaseStatus();
    console.log('📊 Estado final de la base de datos:');
    console.log(JSON.stringify(status, null, 2));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al ejecutar seeders:', error);
    process.exit(1);
  }
}

// Verificar argumentos de comando
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'run':
    runSeeders();
    break;
    
  case 'status':
    (async () => {
      try {
        await connectDB();
        const status = await DatabaseSeeder.checkDatabaseStatus();
        console.log('📊 Estado de la base de datos:');
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    })();
    break;
    
  default:
    console.log('🔧 Uso del script de seeders:');
    console.log('');
    console.log('  node src/shared/scripts/seed.js run     - Ejecutar seeders');
    console.log('  node src/shared/scripts/seed.js status  - Verificar estado');
    console.log('');
    process.exit(0);
} 