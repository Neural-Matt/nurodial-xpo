import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { SIDEBAR_WIDTH } from '../theme/palette';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box>
      <Sidebar />
      <Box sx={{ width: `calc(100% - ${SIDEBAR_WIDTH}px)`, ml: `${SIDEBAR_WIDTH}px` }}>
        <TopBar />
        <Box component="main" sx={{ p: 3, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
