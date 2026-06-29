import { useState, type MouseEvent } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Box, Menu, MenuItem, Avatar, Typography, Badge } from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useRole } from '../context/useRole';
import { ROLE_LABELS } from '../context/roleStore';

export function TopBar() {
  const { role, displayName } = useRole();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Toolbar>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 1.5,
            px: 1.5,
            maxWidth: 420,
          }}
        >
          <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase placeholder="Search accounts, contacts, deals..." sx={{ flex: 1, fontSize: 14, py: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.disabled', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 0.5, px: 0.5 }}>
            ⌘K
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit"><InfoOutlined /></IconButton>
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsOutlined />
          </Badge>
        </IconButton>
        <IconButton onClick={handleMenu} sx={{ ml: 1, gap: 1, borderRadius: 2, px: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>{initials}</Avatar>
          <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{displayName}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>{ROLE_LABELS[role]}</Typography>
          </Box>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>Profile</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
