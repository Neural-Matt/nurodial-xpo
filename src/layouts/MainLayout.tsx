import React from 'react';
import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import type { Role } from '../types';

interface MainLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ role, children }) => (
  <Box sx={{ display: 'flex' }}>
    <Sidebar currentRole={role} />
    <Box sx={{ flexGrow: 1, ml: '240px' }}>
      <TopBar />
      <Box component="main" sx={{ p: 3, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  </Box>
);
