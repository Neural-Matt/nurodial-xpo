import { Chip, type ChipProps } from '@mui/material';
import { colors } from '../../theme/palette';

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  active: 'success',
  available: 'success',
  paid: 'success',
  verified: 'success',
  resolved: 'success',
  completed: 'success',
  low: 'success',
  'on call': 'info',
  outbound: 'info',
  inbound: 'info',
  waiting: 'warning',
  'in progress': 'warning',
  'on break': 'warning',
  pending: 'warning',
  inactive: 'warning',
  medium: 'warning',
  partial: 'warning',
  locked: 'error',
  high: 'error',
  failed: 'error',
  overdue: 'error',
};

const TONE_COLORS: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: 'rgba(31,169,113,0.12)', fg: colors.success },
  warning: { bg: 'rgba(245,158,11,0.14)', fg: '#92620A' },
  error: { bg: 'rgba(224,32,58,0.12)', fg: colors.error },
  info: { bg: 'rgba(59,130,246,0.12)', fg: colors.info },
  primary: { bg: 'rgba(224,32,58,0.12)', fg: colors.primary },
  neutral: { bg: 'rgba(0,0,0,0.06)', fg: 'rgba(0,0,0,0.65)' },
};

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  size?: ChipProps['size'];
}

export function StatusBadge({ label, tone, size = 'small' }: StatusBadgeProps) {
  const resolvedTone = tone ?? STATUS_TONE_MAP[label.toLowerCase()] ?? 'neutral';
  const { bg, fg } = TONE_COLORS[resolvedTone];

  return <Chip label={label} size={size} sx={{ bgcolor: bg, color: fg, fontWeight: 700, borderRadius: '6px' }} />;
}
