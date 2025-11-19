import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SimpleLoggerService {
  private readonly logger = new Logger('CookSync');
  private isDev = process.env.NODE_ENV === 'development';

  // Solo logs críticos en producción
  info(message: string, context?: any) {
    if (this.isDev) {
      this.logger.log(`ℹ️ ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  success(message: string, context?: any) {
    if (this.isDev) {
      this.logger.log(`✅ ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  // Siempre mostrar errores y advertencias
  error(message: string, error?: any) {
    this.logger.error(`❌ ${message}`, error?.stack || error);
  }

  warn(message: string, context?: any) {
    this.logger.warn(`⚠️ ${message}`, context ? JSON.stringify(context) : '');
  }

  // Logs de seguridad siempre visibles
  security(message: string, context?: any) {
    this.logger.warn(`🔒 ${message}`, context ? JSON.stringify(context) : '');
  }
}
