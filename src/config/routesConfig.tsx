import type { ComponentType, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { allNavLeaves } from './navConfig';
import { ComingSoonPage } from '../components/common/ComingSoonPage';
import { Dashboard } from '../pages/Dashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { Campaigns } from '../pages/admin/Campaigns';
import { LeadLists } from '../pages/admin/LeadLists';
import { Dispositions } from '../pages/admin/Dispositions';
import { AutomationWorkflow } from '../pages/admin/AutomationWorkflow';
import { AnalyticsDashboard } from '../pages/admin/AnalyticsDashboard';
import { CallEvaluation } from '../pages/qa/CallEvaluation';
import { ActiveInteraction } from '../pages/agent/ActiveInteraction';
import { LiveMonitoring } from '../pages/supervisor/LiveMonitoring';
import { CallQueues } from '../pages/supervisor/CallQueues';
import { IntegrationSettings } from '../pages/IntegrationSettings';

// Every built page must be registered here under the exact path it's wired to
// in navConfig.ts. Any nav leaf path not listed here renders ComingSoonPage.
const builtPages: Record<string, ComponentType> = {
  '/dashboard': Dashboard,
  '/admin/users': UserManagement,
  '/campaigns/list': Campaigns,
  '/campaigns/leads': LeadLists,
  '/campaigns/dispositions': Dispositions,
  '/admin/automation': AutomationWorkflow,
  '/admin/analytics': AnalyticsDashboard,
  '/qa/evaluation': CallEvaluation,
  '/agent/interaction': ActiveInteraction,
  '/supervisor/live': LiveMonitoring,
  '/supervisor/call-queues': CallQueues,
  '/settings/integration': IntegrationSettings,
};

export function buildRoutes(): ReactElement[] {
  const seen = new Set<string>();
  const routes: ReactElement[] = [];

  for (const node of allNavLeaves()) {
    if (!node.path || seen.has(node.path)) continue;
    seen.add(node.path);
    const Built = builtPages[node.path];
    routes.push(
      <Route
        key={node.path}
        path={node.path}
        element={Built ? <Built /> : <ComingSoonPage title={node.label} />}
      />,
    );
  }

  return routes;
}
