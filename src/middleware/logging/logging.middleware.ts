import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;

    // Capture start time
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.log(
        `Method: ${method} URL: ${originalUrl} Status Code: ${statusCode} Response Time: ${responseTime} ms`,
      );
    });

    next();
  }
}
