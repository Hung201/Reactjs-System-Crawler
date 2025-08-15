import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CrawlSources from './pages/CrawlSources/CrawlSources';
import CrawlData from './pages/CrawlData/CrawlData';
import Users from './pages/Users/Users';
import ActorUploads from './pages/ActorUploads/ActorUploads';
import ActorEditor from './pages/ActorEditor/ActorEditor';
import NewActorEditor from './pages/ActorEditor/NewActorEditor';
import BuildLog from './pages/ActorEditor/BuildLog';
import RunLog from './pages/ActorEditor/RunLog';
import RunLogs from './pages/RunLogs/RunLogs';
import Campaigns from './pages/Campaigns/Campaigns';
import CampaignDetail from './pages/Campaigns/CampaignDetail';
import Integrations from './pages/Integrations/Integrations';
import ActorDetail from './pages/Integrations/ActorDetail';
import RunDetail from './pages/Integrations/RunDetail';
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
            <Route path="actors/:id/edit" element={<ActorEditor />} />
            <Route path="actors/:id/build" element={<BuildLog />} />
            <Route path="actors/:id/run" element={<RunLog />} />
            <Route path="actors/new" element={<NewActorEditor />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="integrations/actor/:actorId" element={<ActorDetail />} />
            <Route path="integrations/run/:runId" element={<RunDetail />} />
            <Route path="logs" element={<RunLogs />} />
          </Route>
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App; 