import type { ElementType } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import { colors } from '../../theme/palette';

export type KpiVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const VARIANT_STYLES: Record<KpiVariant, { bg: string; fg: string }> = {
  primary: { bg: 'rgba(224,32,58,0.12)', fg: colors.primary },
  success: { bg: 'rgba(31,169,113,0.12)', fg: colors.success },
  warning: { bg: 'rgba(245,158,11,0.14)', fg: '#92620A' },
  error: { bg: 'rgba(224,32,58,0.12)', fg: colors.error },
  info: { bg: 'rgba(59,130,246,0.12)', fg: colors.info },
  neutral: { bg: 'rgba(0,0,0,0.06)', fg: 'rgba(0,0,0,0.6)' },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ElementType;
  variant?: KpiVariant;
  delta?: string;
  deltaTrend?: 'up' | 'down';
  caption?: string;
}

export function KpiCard({ label, value, icon: Icon, variant = 'neutral', delta, deltaTrend = 'up', caption }: KpiCardProps) {
  const { bg, fg } = VARIANT_STYLES[variant];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {Icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: fg }} fontSize="small" />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
          </Box>
        </Box>
        {(delta || caption) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25 }}>
            {delta && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  color: deltaTrend === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {deltaTrend === 'up' ? <TrendingUpOutlined fontSize="inherit" /> : <TrendingDownOutlined fontSize="inherit" />}
                {delta}
              </Box>
            )}
            {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
