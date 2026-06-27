import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { SupervisorLiveMonitoring } from './pages/SupervisorLiveMonitoring';
import { AgentActiveInteraction } from './pages/AgentActiveInteraction';
import { QA_CallEvaluation } from './pages/QA_CallEvaluation';
import { MIS_AnalyticsDashboard } from './pages/MIS_AnalyticsDashboard';
import { AutomationWorkflow } from './pages/AutomationWorkflow';
import { IntegrationSettings } from './pages/IntegrationSettings';

// Mock current role for demo purposes
const currentRole = 'Administrator' as const;

export const App: React.FC = () => (
  <Router>
    <MainLayout role={currentRole}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/supervisor/live" element={<SupervisorLiveMonitoring />} />
        <Route path="/agent/interaction" element={<AgentActiveInteraction />} />
        <Route path="/qa/evaluation" element={<QA_CallEvaluation />} />
        <Route path="/mis/analytics" element={<MIS_AnalyticsDashboard />} />
        <Route path="/automation" element={<AutomationWorkflow />} />
        <Route path="/settings/integration" element={<IntegrationSettings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  </Router>
);

export default App;
