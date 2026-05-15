import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp ? (exception as HttpException).message : 'Internal server error';

    // In production, avoid leaking stack traces or internal details.
    const body: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Optionally include limited debug info when not in production
    if (process.env.NODE_ENV !== 'production') {
      body.debug = { exception };
    }

    response.status(status).send(body);
  }
}
