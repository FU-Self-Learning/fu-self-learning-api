import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ErrorLogType } from '../logger/logger.type';
import { ErrorMessage } from '../constants/error-message.constant';
import { SystemLogger } from '../logger/system-logger';
import { CustomRequest } from '../types/request.type';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
  constructor(private readonly systemLogger: SystemLogger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    /* ------------- Define requestId and log debug  -------------*/
    const requestId = uuidv4();
    Logger.error({ requestId, exception });
    /* ------------- Define requestId and log debug  -------------*/

    /* ------------- Get response and request  -------------*/
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CustomRequest>();
    /* ------------- Get response and request  -------------*/
  

    /* ------------- Get request infomation  -------------*/
    const uid = request.user?.uid;
    const forwardedIP = request.headers['x-forwarded-for']?.toString().split(',')[0];
    const userIP = forwardedIP || request.socket.remoteAddress;
    const metadata = {
      requestId,
      requestData: {
        userIP,
        method: request.method,
        url: request.originalUrl,
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params,
      },
      exceptionData: exception,
    };
    /* ------------- Get request infomation  -------------*/
  

    /* ------------- Get exception response infomation  -------------*/
    const exceptionResponse = (exception.getResponse?.() as any) || {};
    const errorMessage = exceptionResponse.message || exception.message;
    const description = exceptionResponse.description;
    const statusCode =
      exceptionResponse.statusCode ||
      exception.getStatus?.() ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    /* ------------- Get exception response infomation  -------------*/

    const handleErrorResponse = (
      type: ErrorLogType,
      statusCode: number,
      errorMessage: string,
      data: any[] = [],
      description?: string,
    ) => {
      this.logError(type, errorMessage, uid, metadata);
      response.status(statusCode).json({
        statusCode,
        errorMessage,
        data: data[0] ? data : description,
      });
    };
    const handlers: {
      condition: boolean;
      type: ErrorLogType;
      errorMessage: string;
      data?: any[];
    }[] = [
      {
        condition: [
          statusCode === HttpStatus.UNAUTHORIZED,
          statusCode === HttpStatus.FORBIDDEN,
        ].some(Boolean),
        type: 'AUTH',
        errorMessage,
      },
      {
        condition: Array.isArray(errorMessage),
        type: 'REQUEST',
        errorMessage: ErrorMessage.INVALID_REQUEST_INPUT,
        data: errorMessage,
      },
      {
        condition: statusCode === HttpStatus.BAD_REQUEST,
        type: 'REQUEST',
        errorMessage,
        data: [exception.cause],
      },
      {
        condition: statusCode === HttpStatus.TOO_MANY_REQUESTS,
        type: 'REQUEST',
        errorMessage: ErrorMessage.TOO_MANY_REQUEST,
      },
      {
        condition: statusCode === HttpStatus.NOT_FOUND,
        type: 'REQUEST',
        errorMessage: ErrorMessage.LINK_NOT_FOUND,
        data: [errorMessage],
      },
    ];

    for (const { condition, type, errorMessage, data } of handlers) {
      if (condition) {
        return handleErrorResponse(
          type,
          statusCode,
          errorMessage,
          data,
          description,
        );
      }
    }
    handleErrorResponse('INTERNAL', statusCode, ErrorMessage.INTERNAL_ERROR, [
      errorMessage,
    ]);
  }

  logError(type: ErrorLogType, message: string, uid: string, metadata: any) {
    this.systemLogger.error(type, message, uid, metadata);
  }
}
