import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from '../../utils/custom-error';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof CustomError) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception.response?.error === 'Bad Request') {
      status = exception.response.statusCode;
      message = exception.response.message;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
