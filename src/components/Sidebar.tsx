import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Divider } from '@mui/material';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import { Logo } from '../branding/Logo';
import { useAuth } from '../context/useAuth';
import { ROLE_LABELS } from '../context/authStore';
import { navConfigByRole, type NavNode } from '../config/navConfig';
import { colors, SIDEBAR_WIDTH } from '../theme/palette';
import type { Role } from '../types';

function isNodeActive(node: NavNode, pathname: string): boolean {
  if (node.path) return pathname === node.path;
  return node.children?.some((child) => isNodeActive(child, pathname)) ?? false;
}

function NavBadge({ count }: { count: number }) {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: '999px',
        minWidth: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 0.5,
      }}
    >
      {count}
    </Box>
  );
}

function NavItemRow({ node, depth, pathname }: { node: NavNode; depth: number; pathname: string }) {
  const active = isNodeActive(node, pathname);
  const [open, setOpen] = useState(active);
  const Icon = node.icon;

  if (node.children) {
    return (
      <>
        <ListItemButton
          onClick={() => setOpen((prev) => !prev)}
          sx={{ pl: 2.5 + depth * 1.5, py: 1, color: colors.sidebarText, '&:hover': { bgcolor: colors.sidebarHoverBg } }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={node.label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }} />
          {open ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {node.children.map((child) => (
              <NavItemRow key={child.id} node={child} depth={depth + 1} pathname={pathname} />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItemButton
      component={NavLink}
      to={node.path ?? '#'}
      sx={{
        pl: 2.5 + depth * 1.5,
        py: 1,
        mx: 1,
        my: 0.25,
        borderRadius: 1.5,
        color: active ? colors.sidebarTextActive : colors.sidebarText,
        bgcolor: active ? colors.sidebarActiveBg : 'transparent',
        '&:hover': { bgcolor: active ? colors.sidebarActiveBg : colors.sidebarHoverBg },
      }}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={node.label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 600 : 500 } } }} />
      {node.badge != null && <NavBadge count={node.badge} />}
    </ListItemButton>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mx: 1.5,
        mb: 1,
        px: 2,
        py: 1,
        borderRadius: 1.5,
        border: `1px solid ${colors.sidebarBorder}`,
        color: '#fff',
      }}
    >
      <ListItemIcon sx={{ color: colors.primary, minWidth: 32 }}>
        <ShieldOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={ROLE_LABELS[role]} slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }} />
    </Box>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;
  const items = navConfigByRole[user.role];

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        bgcolor: colors.sidebarBg,
        height: '100vh',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${colors.sidebarBorder}`,
      }}
    >
      <Logo />
      <RoleBadge role={user.role} />
      <Divider sx={{ borderColor: colors.sidebarBorder }} />
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <List disablePadding>
          {items.map((node) => (
            <NavItemRow key={node.id} node={node} depth={0} pathname={pathname} />
          ))}
        </List>
      </Box>
      <Divider sx={{ borderColor: colors.sidebarBorder }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5, p: 1.5, display: 'flex', gap: 1 }}>
          <HelpOutlineOutlined fontSize="small" sx={{ color: colors.primary, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
              Need Help?
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.sidebarText, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
            >
              View documentation or contact support <ChevronRightOutlined sx={{ fontSize: 14 }} />
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
