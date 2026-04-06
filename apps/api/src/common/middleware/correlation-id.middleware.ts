import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    correlationId?: string;
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
    req.correlationId = correlationId;
    res.setHeader("x-correlation-id", correlationId);
    next();
  }
}
