import React from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Box, Menu, MenuItem, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

export const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ ml: 240, width: 'calc(100% - 240px)' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <InputBase placeholder="Search…" sx={{ ml: 2, flex: 1, backgroundColor: '#f5f5f5', px: 2, borderRadius: 1 }} />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Box>
        <IconButton color="inherit"><NotificationsIcon /></IconButton>
        <IconButton color="inherit"><SettingsIcon /></IconButton>
        <IconButton onClick={handleMenu} color="inherit"><Avatar /></IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
