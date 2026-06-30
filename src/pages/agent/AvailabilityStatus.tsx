import { Box, Grid, Card, CardContent, Typography, Stack, Alert } from '@mui/material';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAgentSession } from '../../context/useAgentSession';
import { AVAILABILITY_TONE, SELECTABLE_AVAILABILITY, derivedAvailability } from '../../context/agentSessionStore';
import { colors } from '../../theme/palette';

const TONE_COLOR: Record<string, string> = {
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  primary: colors.primary,
  neutral: 'rgba(0,0,0,0.4)',
};

export function AvailabilityStatus() {
  const { availability, activeCall, setAvailability } = useAgentSession();
  const displayedAvailability = derivedAvailability(activeCall, availability);

  return (
    <Box>
      <PageHeader title="Availability" subtitle="Change your status with one click. This updates throughout the application immediately." />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Typography variant="body1">Current status:</Typography>
        <StatusBadge label={displayedAvailability} tone={AVAILABILITY_TONE[displayedAvailability]} />
      </Stack>

      {activeCall && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your status is locked to "On Call" while a call is active. It will return to your last selection once the call ends.
        </Alert>
      )}

      <Grid container spacing={2}>
        {SELECTABLE_AVAILABILITY.map((status) => {
          const isCurrent = !activeCall && status === availability;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
              <Card
                variant="outlined"
                onClick={() => !activeCall && setAvailability(status)}
                sx={{
                  cursor: activeCall ? 'not-allowed' : 'pointer',
                  opacity: activeCall ? 0.5 : 1,
                  borderColor: isCurrent ? TONE_COLOR[AVAILABILITY_TONE[status]] : undefined,
                  borderWidth: isCurrent ? 2 : 1,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: TONE_COLOR[AVAILABILITY_TONE[status]],
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: isCurrent ? 700 : 500 }}>{status}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
