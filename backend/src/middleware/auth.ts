import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { redisClient } from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in Authorization header or cookie
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if session exists in Redis
    const sessionData = await redisClient.get(`session:${decoded.sessionId}`);
    if (!sessionData) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }
    
    const session = JSON.parse(sessionData);
    
    // Attach user info to request
    req.user = {
      id: session.userId,
      email: session.email,
      name: session.name,
      companyId: session.companyId,
      permissions: session.permissions,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requirePermission = (permission: 'canEditWorkflows' | 'canExecuteWorkflows' | 'canManageCredentials') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.permissions[permission]) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
