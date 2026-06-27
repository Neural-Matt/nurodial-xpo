import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, Badge } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Mock user data
const users = Array.from({ length: 5 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: 'Agent',
  team: 'Team A',
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  lastLogin: '2024-01-01',
}));

export const AdminUserManagement: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>Users</Typography>
    <Typography variant="subtitle1" gutterBottom>Manage system users</Typography>
    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
      <Button variant="contained" startIcon={<AddIcon />} color="primary">Add User</Button>
      <Button variant="outlined" startIcon={<UploadFileIcon />}>Import Users</Button>
      <Button variant="outlined" startIcon={<FilterListIcon />}>Filters</Button>
    </Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {['Total Users', 'Active Users', 'Inactive Users', 'Locked Users'].map((title) => (
        <Grid item xs={12} sm={6} md={3} key={title}>
          <Card>
            <CardContent>{title}: 42</CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField placeholder="Search" variant="outlined" size="small" />
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Role</InputLabel>
        <Select label="Role"><MenuItem value="">All</MenuItem></Select>
      </FormControl>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status"><MenuItem value="">All</MenuItem></Select>
      </FormControl>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Team</InputLabel>
        <Select label="Team"><MenuItem value="">All</MenuItem></Select>
      </FormControl>
    </Box>
    <Table size="small" sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Team</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Last Login</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map(u => (
          <TableRow key={u.id} hover>
            <TableCell padding="checkbox" />
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar>{u.name[0]}</Avatar>{u.name}</Box></TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>{u.team}</TableCell>
            <TableCell><Badge color={u.status === 'Active' ? 'primary' : 'secondary'} badgeContent={u.status} /></TableCell>
            <TableCell>{u.lastLogin}</TableCell>
            <TableCell><IconButton size="small"><MoreVertIcon /></IconButton></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);
