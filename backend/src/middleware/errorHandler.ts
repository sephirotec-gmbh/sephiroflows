import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      details: err.details,
    });
    return;
  }
  
  if (err.code === '23505') { // PostgreSQL unique violation
    res.status(409).json({
      error: 'Resource already exists',
      details: err.detail,
    });
    return;
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key violation
    res.status(400).json({
      error: 'Referenced resource does not exist',
    });
    return;
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
