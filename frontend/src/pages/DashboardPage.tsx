import { useQuery } from '@tanstack/react-query';
import { workflowsAPI, executionsAPI } from '../services/api';
import { Workflow, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { data: workflowsData } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsAPI.list({ limit: 10 }),
  });

  const { data: executionsData } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsAPI.list({ limit: 10 }),
  });

  const workflows = workflowsData?.workflows || [];
  const executions = executionsData?.executions || [];

  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const successCount = executions.filter((e) => e.status === 'success').length;
  const failedCount = executions.filter((e) => e.status === 'failed').length;
  const runningCount = executions.filter((e) => e.status === 'running').length;

  const stats = [
    { name: 'Total Workflows', value: workflows.length, icon: Workflow, color: 'blue' },
    { name: 'Active Workflows', value: activeWorkflows, icon: CheckCircle, color: 'green' },
    { name: 'Successful Runs', value: successCount, icon: CheckCircle, color: 'green' },
    { name: 'Failed Runs', value: failedCount, icon: XCircle, color: 'red' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`text-${stat.color}-500`} size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Workflows</h2>
          <div className="space-y-3">
            {workflows.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{workflow.name}</p>
                  <p className="text-sm text-gray-500">{workflow.status}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Executions</h2>
          <div className="space-y-3">
            {executions.slice(0, 5).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{execution.trigger_type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(execution.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  execution.status === 'success' ? 'bg-green-100 text-green-800' :
                  execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                  execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {execution.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
