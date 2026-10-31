import { Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { isAuthenticated } from '../lib/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login?reason=session-expired" replace />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
