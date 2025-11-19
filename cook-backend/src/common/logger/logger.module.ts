import { Module, Global } from '@nestjs/common';
import { SimpleLoggerService } from './simple-logger.service';

@Global()
@Module({
  providers: [SimpleLoggerService],
  exports: [SimpleLoggerService],
})
export class LoggerModule {}
