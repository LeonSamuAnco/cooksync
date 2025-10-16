const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔧 Ejecutando migración de favoritos...\n');

  // Obtener contraseña de las variables de entorno o usar vacía
  const password = process.env.DB_PASSWORD || '';
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password,
    database: 'cooksync_db',
    multipleStatements: true
  });

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../prisma/migrations/create_favorites.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando SQL...');
    await connection.query(sql);
    
    console.log('✅ Migración ejecutada exitosamente!');
    console.log('✅ Tabla "favoritos" creada correctamente\n');

    // Verificar que la tabla existe
    const [tables] = await connection.query("SHOW TABLES LIKE 'favoritos'");
    if (tables.length > 0) {
      console.log('✅ Verificación: Tabla "favoritos" existe en la base de datos');
      
      // Mostrar estructura de la tabla
      const [columns] = await connection.query('DESCRIBE favoritos');
      console.log('\n📊 Estructura de la tabla:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
