import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/records" replace />;
  }
  
  return children;
};

export default PublicRoute;
