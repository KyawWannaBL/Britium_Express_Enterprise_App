import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = isHttp ? exception.getResponse() : null;
    let message = "Internal server error";
    let details: unknown = undefined;
    if (typeof raw === "string") { message = raw; } 
    else if (raw && typeof raw === "object") {
      const rawObj = raw as Record<string, unknown>;
      message = typeof rawObj.message === "string" ? rawObj.message : message;
      details = rawObj;
    } else if (exception instanceof Error) { message = exception.message; }
    response.status(status).json({ ok: false, statusCode: status, message, details, path: request.originalUrl, timestamp: new Date().toISOString() });
  }
}
