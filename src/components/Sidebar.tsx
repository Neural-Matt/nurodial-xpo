import React from 'react';
import { NavLink } from 'react-router-dom';
// NavItem and Role are TypeScript types only; they do not exist at runtime.
// Using a type‑only import prevents the generated JavaScript from trying to
// access a non‑existent export, which caused the "does not provide an export
// named 'NavItem'" error.
import type { NavItem, Role } from '../types';
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// Mock navigation items – real data will come from a service later
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Administrator', 'Agent', 'Supervisor', 'QualityAssurance', 'MIS', 'CampaignManager'] },
  // ...additional items per role can be added here
];

interface SidebarProps {
  currentRole: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole }) => {
  return (
    <Box sx={{ width: 240, bgcolor: 'navy.main', color: '#fff', height: '100vh', position: 'fixed' }}>
      <List>
        {navItems
          .filter(item => item.roles.includes(currentRole))
          .map(item => (
            <ListItemButton component={NavLink} to={item.path} key={item.path} sx={{ color: '#fff' }}>
              {item.icon && <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
    </Box>
  );
};
