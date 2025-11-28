import { Response } from 'express';
import { query } from '../config/database';
import { AuthenticatedRequest, Workflow } from '../types';
import { WorkflowExecutor } from '../engine/WorkflowExecutor';

export const listWorkflows = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM workflows WHERE company_id = $1 AND deleted_at IS NULL';
    const params: any[] = [companyId];
    
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    sql += ' ORDER BY updated_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    return res.json({ workflows: result.rows });
  } catch (error) {
    console.error('List workflows error:', error);
    return res.status(500).json({ error: 'Failed to list workflows' });
  }
};

export const getWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM workflows WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL',
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    return res.json({ workflow: result.rows[0] });
  } catch (error) {
    console.error('Get workflow error:', error);
    return res.status(500).json({ error: 'Failed to get workflow' });
  }
};

export const createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { name, description, nodes = [], edges = [], settings = {} } = req.body;
    
    const result = await query(
      `INSERT INTO workflows (company_id, name, description, created_by, status, nodes, edges, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, name, description, userId, 'draft', JSON.stringify(nodes), JSON.stringify(edges), JSON.stringify(settings)]
    );
    
    return res.status(201).json({ workflow: result.rows[0] });
  } catch (error) {
    console.error('Create workflow error:', error);
    return res.status(500).json({ error: 'Failed to create workflow' });
  }
};

export const updateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 1;
    
    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      params.push(updates.description);
    }
    if (updates.nodes !== undefined) {
      updateFields.push(`nodes = $${paramCount++}`);
      params.push(JSON.stringify(updates.nodes));
    }
    if (updates.edges !== undefined) {
      updateFields.push(`edges = $${paramCount++}`);
      params.push(JSON.stringify(updates.edges));
    }
    if (updates.settings !== undefined) {
      updateFields.push(`settings = $${paramCount++}`);
      params.push(JSON.stringify(updates.settings));
    }
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      params.push(updates.status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    params.push(id, companyId);
    const sql = `UPDATE workflows SET ${updateFields.join(', ')}, updated_at = NOW()
                 WHERE id = $${paramCount++} AND company_id = $${paramCount++} AND deleted_at IS NULL
                 RETURNING *`;
    
    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    return res.json({ workflow: result.rows[0] });
  } catch (error) {
    console.error('Update workflow error:', error);
    return res.status(500).json({ error: 'Failed to update workflow' });
  }
};

export const deleteWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    
    const result = await query(
      'UPDATE workflows SET deleted_at = NOW() WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    return res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    return res.status(500).json({ error: 'Failed to delete workflow' });
  }
};

export const executeWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { id } = req.params;
    const { triggerData = {} } = req.body;
    
    // Get workflow
    const workflowResult = await query(
      'SELECT * FROM workflows WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL',
      [id, companyId]
    );
    
    if (workflowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const workflow = workflowResult.rows[0];
    
    if (workflow.status !== 'active' && workflow.status !== 'draft') {
      return res.status(400).json({ error: 'Workflow is not active' });
    }
    
    // Create workflow run
    const runResult = await query(
      `INSERT INTO workflow_runs (company_id, workflow_id, trigger_type, trigger_data, triggered_by, status, queued_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [companyId, id, 'manual', JSON.stringify(triggerData), userId, 'queued']
    );
    
    const workflowRun = runResult.rows[0];
    
    // Execute workflow synchronously (Phase 1 - no queue)
    const executor = new WorkflowExecutor(workflow, workflowRun, companyId);
    const executionResult = await executor.execute(triggerData);
    
    // Return the completed run
    const completedRunResult = await query(
      'SELECT * FROM workflow_runs WHERE id = $1',
      [workflowRun.id]
    );
    
    return res.status(201).json({
      workflowRun: completedRunResult.rows[0],
      execution: executionResult,
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    return res.status(500).json({ error: 'Failed to execute workflow' });
  }
};
