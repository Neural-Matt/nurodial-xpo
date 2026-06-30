import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, CircularProgress, Alert } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchDispositions } from '../../services/api/client';
import { useApiData } from '../../hooks/useApiData';

const CATEGORY_TONE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Sale: 'success',
  Contact: 'info',
  Compliance: 'error',
  'No Contact': 'neutral',
};

function BoolIcon({ value }: { value: boolean }) {
  return value
    ? <CheckCircleOutlined fontSize="small" sx={{ color: 'success.main' }} />
    : <CancelOutlined fontSize="small" sx={{ color: 'text.disabled' }} />;
}

export function Dispositions() {
  const { data: dispositions, loading, error } = useApiData(fetchDispositions);

  return (
    <Box>
      <PageHeader
        title="Dispositions"
        subtitle="Manage call disposition codes used across VICIDial campaigns."
        actions={<Button variant="contained" startIcon={<AddOutlined />}>Add Disposition</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 880, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="center">Selectable</TableCell>
                <TableCell align="center">Sale</TableCell>
                <TableCell align="center">DNC</TableCell>
                <TableCell align="center">Final</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(dispositions ?? []).map((disposition) => (
                <TableRow key={disposition.statusCode} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{disposition.statusCode}</Typography></TableCell>
                  <TableCell>{disposition.label}</TableCell>
                  <TableCell><StatusBadge label={disposition.category} tone={CATEGORY_TONE[disposition.category]} /></TableCell>
                  <TableCell align="center"><BoolIcon value={disposition.isFinal === false} /></TableCell>
                  <TableCell align="center"><BoolIcon value={disposition.isSale} /></TableCell>
                  <TableCell align="center"><BoolIcon value={disposition.isDnc} /></TableCell>
                  <TableCell align="center"><BoolIcon value={disposition.isFinal} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><EditOutlined fontSize="small" /></IconButton>
                    <IconButton size="small"><DeleteOutlined fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
