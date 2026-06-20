import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Global Error Handler caught an exception:', err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected server error occurred';

  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
