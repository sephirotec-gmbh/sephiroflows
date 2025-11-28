export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  permissions: {
    canEditWorkflows: boolean;
    canExecuteWorkflows: boolean;
    canManageCredentials: boolean;
  };
}

export interface Workflow {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_by: string;
  status: 'draft' | 'active' | 'paused';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    parameters: any;
    credentialId?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface NodeDefinition {
  id: string;
  node_type: string;
  name: string;
  version: string;
  category: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  input_schema: any;
  output_schema: any;
  execution_handler: string;
  status: string;
}

export interface WorkflowRun {
  id: string;
  company_id: string;
  workflow_id: string;
  trigger_type: string;
  trigger_data?: any;
  triggered_by?: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'canceled';
  queued_at: string;
  started_at?: string;
  finished_at?: string;
  execution_time_ms?: number;
  error_message?: string;
  error_node_id?: string;
  created_at: string;
}

export interface NodeRun {
  id: string;
  company_id: string;
  workflow_run_id: string;
  node_id: string;
  node_type: string;
  node_name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at?: string;
  finished_at?: string;
  execution_time_ms?: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  created_at: string;
}
