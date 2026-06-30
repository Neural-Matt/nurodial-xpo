import type { ComponentType, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { allNavLeaves } from './navConfig';
import { ComingSoonPage } from '../components/common/ComingSoonPage';
import { Dashboard } from '../pages/Dashboard';
import { Campaigns } from '../pages/admin/Campaigns';
import { Dispositions } from '../pages/admin/Dispositions';
import { AutomationWorkflow } from '../pages/admin/AutomationWorkflow';
import { GlobalSettings } from '../pages/admin/GlobalSettings';
import { Dialer } from '../pages/agent/Dialer';
import { CampaignSelection } from '../pages/agent/CampaignSelection';
import { AvailabilityStatus } from '../pages/agent/AvailabilityStatus';
import { LiveMonitoring } from '../pages/supervisor/LiveMonitoring';
import { AgentMonitoring } from '../pages/supervisor/AgentMonitoring';
import { UserManagement } from '../pages/supervisor/UserManagement';
import { LeadLists } from '../pages/supervisor/LeadLists';
import { AnalyticsDashboard } from '../pages/supervisor/AnalyticsDashboard';

// Every built page must be registered here under the exact path it's wired to
// in navConfig.ts. Any nav leaf path not listed here renders ComingSoonPage.
const builtPages: Record<string, ComponentType> = {
  '/dashboard': Dashboard,
  '/admin/process': AutomationWorkflow,
  '/admin/global-settings': GlobalSettings,
  '/admin/blended-campaign': Campaigns,
  '/admin/dispositions': Dispositions,
  '/supervisor/monitor/live': LiveMonitoring,
  '/supervisor/monitor/agents': AgentMonitoring,
  '/supervisor/manage/users': UserManagement,
  '/supervisor/manage/leads': LeadLists,
  '/supervisor/reports/list': AnalyticsDashboard,
  '/agent/home/dialer': Dialer,
  '/agent/home/campaign-selection': CampaignSelection,
  '/agent/home/availability': AvailabilityStatus,
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
        element={Built ? <Built /> : <ComingSoonPage title={node.label} vicidialMapping={node.vicidialMapping} />}
      />,
    );
  }

  return routes;
}
