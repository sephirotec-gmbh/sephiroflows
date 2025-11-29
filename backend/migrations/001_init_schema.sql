-- SephiroFlows Phase 1 MVP Database Schema
-- Core tables for workflow automation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- COMPANIES (Tenants)
-- ====================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status) WHERE deleted_at IS NULL;

-- ====================================
-- USERS
-- ====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    can_edit_workflows BOOLEAN DEFAULT true,
    can_execute_workflows BOOLEAN DEFAULT true,
    can_manage_credentials BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, email)
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- ====================================
-- NODE DEFINITIONS
-- ====================================
CREATE TABLE node_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    category VARCHAR(50) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    input_schema JSONB NOT NULL,
    output_schema JSONB,
    credential_types JSONB,
    execution_handler VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_node_definitions_type ON node_definitions(node_type);
CREATE INDEX idx_node_definitions_category ON node_definitions(category);

-- ====================================
-- WORKFLOWS
-- ====================================
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    nodes JSONB NOT NULL DEFAULT '[]',
    edges JSONB NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_workflows_company ON workflows(company_id);
CREATE INDEX idx_workflows_status ON workflows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_created_by ON workflows(created_by);

-- ====================================
-- WORKFLOW RUNS
-- ====================================
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_data JSONB,
    triggered_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'queued',
    queued_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    execution_time_ms INTEGER,
    error_message TEXT,
    error_node_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_runs_company ON workflow_runs(company_id);
CREATE INDEX idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_created_at ON workflow_runs(created_at);

-- ====================================
-- NODE RUNS
-- ====================================
CREATE TABLE node_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    node_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    execution_time_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_node_runs_workflow_run ON node_runs(workflow_run_id);
CREATE INDEX idx_node_runs_company ON node_runs(company_id);
CREATE INDEX idx_node_runs_status ON node_runs(status);

-- ====================================
-- CREDENTIALS
-- ====================================
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    credential_type VARCHAR(100) NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP,
    UNIQUE(company_id, name)
);

CREATE INDEX idx_credentials_company ON credentials(company_id);
CREATE INDEX idx_credentials_type ON credentials(credential_type);

-- ====================================
-- TRIGGERS FOR AUTO-UPDATE
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at 
    BEFORE UPDATE ON credentials
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SEED DATA: NODE DEFINITIONS
-- ====================================

-- Manual Trigger Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('trigger.manual', 'Manual Trigger', 'trigger', 'Manual Trigger', 'Manually trigger the workflow', '▶️', '#10B981', 
'{"type": "object", "properties": {"data": {"type": "object", "description": "Input data for the workflow"}}}',
'{"type": "object", "properties": {"data": {"type": "object"}}}',
'builtin:trigger:manual');

-- HTTP Request Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('action.http', 'HTTP Request', 'action', 'HTTP Request', 'Make HTTP requests to external APIs', '🌐', '#3B82F6',
'{
  "type": "object",
  "properties": {
    "method": {"type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"], "default": "GET"},
    "url": {"type": "string", "description": "URL to send request to"},
    "headers": {"type": "object", "description": "HTTP headers"},
    "body": {"type": "object", "description": "Request body (for POST/PUT/PATCH)"},
    "timeout": {"type": "number", "default": 30000, "description": "Request timeout in milliseconds"}
  },
  "required": ["url"]
}',
'{"type": "object", "properties": {"status": {"type": "number"}, "data": {"type": "object"}, "headers": {"type": "object"}}}',
'builtin:action:http');

-- Data Transform Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('transform.data', 'Data Transform', 'transform', 'Transform Data', 'Transform and manipulate data', '🔄', '#8B5CF6',
'{
  "type": "object",
  "properties": {
    "mapping": {"type": "object", "description": "Data transformation mapping"}
  }
}',
'{"type": "object"}',
'builtin:transform:data');

-- Conditional Logic Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('logic.conditional', 'Conditional', 'logic', 'IF Condition', 'Branch workflow based on conditions', '🔀', '#F59E0B',
'{
  "type": "object",
  "properties": {
    "condition": {"type": "string", "description": "Condition expression to evaluate"},
    "operator": {"type": "string", "enum": ["equals", "not_equals", "greater_than", "less_than", "contains"], "default": "equals"},
    "value": {"type": "string", "description": "Value to compare against"}
  },
  "required": ["condition"]
}',
'{"type": "object", "properties": {"result": {"type": "boolean"}}}',
'builtin:logic:conditional');

-- Set Variable Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('logic.variable', 'Set Variable', 'logic', 'Set Variable', 'Set or update workflow variables', '💾', '#06B6D4',
'{
  "type": "object",
  "properties": {
    "name": {"type": "string", "description": "Variable name"},
    "value": {"type": "string", "description": "Variable value"}
  },
  "required": ["name", "value"]
}',
'{"type": "object", "properties": {"name": {"type": "string"}, "value": {"type": "string"}}}',
'builtin:logic:variable');

-- Send Email Node
INSERT INTO node_definitions (node_type, name, category, display_name, description, icon, color, input_schema, output_schema, execution_handler) VALUES
('action.email', 'Send Email', 'action', 'Send Email', 'Send emails via SMTP', '📧', '#EF4444',
'{
  "type": "object",
  "properties": {
    "to": {"type": "string", "description": "Recipient email address"},
    "subject": {"type": "string", "description": "Email subject"},
    "body": {"type": "string", "description": "Email body (HTML or plain text)"},
    "from": {"type": "string", "description": "Sender email address"},
    "isHtml": {"type": "boolean", "default": false, "description": "Whether body is HTML"}
  },
  "required": ["to", "subject", "body"]
}',
'{"type": "object", "properties": {"messageId": {"type": "string"}, "accepted": {"type": "array"}}}',
'builtin:action:email');

-- ====================================
-- SEED DATA: DEFAULT COMPANY & USER
-- ====================================

-- Insert default company
INSERT INTO companies (id, name, slug, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo', 'active');

-- Insert default user (password: demo123)
-- bcrypt hash of 'demo123' with salt rounds 10
INSERT INTO users (id, company_id, email, name, password_hash, can_edit_workflows, can_execute_workflows, can_manage_credentials)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'demo@sephiroflows.app', 'Demo User', '$2b$10$6aeQppj8kKM0vykKoFiHnehrZo3SJge0TdGknCoXoor.EQJcuXPkW', true, true, true);
