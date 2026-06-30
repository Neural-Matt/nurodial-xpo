import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, InputBase, Box, Menu, MenuItem, Avatar, Typography, Badge, Chip, Divider, Stack, Tooltip } from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import DialpadOutlined from '@mui/icons-material/DialpadOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import { useAuth } from '../context/useAuth';
import { ROLE_LABELS } from '../context/authStore';
import { useAgentSession } from '../context/useAgentSession';
import { AVAILABILITY_TONE, SELECTABLE_AVAILABILITY, derivedAvailability } from '../context/agentSessionStore';
import { StatusBadge } from './common/StatusBadge';
import { campaigns } from '../services/mock/campaigns';

function AgentQuickActions({ username }: { username: string }) {
  const navigate = useNavigate();
  const { currentCampaignId, availability, activeCall, setCampaign, setAvailability } = useAgentSession();
  const [availAnchor, setAvailAnchor] = useState<null | HTMLElement>(null);
  const [campaignAnchor, setCampaignAnchor] = useState<null | HTMLElement>(null);

  const displayedAvailability = derivedAvailability(activeCall, availability);
  const assignedCampaigns = campaigns.filter((c) => c.assignedAgents.includes(username));
  const currentCampaign = campaigns.find((c) => c.campaignId === currentCampaignId);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mr: 1.5 }}>
      <Box onClick={(event: MouseEvent<HTMLElement>) => setAvailAnchor(event.currentTarget)} sx={{ cursor: 'pointer', display: 'inline-flex' }}>
        <StatusBadge label={displayedAvailability} tone={AVAILABILITY_TONE[displayedAvailability]} />
      </Box>
      <Menu anchorEl={availAnchor} open={Boolean(availAnchor)} onClose={() => setAvailAnchor(null)}>
        {SELECTABLE_AVAILABILITY.map((status) => (
          <MenuItem
            key={status}
            selected={status === availability && !activeCall}
            onClick={() => {
              setAvailability(status);
              setAvailAnchor(null);
            }}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title={activeCall ? 'End the current call to switch campaigns' : ''}>
        <Chip
          size="small"
          variant="outlined"
          icon={<CampaignOutlined fontSize="small" />}
          label={currentCampaign?.campaignName ?? 'No Campaign'}
          onClick={(event) => setCampaignAnchor(event.currentTarget)}
          sx={{ cursor: 'pointer', maxWidth: 220 }}
        />
      </Tooltip>
      <Menu anchorEl={campaignAnchor} open={Boolean(campaignAnchor)} onClose={() => setCampaignAnchor(null)}>
        {assignedCampaigns.length === 0 && <MenuItem disabled>No campaigns assigned</MenuItem>}
        {assignedCampaigns.map((c) => (
          <MenuItem
            key={c.campaignId}
            selected={c.campaignId === currentCampaignId}
            disabled={Boolean(activeCall)}
            onClick={() => {
              setCampaign(c.campaignId);
              setCampaignAnchor(null);
            }}
          >
            {c.campaignName}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setCampaignAnchor(null);
            navigate('/agent/home/campaign-selection');
          }}
        >
          Manage Campaigns
        </MenuItem>
      </Menu>

      <IconButton
        color="inherit"
        onClick={() => navigate('/agent/home/dialer')}
        sx={{
          '& .MuiBadge-badge': { animation: 'pulse 1.4s ease-in-out infinite' },
          '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.3 }, '100%': { opacity: 1 } },
        }}
      >
        <Badge color="error" variant="dot" invisible={!activeCall}>
          <DialpadOutlined />
        </Badge>
      </IconButton>
    </Stack>
  );
}

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login', { replace: true });
  };
  if (!user) return null;
  const displayName = user.displayName;
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
        {user.role === 'Agent' && <AgentQuickActions username={user.username} />}
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
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>{ROLE_LABELS[user.role]}</Typography>
          </Box>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
