import type { ComponentType, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { allNavLeaves } from './navConfig';
import { ComingSoonPage } from '../components/common/ComingSoonPage';
import { Dashboard } from '../pages/Dashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { BillingSubscription } from '../pages/admin/BillingSubscription';
import { AutomationWorkflow } from '../pages/admin/AutomationWorkflow';
import { AnalyticsDashboard } from '../pages/admin/AnalyticsDashboard';
import { CallEvaluation } from '../pages/qa/CallEvaluation';
import { ActiveInteraction } from '../pages/agent/ActiveInteraction';
import { LiveMonitoring } from '../pages/supervisor/LiveMonitoring';
import { IntegrationSettings } from '../pages/IntegrationSettings';

// Every built page must be registered here under the exact path it's wired to
// in navConfig.ts. Any nav leaf path not listed here renders ComingSoonPage.
const builtPages: Record<string, ComponentType> = {
  '/dashboard': Dashboard,
  '/admin/users': UserManagement,
  '/admin/billing': BillingSubscription,
  '/admin/automation': AutomationWorkflow,
  '/admin/analytics': AnalyticsDashboard,
  '/mis/analytics': AnalyticsDashboard,
  '/qa/evaluation': CallEvaluation,
  '/agent/interaction': ActiveInteraction,
  '/supervisor/live': LiveMonitoring,
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
