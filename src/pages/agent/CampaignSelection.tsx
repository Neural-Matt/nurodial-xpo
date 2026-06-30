import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Stack, Tooltip } from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/useAuth';
import { useAgentSession } from '../../context/useAgentSession';
import { campaigns } from '../../services/mock/campaigns';

export function CampaignSelection() {
  const { user } = useAuth();
  const { currentCampaignId, activeCall, setCampaign } = useAgentSession();
  const [search, setSearch] = useState('');

  const assignedCampaigns = campaigns
    .filter((c) => c.assignedAgents.includes(user!.username))
    .filter((c) => c.campaignName.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <Box>
      <PageHeader title="Campaign Selection" subtitle="Select a campaign before beginning work. Only campaigns assigned to you are shown." />

      <TextField
        placeholder="Search your campaigns..."
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{ input: { startAdornment: <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} /> } }}
        sx={{ mb: 3, minWidth: 280 }}
      />

      {assignedCampaigns.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">No campaigns assigned. Contact your supervisor.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {assignedCampaigns.map((campaign) => {
            const isCurrent = campaign.campaignId === currentCampaignId;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.campaignId}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: isCurrent ? 'primary.main' : undefined }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{campaign.campaignName}</Typography>
                      <StatusBadge label={campaign.status} />
                    </Stack>
                    <StatusBadge label={campaign.type} tone="info" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2, flexGrow: 1 }}>
                      {campaign.description}
                    </Typography>
                    <Tooltip title={activeCall ? 'End the current call to switch campaigns' : ''}>
                      <span>
                        <Button
                          fullWidth
                          variant={isCurrent ? 'outlined' : 'contained'}
                          disabled={Boolean(activeCall) || campaign.status === 'Closed'}
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
