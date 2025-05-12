import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { ErrorLogType } from './logger.type';

@Injectable()
export class SystemLogger {
  private readonly logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} [${level.toUpperCase()}]: ${message}`,
        ),
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  error(
    type: ErrorLogType,
    errorMessage: string,
    actor: string,
    metadata?: Record<string, any>,
  ) {
    const logDetailsStored = {
      timestamp: new Date().toISOString(),
      type,
      errorMessage,
      actor: actor || 'unknown',
      service: 'CORE',
      environment: process.env.NODE_ENV || 'development',
      metadata,
    };

    const logStored = JSON.stringify(logDetailsStored, null, 2);

    this.logger.error(logStored);
  }
}
