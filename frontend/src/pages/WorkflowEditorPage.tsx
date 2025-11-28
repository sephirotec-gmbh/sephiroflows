import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowsAPI, nodesAPI } from '../services/api';
import { Save, Play, ArrowLeft } from 'lucide-react';
import NodeLibrary from '../components/NodeLibrary';
import NodeConfigPanel from '../components/NodeConfigPanel';

const WorkflowEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewWorkflow = !id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [showLibrary, setShowLibrary] = useState(true);

  // Load workflow if editing
  const { data: workflowData } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsAPI.get(id!),
    enabled: !isNewWorkflow,
  });

  // Load available node definitions
  const { data: nodeDefinitions } = useQuery({
    queryKey: ['nodes'],
    queryFn: () => nodesAPI.list(),
  });

  useEffect(() => {
    if (workflowData?.workflow) {
      const workflow = workflowData.workflow;
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');
      
      const workflowNodes = Array.isArray(workflow.nodes) ? workflow.nodes : JSON.parse(workflow.nodes || '[]');
      const workflowEdges = Array.isArray(workflow.edges) ? workflow.edges : JSON.parse(workflow.edges || '[]');
      
      setNodes(workflowNodes);
      setEdges(workflowEdges);
    }
  }, [workflowData, setNodes, setEdges]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        status: 'draft',
      };

      if (isNewWorkflow) {
        return workflowsAPI.create(data);
      } else {
        return workflowsAPI.update(id!, data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      if (isNewWorkflow) {
        navigate(`/workflows/${data.workflow.id}/edit`);
      }
      alert('Workflow saved successfully!');
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (isNewWorkflow) {
        const data = await workflowsAPI.create({
          name: workflowName,
          description: workflowDescription,
          nodes,
          edges,
          status: 'active',
        });
        return workflowsAPI.execute(data.workflow.id, {});
      }
      return workflowsAPI.execute(id!, {});
    },
    onSuccess: (data) => {
      alert(`Workflow execution started! Run ID: ${data.workflowRun.id}`);
      navigate(`/executions/${data.workflowRun.id}`);
    },
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeDrop = useCallback(
    (nodeType: string, nodeDefinition: any) => {
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      };

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: nodeDefinition.display_name,
          nodeType: nodeType,
          parameters: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        )
      );
    },
    [setNodes]
  );

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    saveMutation.mutate();
  };

  const handleExecute = () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the workflow');
      return;
    }
    if (confirm('Execute this workflow now?')) {
      executeMutation.mutate();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-semibold border-none focus:ring-0 focus:outline-none"
              placeholder="Workflow Name"
            />
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-sm text-gray-600 border-none focus:ring-0 focus:outline-none"
              placeholder="Add description..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExecute}
            disabled={executeMutation.isPending}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Play size={16} />
            <span>Execute</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saveMutation.isPending ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        {/* Node Library */}
        {showLibrary && (
          <NodeLibrary
            nodeDefinitions={nodeDefinitions?.nodes || []}
            onNodeSelect={handleNodeDrop}
            onClose={() => setShowLibrary(false)}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {!showLibrary && (
            <button
              onClick={() => setShowLibrary(true)}
              className="absolute top-4 left-4 bg-white shadow-lg px-4 py-2 rounded-lg hover:bg-gray-50 transition z-10"
            >
              Show Node Library
            </button>
          )}
        </div>

        {/* Node Config Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            nodeDefinitions={nodeDefinitions?.nodes || []}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowEditorPage;
