import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgetPass from './pages/ForgetPass';
import Profile from './pages/Profile';
import Records from './pages/Records';
import UserManagement from './components/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - redirect to records if already logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgetpass" 
          element={
            <PublicRoute>
              <ForgetPass />
            </PublicRoute>
          } 
        />

        {/* Protected routes - require login */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/records" 
          element={
            <ProtectedRoute>
              <Records />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usermanagement" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all route for 404 */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              <h1>404 - Page Not Found</h1>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}