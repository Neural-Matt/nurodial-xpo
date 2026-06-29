import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2.5 }}>
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: '8px',
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 15,
        flexShrink: 0,
      }}
    >
      N
    </Box>
    {!collapsed && (
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.2 }}>
        NuroDial
      </Typography>
    )}
  </Box>
);
