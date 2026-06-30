import { Box, Typography, Paper, Button } from '@mui/material';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import { Link } from 'react-router-dom';

interface AccessDeniedPageProps {
  path: string;
}

export function AccessDeniedPage({ path }: AccessDeniedPageProps) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Access Denied</Typography>
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          color: 'text.secondary',
        }}
      >
        <BlockOutlined sx={{ fontSize: 40, color: 'error.main' }} />
        <Typography variant="h6" color="text.primary">You don't have access to this page</Typography>
        <Typography variant="body2">
          Your role isn't permitted to view <code>{path}</code>.
        </Typography>
        <Button component={Link} to="/dashboard" variant="contained" sx={{ mt: 1 }}>
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
