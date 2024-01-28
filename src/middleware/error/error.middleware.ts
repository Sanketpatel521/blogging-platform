import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { CustomError } from 'src/util/custom-error';

@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction) {
    try {
      next();
    } catch (error) {
      let message = 'Internal server error';
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      if (error instanceof CustomError) {
        const customError = error as CustomError;
        message = customError.message;
        statusCode = customError.statusCode;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
