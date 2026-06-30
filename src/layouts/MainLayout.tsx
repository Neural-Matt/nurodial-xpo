import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { AgentSessionProvider } from '../context/AgentSessionContext';
import { SIDEBAR_WIDTH } from '../theme/palette';

export function MainLayout() {
  return (
    <AgentSessionProvider>
      <Box>
        <Sidebar />
        <Box sx={{ width: `calc(100% - ${SIDEBAR_WIDTH}px)`, ml: `${SIDEBAR_WIDTH}px`, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <Box component="main" sx={{ p: 3, bgcolor: '#f0f2f5', flexGrow: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AgentSessionProvider>
  );
}
