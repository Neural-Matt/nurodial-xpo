import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Stack, Tooltip,
  CircularProgress, Alert,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAgentSession } from '../../context/useAgentSession';
import { useApiData } from '../../hooks/useApiData';
import { fetchCampaigns } from '../../services/api/client';

export function CampaignSelection() {
  const { currentCampaignId, activeCall, setCampaign } = useAgentSession();
  const { data: campaigns, loading, error } = useApiData(fetchCampaigns);
  const [search, setSearch] = useState('');

  const filtered = (campaigns ?? []).filter((c) =>
    c.campaignName.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Box>
      <PageHeader
        title="Campaign Selection"
        subtitle="Select a campaign before beginning work."
      />

      <TextField
        placeholder="Search campaigns..."
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          },
        }}
        sx={{ mb: 3, minWidth: 280 }}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && filtered.length === 0 && !error && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No active campaigns found. Contact your supervisor.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <Grid container spacing={2}>
          {filtered.map((campaign) => {
            const isCurrent = campaign.campaignId === currentCampaignId;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.campaignId}>
                <Card
                  variant="outlined"
                  sx={{ height: '100%', borderColor: isCurrent ? 'primary.main' : undefined }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {campaign.campaignName}
                      </Typography>
                      <StatusBadge label={campaign.status} />
                    </Stack>
                    <StatusBadge label={campaign.type} tone="info" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5, mb: 2, flexGrow: 1 }}
                    >
                      {campaign.dialMethod}
                    </Typography>
                    <Tooltip title={activeCall ? 'End the current call to switch campaigns' : ''}>
                      <span>
                        <Button
                          fullWidth
                          variant={isCurrent ? 'outlined' : 'contained'}
                          disabled={Boolean(activeCall) || campaign.status === 'Paused'}
                          onClick={() => setCampaign(campaign.campaignId)}
                        >
                          {isCurrent ? 'Selected' : 'Select Campaign'}
                        </Button>
                      </span>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
