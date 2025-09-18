import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  
  // Check if user is authenticated
  if (!isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;