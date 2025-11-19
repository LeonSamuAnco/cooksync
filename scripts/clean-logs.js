#!/usr/bin/env node

/**
 * Script para limpiar console.log excesivos en CookSync
 * Mantiene logs críticos y convierte logs de desarrollo a condicionales
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  // Patrones de console.log a eliminar completamente
  REMOVE_PATTERNS: [
    /console\.log\('🔍 [^']*'\);?\s*\n/g,
    /console\.log\('✅ [^']*'\);?\s*\n/g,
    /console\.log\('🔧 [^']*'\);?\s*\n/g,
    /console\.log\('📊 [^']*'\);?\s*\n/g,
    /console\.log\('🎯 [^']*'\);?\s*\n/g,
    /console\.log\('⚙️ [^']*'\);?\s*\n/g,
    /console\.log\(`🔍 [^`]*`\);?\s*\n/g,
    /console\.log\(`✅ [^`]*`\);?\s*\n/g,
    /console\.log\(`🔧 [^`]*`\);?\s*\n/g,
    /console\.log\(`📊 [^`]*`\);?\s*\n/g,
  ],
  
  // Patrones a convertir a condicionales (solo desarrollo)
  CONDITIONAL_PATTERNS: [
    {
      pattern: /(\s*)(console\.log\('🚀 [^']*'\);?)/g,
      replacement: '$1if (process.env.NODE_ENV === \'development\') {\n$1  $2\n$1}'
    },
    {
      pattern: /(\s*)(console\.log\(`🚀 [^`]*`\);?)/g,
      replacement: '$1if (process.env.NODE_ENV === \'development\') {\n$1  $2\n$1}'
    }
  ],
  
  // Logs críticos a mantener (errores, seguridad, etc.)
  KEEP_PATTERNS: [
    /console\.error/,
    /console\.warn/,
    /logger\./,
    /this\.logger\./,
    /SecurityMiddleware/,
    /JWT/,
    /Auth/,
    /Error/,
    /❌/,
    /⚠️/,
    /🚫/
  ]
};

// Directorios a procesar
const DIRECTORIES = [
  'cook-backend/src',
  'cook-frontend/src'
];

class LogCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      logsRemoved: 0,
      logsConverted: 0,
      errors: []
    };
  }

  /**
   * Verificar si un log debe mantenerse
   */
  shouldKeepLog(line) {
    return CONFIG.KEEP_PATTERNS.some(pattern => pattern.test(line));
  }

  /**
   * Limpiar logs en un archivo
   */
  cleanFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let removedCount = 0;
      let convertedCount = 0;

      // Dividir en líneas para análisis individual
      const lines = content.split('\n');
      const cleanedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Si contiene console.log
        if (line.includes('console.log')) {
          // Verificar si debe mantenerse
          if (this.shouldKeepLog(line)) {
            cleanedLines.push(line);
            continue;
          }

          // Verificar si es un log simple de debugging (eliminar)
          const isSimpleDebugLog = 
            line.includes('🔍') || 
            line.includes('✅') || 
            line.includes('🔧') || 
            line.includes('📊') ||
            line.includes('🎯') ||
            line.includes('⚙️') ||
            /console\.log\([^)]*\);\s*$/.test(line.trim());

          if (isSimpleDebugLog) {
            removedCount++;
            continue; // Omitir esta línea
          }

          // Si es un log importante, convertir a condicional
          if (line.includes('🚀') || line.includes('Starting') || line.includes('Iniciando')) {
            const indent = line.match(/^(\s*)/)[1];
            cleanedLines.push(`${indent}if (process.env.NODE_ENV === 'development') {`);
            cleanedLines.push(`${indent}  ${line.trim()}`);
            cleanedLines.push(`${indent}}`);
            convertedCount++;
            continue;
          }
        }

        cleanedLines.push(line);
      }

      // Unir líneas y aplicar patrones de limpieza adicionales
      content = cleanedLines.join('\n');

      // Aplicar patrones de eliminación
      CONFIG.REMOVE_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          removedCount += matches.length;
          content = content.replace(pattern, '');
        }
      });

      // Aplicar patrones condicionales
      CONFIG.CONDITIONAL_PATTERNS.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
          convertedCount += matches.length;
          content = content.replace(pattern, replacement);
        }
      });

      // Limpiar líneas vacías múltiples
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Solo escribir si hubo cambios
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.basename(filePath)}: ${removedCount} logs eliminados, ${convertedCount} convertidos`);
      }

      this.stats.logsRemoved += removedCount;
      this.stats.logsConverted += convertedCount;
      this.stats.filesProcessed++;

    } catch (error) {
      this.stats.errors.push(`${filePath}: ${error.message}`);
      console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
  }

  /**
   * Procesar directorio recursivamente
   */
  processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️ Directorio no encontrado: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Omitir node_modules, .git, dist, build
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          this.processDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Procesar archivos JS, TS, JSX, TSX
        const ext = path.extname(item).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          this.cleanFile(fullPath);
        }
      }
    }
  }

  /**
   * Ejecutar limpieza completa
   */
  run() {
    console.log('🧹 Iniciando limpieza de logs excesivos...\n');

    const startTime = Date.now();

    // Procesar cada directorio
    DIRECTORIES.forEach(dir => {
      const fullPath = path.resolve(dir);
      console.log(`📁 Procesando: ${dir}`);
      this.processDirectory(fullPath);
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Mostrar estadísticas finales
    console.log('\n📊 RESUMEN DE LIMPIEZA:');
    console.log(`├─ Archivos procesados: ${this.stats.filesProcessed}`);
    console.log(`├─ Logs eliminados: ${this.stats.logsRemoved}`);
    console.log(`├─ Logs convertidos a condicionales: ${this.stats.logsConverted}`);
    console.log(`├─ Errores: ${this.stats.errors.length}`);
    console.log(`└─ Tiempo: ${duration}s`);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.stats.errors.forEach(error => console.log(`   ${error}`));
    }

    console.log('\n✅ Limpieza completada!');
    console.log('💡 Los logs críticos (errores, seguridad) se mantuvieron intactos.');
    console.log('💡 Los logs de desarrollo ahora son condicionales (NODE_ENV=development).');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const cleaner = new LogCleaner();
  cleaner.run();
}

module.exports = LogCleaner;
