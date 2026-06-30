import { useState } from 'react';
import {
  Box, Button, Grid, TextField, MenuItem, Select, InputLabel, FormControl,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, Menu,
  Typography, Switch, Stack, Checkbox,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { users, ROLE_TONE, defaultPermissions, activityLog } from '../../services/mock/users';
import { ROLE_LABELS } from '../../context/authStore';
import type { AppUser, PermissionItem } from '../../types/domain';

const agentUsers = users.filter((user) => user.role === 'Agent');

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [permissions, setPermissions] = useState<PermissionItem[]>(defaultPermissions());
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const filteredUsers = agentUsers.filter((user) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term) || user.role.toLowerCase().includes(term);
  });

  const kpis = {
    total: agentUsers.length,
    active: agentUsers.filter((u) => u.status === 'Active').length,
    inactive: agentUsers.filter((u) => u.status === 'Inactive').length,
    locked: agentUsers.filter((u) => u.status === 'Locked').length,
  };

  const openDrawer = (user: AppUser) => {
    setSelectedUser(user);
    setPermissions(defaultPermissions());
    setActiveTab(0);
  };

  const togglePermission = (id: string) => {
    setPermissions((prev) => prev.map((perm) => (perm.id === id ? { ...perm, enabled: !perm.enabled } : perm)));
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Create, edit, and deactivate agent accounts. Reset passwords and assign campaigns and skills."
        actions={
          <>
            <Button variant="outlined" startIcon={<UploadFileOutlined />}>Import Agents</Button>
            <Button variant="contained" startIcon={<AddOutlined />}>Add Agent</Button>
          </>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Total Agents" value={kpis.total} icon={PeopleOutlineOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Active Agents" value={kpis.active} icon={CheckCircleOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Inactive Agents" value={kpis.inactive} icon={PauseCircleOutlined} variant="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Locked Agents" value={kpis.locked} icon={LockOutlined} variant="error" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search agents by name, email or team..."
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" defaultValue=""><MenuItem value="">All Roles</MenuItem></Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" defaultValue=""><MenuItem value="">All Status</MenuItem></Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Team</InputLabel>
          <Select label="Team" defaultValue=""><MenuItem value="">All Teams</MenuItem></Select>
        </FormControl>
        <Button variant="outlined" startIcon={<FilterListOutlined />}>Filters</Button>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 880, '& td, & th': { whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDrawer(user)}>
                <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                  <Checkbox size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>{user.name[0]}</Avatar>
                    {user.name}
                    {user.isCurrentUser && <StatusBadge label="You" tone="neutral" />}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><StatusBadge label={ROLE_LABELS[user.role] ?? user.role} tone={ROLE_TONE[user.role]} /></TableCell>
                <TableCell>{user.team}</TableCell>
                <TableCell><StatusBadge label={user.status} /></TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <IconButton size="small" onClick={(event) => setMenuAnchor(event.currentTarget)}>
                    <MoreVertOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Showing 1 to {filteredUsers.length} of {kpis.total} agents
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {[1, 2, 3].map((p) => (
              <Button key={p} size="small" variant={p === 1 ? 'contained' : 'text'} sx={{ minWidth: 32 }}>{p}</Button>
            ))}
            <Typography sx={{ px: 1, alignSelf: 'center' }}>...</Typography>
            <Button size="small" variant="text" sx={{ minWidth: 32 }}>16</Button>
          </Stack>
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => setMenuAnchor(null)}><EditOutlined fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}><BlockOutlined fontSize="small" sx={{ mr: 1 }} /> Deactivate</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>

      {selectedUser && (
        <DetailDrawer
          open={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          header={
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6">{selectedUser.name}</Typography>
                <StatusBadge label={selectedUser.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary">{ROLE_LABELS[selectedUser.role] ?? selectedUser.role} • {selectedUser.team}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
            </Box>
          }
          tabs={[
            {
              label: 'User Details',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Email', selectedUser.email],
                    ['Role', ROLE_LABELS[selectedUser.role] ?? selectedUser.role],
                    ['Team', selectedUser.team],
                    ['Status', selectedUser.status],
                    ['Last Login', selectedUser.lastLogin],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                </Stack>
              ),
            },
            {
              label: 'Permissions',
              content: (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>System Access</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage user&apos;s system access and permissions.
                  </Typography>
                  <Stack spacing={2}>
                    {permissions.map((perm) => (
                      <Box key={perm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{perm.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{perm.description}</Typography>
                        </Box>
                        <Switch checked={perm.enabled} onChange={() => togglePermission(perm.id)} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ),
            },
            {
              label: 'Activity',
              content: (
                <Stack spacing={1.5}>
                  {activityLog.map((entry) => (
                    <Typography key={entry} variant="body2" color="text.secondary">{entry}</Typography>
                  ))}
                </Stack>
              ),
            },
            {
              label: 'Security',
              content: (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Two-Factor Authentication</Typography>
                    <StatusBadge label="Enabled" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Last Password Change</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>42 days ago</Typography>
                  </Box>
                </Stack>
              ),
            },
          ]}
          footer={
            <>
              <Button variant="outlined" onClick={() => setPermissions(defaultPermissions())}>Reset Changes</Button>
              <Button variant="contained" onClick={() => setSelectedUser(null)}>Save Changes</Button>
            </>
          }
        />
      )}
    </Box>
  );
}
