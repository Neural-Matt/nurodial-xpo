import { Box, Typography, Paper } from '@mui/material';
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined';

interface ComingSoonPageProps {
  title: string;
  vicidialMapping?: string;
}

export function ComingSoonPage({ title, vicidialMapping }: ComingSoonPageProps) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>{title}</Typography>
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
        <ConstructionOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.primary">Coming soon</Typography>
        <Typography variant="body2">This feature is planned for a future release.</Typography>
        {vicidialMapping && (
          <Typography variant="caption" sx={{ mt: 1, fontFamily: 'monospace' }}>
            Future VICIDial integration: {vicidialMapping}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
