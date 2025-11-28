import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { workflowsAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

const WorkflowsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsAPI.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  const workflows = data?.workflows || [];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
        <button
          onClick={() => navigate('/workflows/new')}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={20} />
          <span>New Workflow</span>
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No workflows yet</p>
          <button
            onClick={() => navigate('/workflows/new')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {workflow.description || 'No description'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>Created: {new Date(workflow.created_at).toLocaleDateString()}</p>
                  <p>Updated: {new Date(workflow.updated_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 transition"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    disabled={deletingId === workflow.id}
                    className="flex items-center justify-center bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
