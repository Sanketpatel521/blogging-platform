import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('ErrorLoggingMiddleware');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;

    res.on('finish', () => {
      const { statusCode } = res;

      if (statusCode >= 400) {
        let logMessage = `Method: ${method} URL: ${originalUrl} Status Code: ${statusCode}`
        if(Object.keys(body).length !== 0)
        logMessage += `Request body: ${JSON.stringify(body, null, 2)}`
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
