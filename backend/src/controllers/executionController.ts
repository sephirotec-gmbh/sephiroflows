import { Response } from 'express';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../types';

export const listExecutions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { workflowId, status, limit = 50, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM workflow_runs WHERE company_id = $1';
    const params: any[] = [companyId];
    
    if (workflowId) {
      params.push(workflowId);
      sql += ` AND workflow_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    return res.json({ executions: result.rows });
  } catch (error) {
    console.error('List executions error:', error);
    return res.status(500).json({ error: 'Failed to list executions' });
  }
};

export const getExecution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM workflow_runs WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    return res.json({ execution: result.rows[0] });
  } catch (error) {
    console.error('Get execution error:', error);
    return res.status(500).json({ error: 'Failed to get execution' });
  }
};

export const getExecutionLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    
    // First verify the execution belongs to the company
    const executionResult = await query(
      'SELECT id FROM workflow_runs WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    if (executionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    // Get node runs (logs)
    const logsResult = await query(
      'SELECT * FROM node_runs WHERE workflow_run_id = $1 ORDER BY created_at ASC',
      [id]
    );
    
    return res.json({ logs: logsResult.rows });
  } catch (error) {
    console.error('Get execution logs error:', error);
    return res.status(500).json({ error: 'Failed to get execution logs' });
  }
};
