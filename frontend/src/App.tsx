import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { authAPI } from './services/api';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowEditorPage from './pages/WorkflowEditorPage';
import ExecutionsPage from './pages/ExecutionsPage';
import ExecutionDetailPage from './pages/ExecutionDetailPage';

// Layout
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Fetch current user
      authAPI.getCurrentUser()
        .then(({ user }) => setUser(user))
        .catch(() => {
          // Invalid token
          useAuthStore.getState().logout();
        });
    }
  }, [token, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/workflows/new" element={<WorkflowEditorPage />} />
          <Route path="/workflows/:id/edit" element={<WorkflowEditorPage />} />
          <Route path="/executions" element={<ExecutionsPage />} />
          <Route path="/executions/:id" element={<ExecutionDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
