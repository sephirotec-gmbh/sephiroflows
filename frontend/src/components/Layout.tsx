import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Workflow, Activity, Home } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../services/api';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">SephiroFlows</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.companyName}</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link
            to="/workflows"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/workflows')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Workflow size={20} />
            <span>Workflows</span>
          </Link>
          
          <Link
            to="/executions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive('/executions')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Activity size={20} />
            <span>Executions</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
