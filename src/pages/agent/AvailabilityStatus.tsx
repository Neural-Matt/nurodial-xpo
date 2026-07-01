import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAgentSession } from '../../context/useAgentSession';
import {
  AVAILABILITY_TONE, SELECTABLE_AVAILABILITY, derivedAvailability, type AvailabilityStatus,
} from '../../context/agentSessionStore';
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
  const [pending, setPending] = useState<AvailabilityStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (status: AvailabilityStatus) => {
    if (activeCall || pending) return;
    setPending(status);
    setError(null);
    try {
      await setAvailability(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to switch to ${status}.`);
    } finally {
      setPending(null);
    }
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error} Your status in VICIdial may not match what's shown here — try again.
        </Alert>
      )}

      <Grid container spacing={2}>
        {SELECTABLE_AVAILABILITY.map((status) => {
          const isCurrent = !activeCall && status === availability;
          const isPending = pending === status;
          const disabled = Boolean(activeCall) || (pending !== null && !isPending);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
              <Card
                variant="outlined"
                onClick={() => { void handleSelect(status); }}
                sx={{
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled && !isPending ? 0.5 : 1,
                  borderColor: isCurrent ? TONE_COLOR[AVAILABILITY_TONE[status]] : undefined,
                  borderWidth: isCurrent ? 2 : 1,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  {isPending ? (
                    <CircularProgress size={14} sx={{ mb: 1.5 }} />
                  ) : (
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
                  )}
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
