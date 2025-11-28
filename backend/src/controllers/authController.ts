import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { redisClient } from '../config/redis';
import { AuthenticatedRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, companyName } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create company
    const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const companyResult = await query(
      'INSERT INTO companies (name, slug, status) VALUES ($1, $2, $3) RETURNING id',
      [companyName, companySlug, 'active']
    );
    
    const companyId = companyResult.rows[0].id;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const userResult = await query(
      `INSERT INTO users (company_id, email, name, password_hash, can_edit_workflows, can_execute_workflows, can_manage_credentials)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, company_id`,
      [companyId, email, name, passwordHash, true, true, true]
    );
    
    const user = userResult.rows[0];
    
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.company_id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    // Find user
    const result = await query(
      `SELECT u.id, u.email, u.name, u.password_hash, u.company_id,
              u.can_edit_workflows, u.can_execute_workflows, u.can_manage_credentials,
              c.name as company_name, c.status as company_status
       FROM users u
       JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1 AND c.deleted_at IS NULL`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check company status
    if (user.company_status !== 'active') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const sessionId = uuidv4();
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      companyId: user.company_id,
      permissions: {
        canEditWorkflows: user.can_edit_workflows,
        canExecuteWorkflows: user.can_execute_workflows,
        canManageCredentials: user.can_manage_credentials,
      },
    };
    
    // Store in Redis (24 hours TTL)
    await redisClient.setEx(
      `session:${sessionId}`,
      86400,
      JSON.stringify(sessionData)
    );
    
    // Generate JWT
    const token = jwt.sign({ sessionId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.company_id,
        companyName: user.company_name,
        permissions: sessionData.permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      await redisClient.del(`session:${decoded.sessionId}`);
    }
    
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    return res.json({ message: 'Logout successful' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
};
