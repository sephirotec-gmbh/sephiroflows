import { Request, Response } from 'express';
import { query } from '../config/database';

export const listNodes = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let sql = 'SELECT * FROM node_definitions WHERE status = $1';
    const params: any[] = ['active'];
    
    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    
    sql += ' ORDER BY category, display_name ASC';
    
    const result = await query(sql, params);
    
    return res.json({ nodes: result.rows });
  } catch (error) {
    console.error('List nodes error:', error);
    return res.status(500).json({ error: 'Failed to list nodes' });
  }
};

export const getNode = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    const result = await query(
      'SELECT * FROM node_definitions WHERE node_type = $1 AND status = $2',
      [type, 'active']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    return res.json({ node: result.rows[0] });
  } catch (error) {
    console.error('Get node error:', error);
    return res.status(500).json({ error: 'Failed to get node' });
  }
};
