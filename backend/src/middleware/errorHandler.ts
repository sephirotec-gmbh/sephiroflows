import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details,
    });
  }
  
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.detail,
    });
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      error: 'Referenced resource does not exist',
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
