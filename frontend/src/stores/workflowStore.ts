import { create } from 'zustand';
import { Workflow, WorkflowNode, WorkflowEdge } from '../types';

interface WorkflowEditorState {
  workflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  setWorkflow: (workflow: Workflow) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  setSelectedNode: (node: WorkflowNode | null) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  removeNode: (nodeId: string) => void;
  clear: () => void;
}

export const useWorkflowStore = create<WorkflowEditorState>((set) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  
  setWorkflow: (workflow) => set({ 
    workflow, 
    nodes: Array.isArray(workflow.nodes) ? workflow.nodes : JSON.parse(workflow.nodes as any || '[]'),
    edges: Array.isArray(workflow.edges) ? workflow.edges : JSON.parse(workflow.edges as any || '[]'),
  }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
  })),
  
  clear: () => set({ workflow: null, nodes: [], edges: [], selectedNode: null }),
}));
