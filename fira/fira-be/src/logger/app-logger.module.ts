import { Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
