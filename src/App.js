import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CrawlSources from './pages/CrawlSources/CrawlSources';
import CrawlData from './pages/CrawlData/CrawlData';
import Users from './pages/Users/Users';
import ActorUploads from './pages/ActorUploads/ActorUploads';
import RunLogs from './pages/RunLogs/RunLogs';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sources" element={<CrawlSources />} />
            <Route path="data" element={<CrawlData />} />
            <Route path="users" element={<Users />} />
            <Route path="actors" element={<ActorUploads />} />
            <Route path="logs" element={<RunLogs />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App; 