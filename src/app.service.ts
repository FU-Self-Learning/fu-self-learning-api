import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('This is a log message');
    this.logger.warn('This is a warning');
    this.logger.error('This is an error');
    this.logger.debug('This is a debug message');
    return 'Hello World!';
  }
}
