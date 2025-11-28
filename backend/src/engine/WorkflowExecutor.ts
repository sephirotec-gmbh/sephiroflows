/**
 * Workflow Executor - Phase 1 MVP
 * Simple synchronous execution of workflows
 */

import { query } from '../config/database';
import { ExecutionContext, WorkflowNode, WorkflowEdge } from '../types';
import { ExpressionEvaluator } from './ExpressionEvaluator';
import { NodeExecutor } from './NodeExecutor';

export class WorkflowExecutor {
  private workflow: any;
  private workflowRun: any;
  private companyId: string;
  private context: ExecutionContext;
  private nodeExecutor: NodeExecutor;

  constructor(workflow: any, workflowRun: any, companyId: string) {
    this.workflow = workflow;
    this.workflowRun = workflowRun;
    this.companyId = companyId;
    
    this.context = {
      workflowRunId: workflowRun.id,
      companyId,
      variables: {},
      nodeOutputs: {},
      triggerData: {},
    };
    
    this.nodeExecutor = new NodeExecutor();
  }

  async execute(triggerData: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.context.triggerData = triggerData;
      
      // Update run status to 'running'
      await query(
        'UPDATE workflow_runs SET status = $1, started_at = NOW() WHERE id = $2',
        ['running', this.workflowRun.id]
      );

      const nodes: WorkflowNode[] = Array.isArray(this.workflow.nodes) 
        ? this.workflow.nodes 
        : JSON.parse(this.workflow.nodes || '[]');
        
      const edges: WorkflowEdge[] = Array.isArray(this.workflow.edges)
        ? this.workflow.edges
        : JSON.parse(this.workflow.edges || '[]');

      // Build execution order (topological sort)
      const executionOrder = this.getExecutionOrder(nodes, edges);

      // Execute nodes in order
      for (const node of executionOrder) {
        await this.executeNode(node);
      }

      const executionTime = Date.now() - startTime;

      // Update run status to 'success'
      await query(
        'UPDATE workflow_runs SET status = $1, finished_at = NOW(), execution_time_ms = $2 WHERE id = $3',
        ['success', executionTime, this.workflowRun.id]
      );

      return {
        status: 'success',
        executionTime,
        outputs: this.context.nodeOutputs,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      console.error('Workflow execution error:', error);
      
      // Update run status to 'failed'
      await query(
        'UPDATE workflow_runs SET status = $1, finished_at = NOW(), execution_time_ms = $2, error_message = $3 WHERE id = $4',
        ['failed', executionTime, error.message, this.workflowRun.id]
      );

      return {
        status: 'failed',
        executionTime,
        error: error.message,
      };
    }
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    const startTime = Date.now();
    
    // Create node run record
    const nodeRunResult = await query(
      `INSERT INTO node_runs (company_id, workflow_run_id, node_id, node_type, node_name, status, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [this.companyId, this.workflowRun.id, node.id, node.type, node.data.label || node.type, 'running']
    );
    
    const nodeRunId = nodeRunResult.rows[0].id;

    try {
      // Evaluate parameters using expression evaluator
      const evaluator = new ExpressionEvaluator(this.context);
      const evaluatedParams = evaluator.evaluate(node.data.parameters || {});

      // Execute the node
      const output = await this.nodeExecutor.execute(
        node.type,
        evaluatedParams,
        this.context
      );

      // Store output in context
      this.context.nodeOutputs[node.id] = output;

      const executionTime = Date.now() - startTime;

      // Update node run as successful
      await query(
        `UPDATE node_runs SET status = $1, finished_at = NOW(), execution_time_ms = $2, 
         input_data = $3, output_data = $4 WHERE id = $5`,
        ['success', executionTime, JSON.stringify(evaluatedParams), JSON.stringify(output), nodeRunId]
      );
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      // Update node run as failed
      await query(
        `UPDATE node_runs SET status = $1, finished_at = NOW(), execution_time_ms = $2, error_message = $3 WHERE id = $4`,
        ['failed', executionTime, error.message, nodeRunId]
      );

      // Update workflow run with error
      await query(
        'UPDATE workflow_runs SET error_node_id = $1 WHERE id = $2',
        [node.id, this.workflowRun.id]
      );

      throw error;
    }
  }

  /**
   * Get execution order using topological sort
   */
  private getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    for (const node of nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // Build graph
    for (const edge of edges) {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // Find nodes with no incoming edges (starting nodes)
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    // Topological sort
    const executionOrder: WorkflowNode[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        executionOrder.push(node);
      }

      // Process neighbors
      for (const neighbor of graph.get(nodeId) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles
    if (executionOrder.length !== nodes.length) {
      throw new Error('Workflow contains cycles or disconnected nodes');
    }

    return executionOrder;
  }
}
