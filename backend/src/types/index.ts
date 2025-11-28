import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    companyId: string;
    permissions: {
      canEditWorkflows: boolean;
      canExecuteWorkflows: boolean;
      canManageCredentials: boolean;
    };
  };
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  name: string;
  password_hash: string;
  can_edit_workflows: boolean;
  can_execute_workflows: boolean;
  can_manage_credentials: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
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
  credential_types?: any;
  execution_handler: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Workflow {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_by: string;
  status: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
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

export interface WorkflowRun {
  id: string;
  company_id: string;
  workflow_id: string;
  trigger_type: string;
  trigger_data?: any;
  triggered_by?: string;
  status: string;
  queued_at: Date;
  started_at?: Date;
  finished_at?: Date;
  execution_time_ms?: number;
  error_message?: string;
  error_node_id?: string;
  created_at: Date;
}

export interface NodeRun {
  id: string;
  company_id: string;
  workflow_run_id: string;
  node_id: string;
  node_type: string;
  node_name: string;
  status: string;
  started_at?: Date;
  finished_at?: Date;
  execution_time_ms?: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  created_at: Date;
}

export interface ExecutionContext {
  workflowRunId: string;
  companyId: string;
  userId?: string;
  variables: Record<string, any>;
  nodeOutputs: Record<string, any>;
  triggerData: any;
}
