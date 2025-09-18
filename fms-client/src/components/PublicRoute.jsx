import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  
  // If user is already logged in, redirect to records page
  if (isLoggedIn && token) {
    return <Navigate to="/records" replace />;
  }
  
  return children;
};

export default PublicRoute;