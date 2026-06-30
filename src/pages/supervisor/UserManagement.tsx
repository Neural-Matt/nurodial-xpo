import { useState } from 'react';
import {
  Box, Button, Grid, TextField, MenuItem, Select, InputLabel, FormControl,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, Menu,
  Typography, Stack, Checkbox, CircularProgress, Alert,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { fetchUsers, type AppUserApi } from '../../services/api/client';
import { useApiData } from '../../hooks/useApiData';
import { ROLE_LABELS } from '../../context/authStore';
import { useAuth } from '../../context/useAuth';

const ROLE_TONE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Administrator: 'error',
  Supervisor: 'warning',
  Agent: 'info',
};

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { data: users, loading, error } = useApiData(fetchUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUserApi | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const list = users ?? [];

  const filtered = list.filter((u) => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term || u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesTerm && matchesRole;
  });

  const kpis = {
    total: list.length,
    active: list.filter((u) => u.status === 'Active').length,
    inactive: list.filter((u) => u.status === 'Inactive').length,
    admins: list.filter((u) => u.role === 'Administrator').length,
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="View and manage VICIdial user accounts, roles, and groups."
        actions={
          <Button variant="contained" startIcon={<AddOutlined />}>Add User</Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Total Users" value={kpis.total} icon={PeopleOutlineOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Active" value={kpis.active} icon={CheckCircleOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Inactive" value={kpis.inactive} icon={PauseCircleOutlined} variant="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Administrators" value={kpis.admins} icon={AdminPanelSettingsOutlined} variant="error" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name or username..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="Administrator">Administrator</MenuItem>
            <MenuItem value="Supervisor">Supervisor</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<FilterListOutlined />}>Filters</Button>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 780, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const isCurrentUser = currentUser?.username === u.username;
                return (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedUser(u); setActiveTab(0); }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
                          {u.name[0]}
                        </Avatar>
                        {u.name}
                        {isCurrentUser && <StatusBadge label="You" tone="neutral" />}
                      </Box>
                    </TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <StatusBadge label={ROLE_LABELS[u.role] ?? u.role} tone={ROLE_TONE[u.role] ?? 'neutral'} />
                    </TableCell>
                    <TableCell>{u.team}</TableCell>
                    <TableCell>
                      <StatusBadge label={u.status} tone={u.status === 'Active' ? 'success' : 'neutral'} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                        <MoreVertOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filtered.length} of {kpis.total} users
          </Typography>
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => setMenuAnchor(null)}><EditOutlined fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}><BlockOutlined fontSize="small" sx={{ mr: 1 }} /> Deactivate</MenuItem>
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
                <StatusBadge label={selectedUser.status} tone={selectedUser.status === 'Active' ? 'success' : 'neutral'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {ROLE_LABELS[selectedUser.role] ?? selectedUser.role} · {selectedUser.team}
              </Typography>
              <Typography variant="body2" color="text.secondary">Username: {selectedUser.username}</Typography>
            </Box>
          }
          tabs={[
            {
              label: 'User Details',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Username', selectedUser.username],
                    ['Role', ROLE_LABELS[selectedUser.role] ?? selectedUser.role],
                    ['Group', selectedUser.team],
                    ['Status', selectedUser.status],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                </Stack>
              ),
            },
          ]}
          footer={
            <Button variant="contained" onClick={() => setSelectedUser(null)}>Close</Button>
          }
        />
      )}
    </Box>
  );
}
