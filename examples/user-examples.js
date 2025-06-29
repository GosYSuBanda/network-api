/**
 * Ejemplos de uso de la API FinSmart Network
 * Ejecutar con: node examples/user-examples.js
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Función helper para hacer requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(`${method} ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error.message);
    return null;
  }
}

async function runExamples() {
  console.log('🚀 Iniciando ejemplos de FinSmart Network API\n');

  // 1. ROLES - Inicializar roles por defecto
  console.log('=== 🔐 ROLES ===');
  await makeRequest('/roles/initialize', 'POST');
  
  const rolesResponse = await makeRequest('/roles');
  const userRole = rolesResponse?.data?.find(role => role.name === 'user');
  const adminRole = rolesResponse?.data?.find(role => role.name === 'admin');

  if (!userRole) {
    console.log('❌ No se pudieron obtener los roles');
    return;
  }

  // 2. USUARIOS - Crear usuarios de ejemplo
  console.log('\n=== 👥 USUARIOS ===');
  
  const user1Data = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    roleId: userRole._id
  };
  
  const user2Data = {
    firstName: 'María',
    lastName: 'González',
    email: 'maria@example.com',
    roleId: userRole._id
  };
  
  const adminData = {
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@example.com',
    roleId: adminRole._id
  };

  const user1Response = await makeRequest('/users', 'POST', user1Data);
  const user2Response = await makeRequest('/users', 'POST', user2Data);
  const adminResponse = await makeRequest('/users', 'POST', adminData);

  if (!user1Response?.data || !user2Response?.data) {
    console.log('❌ No se pudieron crear los usuarios');
    return;
  }

  const user1 = user1Response.data;
  const user2 = user2Response.data;
  const admin = adminResponse.data;

  // Obtener estadísticas de usuarios
  await makeRequest('/users/stats');

  // 3. FACTURAS - Crear facturas de ejemplo
  console.log('\n=== 🧾 FACTURAS ===');
  
  const invoice1Data = {
    netAmount: 1000,
    issuedAt: new Date('2024-01-15'),
    installments: 3,
    company: {
      name: 'Tech Solutions SAC',
      ruc: '12345678901'
    }
  };
  
  const invoice2Data = {
    total: 590,
    issuedAt: new Date('2024-01-20'),
    status: 'paid',
    paidAt: new Date('2024-01-25'),
    company: {
      name: 'Digital Marketing EIRL',
      ruc: '98765432109'
    }
  };

  const invoice1Response = await makeRequest('/invoices', 'POST', invoice1Data);
  const invoice2Response = await makeRequest('/invoices', 'POST', invoice2Data);

  const invoice1 = invoice1Response?.data;
  const invoice2 = invoice2Response?.data;

  // Obtener estadísticas de facturas
  await makeRequest('/invoices/stats');

  // 4. POSTS - Crear posts de ejemplo
  console.log('\n=== 📝 POSTS ===');
  
  const post1Data = {
    title: 'Consejos para gestionar facturas',
    authorId: user1._id,
    content: 'Comparto algunos consejos que me han ayudado a organizar mejor mis facturas y pagos. Es importante llevar un control detallado para optimizar el flujo de caja.',
    postType: 'financial'
  };
  
  const post2Data = {
    title: 'Mi experiencia con facturación digital',
    authorId: user2._id,
    content: 'Hace poco implementé un sistema de facturación digital en mi negocio y los resultados han sido increíbles.',
    postType: 'general',
    invoiceId: invoice1?._id
  };

  const post1Response = await makeRequest('/posts', 'POST', post1Data);
  const post2Response = await makeRequest('/posts', 'POST', post2Data);

  const post1 = post1Response?.data;
  const post2 = post2Response?.data;

  // Agregar reacciones y comentarios
  if (post1) {
    await makeRequest(`/posts/${post1._id}/reactions`, 'POST', {
      userId: user2._id,
      type: 'like'
    });
    
    await makeRequest(`/posts/${post1._id}/comments`, 'POST', {
      userId: user2._id,
      comment: '¡Excelentes consejos! Me han sido muy útiles.'
    });
  }

  // Obtener feed y estadísticas
  await makeRequest('/posts/feed?limit=5');
  await makeRequest('/posts/stats');

  // 5. CONTACTOS - Crear red de seguimiento
  console.log('\n=== 👫 CONTACTOS ===');
  
  // María sigue a Juan
  await makeRequest('/contacts/follow', 'POST', {
    followerId: user2._id,
    followeeId: user1._id
  });
  
  // Admin sigue a ambos
  await makeRequest('/contacts/follow', 'POST', {
    followerId: admin._id,
    followeeId: user1._id
  });
  
  await makeRequest('/contacts/follow', 'POST', {
    followerId: admin._id,
    followeeId: user2._id
  });

  // Obtener información de seguimiento
  await makeRequest(`/contacts/${user1._id}/followers`);
  await makeRequest(`/contacts/${user2._id}/following`);
  await makeRequest(`/contacts/${user1._id}/counts`);
  await makeRequest(`/contacts/check/${user2._id}/${user1._id}`);

  // 6. SOLICITUDES DE AMISTAD - Gestionar conexiones
  console.log('\n=== 🤝 SOLICITUDES DE AMISTAD ===');
  
  if (post1) {
    // María envía solicitud de amistad basada en el post de Juan
    const friendRequestData = {
      postId: post1._id,
      senderId: user2._id,
      message: 'Me encantó tu post sobre gestión de facturas. ¿Podríamos conectar?'
    };
    
    const friendRequestResponse = await makeRequest('/friend-requests', 'POST', friendRequestData);
    const friendRequest = friendRequestResponse?.data;
    
    if (friendRequest) {
      // Juan acepta la solicitud
      await makeRequest(`/friend-requests/${friendRequest._id}/accept`, 'PATCH', {
        userId: user1._id
      });
    }
    
    // Obtener estadísticas de solicitudes
    await makeRequest(`/friend-requests/stats/${user1._id}`);
    await makeRequest(`/friend-requests/received/${user1._id}`);
  }

  // 7. CONSULTAS AVANZADAS
  console.log('\n=== 📊 CONSULTAS AVANZADAS ===');
  
  // Búsquedas con filtros
  await makeRequest('/users?search=juan&limit=5');
  await makeRequest('/posts?postType=financial&limit=3');
  await makeRequest('/invoices?status=pending&limit=5');
  
  // Obtener usuarios sugeridos
  await makeRequest(`/contacts/${user1._id}/suggestions?limit=3`);
  
  // Obtener facturas de empresa específica
  if (invoice1) {
    await makeRequest('/invoices/company/12345678901');
  }
  
  // Obtener posts con paginación
  await makeRequest('/posts?page=1&limit=2&sortBy=createdAt&sortOrder=desc');

  console.log('\n✅ Ejemplos completados exitosamente!');
  console.log('\n🔗 Enlaces útiles:');
  console.log('📚 Documentación: http://localhost:3000');
  console.log('🔍 Health Check: http://localhost:3000/health');
  console.log('👥 Usuarios: http://localhost:3000/api/users');
  console.log('📝 Posts: http://localhost:3000/api/posts');
  console.log('🧾 Facturas: http://localhost:3000/api/invoices');
}

// Verificar si el módulo fue ejecutado directamente
if (typeof require !== 'undefined' && require.main === module) {
  // Importar fetch para Node.js (requiere Node 18+ o instalar node-fetch)
  if (typeof fetch === 'undefined') {
    console.log('⚠️  Este script requiere Node.js 18+ para fetch nativo');
    console.log('💡 Alternativa: npm install node-fetch y descomenta la línea siguiente');
    // const fetch = require('node-fetch');
    process.exit(1);
  }
  
  runExamples().catch(error => {
    console.error('❌ Error ejecutando ejemplos:', error);
    process.exit(1);
  });
}

module.exports = { runExamples, makeRequest }; 