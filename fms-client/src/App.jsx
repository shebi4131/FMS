import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgetPass from './pages/ForgetPass';
import Profile from './pages/Profile';
import Records from './pages/Records';
import RecordRoomRegister from './pages/RecordRoomRegister'; // ADD THIS
import UserManagement from './components/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
        {/* ADD THIS */}
        <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              <RecordRoomRegister />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />

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