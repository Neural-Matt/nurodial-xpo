import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Stack, Tooltip,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAgentSession } from '../../context/useAgentSession';
import { useApiData } from '../../hooks/useApiData';
import { fetchCampaigns, fetchAgentPhones, isApiConfigured } from '../../services/api/client';

export function CampaignSelection() {
  const { currentCampaignId, activeCall, hasViciSession, setCampaign, startViciSession } = useAgentSession();
  const { data: campaigns, loading, error } = useApiData(fetchCampaigns);
  const { data: phones } = useApiData(fetchAgentPhones);
  const [search, setSearch] = useState('');
  const [extension, setExtension] = useState('');
  const [startingCampaignId, setStartingCampaignId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const filtered = (campaigns ?? []).filter((c) =>
    c.campaignName.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // Only true once /api/agent/me has actually returned 404 — null (not yet
  // checked) and mock mode (API not configured) both fall through to the
  // existing plain campaign-switch flow below.
  const needsSession = isApiConfigured() && hasViciSession === false;

  const handleStartSession = async (campaignId: string) => {
    if (!extension) return;
    setStartingCampaignId(campaignId);
    setStartError(null);
    try {
      await startViciSession(campaignId, extension);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Failed to start session.');
    } finally {
      setStartingCampaignId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Campaign Selection"
        subtitle="Select a campaign before beginning work."
      />

      {needsSession && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You're not logged into VICIdial yet. Choose a phone extension, then start a session on a campaign.
        </Alert>
      )}
      {startError && <Alert severity="error" sx={{ mb: 2 }}>{startError}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
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
          sx={{ minWidth: 280 }}
        />
        {needsSession && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Phone Extension</InputLabel>
            <Select label="Phone Extension" value={extension} onChange={(event) => setExtension(event.target.value)}>
              {(phones ?? []).map((phone) => (
                <MenuItem key={phone.extension} value={phone.extension}>
                  {phone.extension} ({phone.protocol})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

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
            const isStarting = startingCampaignId === campaign.campaignId;

            let buttonLabel = isCurrent ? 'Selected' : 'Select Campaign';
            let disabledReason = '';
            let onClick = () => setCampaign(campaign.campaignId);

            if (needsSession) {
              buttonLabel = isStarting ? 'Starting…' : 'Start Session';
              onClick = () => { void handleStartSession(campaign.campaignId); };
              if (!extension) disabledReason = 'Choose a phone extension first.';
            } else if (activeCall) {
              disabledReason = 'End the current call to switch campaigns';
            }

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
                    <Tooltip title={disabledReason}>
                      <span>
                        <Button
                          fullWidth
                          variant={isCurrent ? 'outlined' : 'contained'}
                          disabled={Boolean(disabledReason) || campaign.status === 'Paused' || isStarting}
                          onClick={onClick}
                        >
                          {buttonLabel}
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
