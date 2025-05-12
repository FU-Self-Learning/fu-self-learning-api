import { Module } from '@nestjs/common';
import { SystemLogger } from './system-logger';
@Module({
  imports: [],
  providers: [SystemLogger],
  exports: [SystemLogger],
})
export class LoggerModule {}