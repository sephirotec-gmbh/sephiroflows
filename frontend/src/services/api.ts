import axios from 'axios';
import { User, Workflow, NodeDefinition, WorkflowRun, NodeRun } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  
  register: async (email: string, password: string, name: string, companyName: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, companyName });
    return data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
  },
  
  getCurrentUser: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Workflows
export const workflowsAPI = {
  list: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ workflows: Workflow[] }> => {
    const { data } = await api.get('/workflows', { params });
    return data;
  },
  
  get: async (id: string): Promise<{ workflow: Workflow }> => {
    const { data } = await api.get(`/workflows/${id}`);
    return data;
  },
  
  create: async (workflow: Partial<Workflow>): Promise<{ workflow: Workflow }> => {
    const { data } = await api.post('/workflows', workflow);
    return data;
  },
  
  update: async (id: string, workflow: Partial<Workflow>): Promise<{ workflow: Workflow }> => {
    const { data } = await api.put(`/workflows/${id}`, workflow);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/workflows/${id}`);
  },
  
  execute: async (id: string, triggerData?: any): Promise<{ workflowRun: WorkflowRun; execution: any }> => {
    const { data } = await api.post(`/workflows/${id}/execute`, { triggerData });
    return data;
  },
};

// Nodes
export const nodesAPI = {
  list: async (category?: string): Promise<{ nodes: NodeDefinition[] }> => {
    const { data } = await api.get('/nodes', { params: { category } });
    return data;
  },
  
  get: async (type: string): Promise<{ node: NodeDefinition }> => {
    const { data } = await api.get(`/nodes/${type}`);
    return data;
  },
};

// Executions
export const executionsAPI = {
  list: async (params?: { workflowId?: string; status?: string; limit?: number; offset?: number }): Promise<{ executions: WorkflowRun[] }> => {
    const { data } = await api.get('/executions', { params });
    return data;
  },
  
  get: async (id: string): Promise<{ execution: WorkflowRun }> => {
    const { data } = await api.get(`/executions/${id}`);
    return data;
  },
  
  getLogs: async (id: string): Promise<{ logs: NodeRun[] }> => {
    const { data } = await api.get(`/executions/${id}/logs`);
    return data;
  },
};

export default api;
