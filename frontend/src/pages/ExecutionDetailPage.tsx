import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { executionsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

const ExecutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: executionData, isLoading: executionLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionsAPI.get(id!),
    refetchInterval: (data) => {
      // Stop refetching if execution is finished
      return data?.execution.status === 'running' ? 2000 : false;
    },
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['execution-logs', id],
    queryFn: () => executionsAPI.getLogs(id!),
    refetchInterval: (data) => {
      // Stop refetching if execution is finished
      return executionData?.execution.status === 'running' ? 2000 : false;
    },
  });

  const execution = executionData?.execution;
  const logs = logsData?.logs || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'failed':
        return <XCircle className="text-red-500" size={24} />;
      case 'running':
        return <Loader className="text-blue-500 animate-spin" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
    }
  };

  if (executionLoading || logsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading execution details...</div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Execution not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/executions')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Executions</span>
      </button>

      {/* Execution Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Execution Details</h1>
            <p className="text-gray-600">ID: {execution.id}</p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(execution.status)}
            <span className="text-xl font-semibold capitalize">{execution.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Trigger Type</p>
            <p className="font-medium">{execution.trigger_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Started</p>
            <p className="font-medium">
              {execution.started_at
                ? formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })
                : 'Not started'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {execution.execution_time_ms
                ? `${(execution.execution_time_ms / 1000).toFixed(2)}s`
                : 'In progress...'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {execution.error_message && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error:</p>
            <p className="text-sm mt-1">{execution.error_message}</p>
            {execution.error_node_id && (
              <p className="text-sm mt-1">Failed at node: {execution.error_node_id}</p>
            )}
          </div>
        )}
      </div>

      {/* Node Execution Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Node Execution Logs</h2>
        </div>

        <div className="divide-y">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No logs available</div>
          ) : (
            logs.map((log, index) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{log.node_name || log.node_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        log.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Type: {log.node_type} | Duration: {log.execution_time_ms ? `${log.execution_time_ms}ms` : '-'}
                    </p>

                    {log.error_message && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-2">
                        {log.error_message}
                      </div>
                    )}

                    {log.output_data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
                          View Output Data
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.output_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetailPage;
