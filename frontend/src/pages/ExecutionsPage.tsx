import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { executionsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

const ExecutionsPage = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsAPI.list({ limit: 50 }),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const executions = data?.executions || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'running':
        return <Loader className="text-blue-500 animate-spin" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading executions...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Workflow Executions</h1>

      {executions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No executions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.map((execution) => (
                <tr
                  key={execution.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/executions/${execution.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(execution.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(execution.status)
                      }`}>
                        {execution.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {execution.trigger_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.execution_time_ms
                      ? `${(execution.execution_time_ms / 1000).toFixed(2)}s`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/executions/${execution.id}`);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExecutionsPage;
