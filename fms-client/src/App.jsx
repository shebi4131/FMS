import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MovementPage from "./pages/MovementPage";
import LedgerPage from "./pages/LedgerPage";
import ImportPage from "./pages/ImportPage";
import SettingsPage from "./pages/SettingsPage";
import Profile from "./pages/Profile";
import ForgetPass from "./pages/ForgetPass";

function Splash() {
  return <div className="splash"><div className="splash-mark">F</div><h1>File Registry</h1><p>Secure document movement & record intelligence</p><div className="splash-loader"><span /></div></div>;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  useEffect(() => { const id = setTimeout(() => setBooting(false), 1150); return () => clearTimeout(id); }, []);
  if (booting) return <Splash />;
  const protectedPage = (node) => <ProtectedRoute>{node}</ProtectedRoute>;
  return <BrowserRouter><Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/forgetpass" element={<PublicRoute><ForgetPass /></PublicRoute>} />
    <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
    <Route path="/daily-movement" element={protectedPage(<MovementPage module="Daily" />)} />
    <Route path="/extended-custody" element={protectedPage(<MovementPage module="Extended" />)} />
    <Route path="/ledger" element={protectedPage(<LedgerPage />)} />
    <Route path="/import" element={protectedPage(<ImportPage />)} />
    <Route path="/settings" element={protectedPage(<SettingsPage />)} />
    <Route path="/profile" element={protectedPage(<Profile />)} />
    <Route path="/records" element={<Navigate to="/daily-movement" replace />} />
    <Route path="/home" element={<Navigate to="/daily-movement" replace />} />
    <Route path="/register" element={<Navigate to="/ledger" replace />} />
    <Route path="/usermanagement" element={<Navigate to="/settings" replace />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter>;
}
