import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgetPass from './pages/ForgetPass';
import Profile from './pages/Profile';
import Records from './pages/Records';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgetpass" element={<ForgetPass />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/records" element={<Records />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}
