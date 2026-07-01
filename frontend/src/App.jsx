import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import Messages from './pages/Messages';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('swap_token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/browse" element={
        <ProtectedRoute>
          <Browse />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/messages/:matchId" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
