import { Box, Typography, Stack } from '@mui/material';

const BUCKETS = [
  { max: 10, label: '0-10', color: 'rgba(224,32,58,0.08)' },
  { max: 30, label: '11-30', color: 'rgba(224,32,58,0.25)' },
  { max: 60, label: '31-60', color: 'rgba(224,32,58,0.45)' },
  { max: 100, label: '61-100', color: 'rgba(224,32,58,0.7)' },
  { max: Infinity, label: '100+', color: 'rgba(224,32,58,0.95)' },
];

function colorFor(value: number) {
  return (BUCKETS.find((b) => value <= b.max) ?? BUCKETS[BUCKETS.length - 1]).color;
}

interface ActivityHeatmapProps {
  days: string[];
  hours: string[];
  data: number[][];
}

export function ActivityHeatmap({ days, hours, data }: ActivityHeatmapProps) {
  const gridTemplateColumns = `48px repeat(${hours.length}, 1fr)`;

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns, gap: 0.5, mb: 1 }}>
        <Box />
        {hours.map((hour) => (
          <Typography key={hour} variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: 10 }}>
            {hour}
          </Typography>
        ))}
      </Box>
      {days.map((day, dayIdx) => (
        <Box key={day} sx={{ display: 'grid', gridTemplateColumns, gap: 0.5, mb: 0.5, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">{day}</Typography>
          {data[dayIdx].map((value, hourIdx) => (
            <Box
              key={hourIdx}
              title={`${value} activities`}
              sx={{ aspectRatio: '1', borderRadius: 0.5, bgcolor: colorFor(value) }}
            />
          ))}
        </Box>
      ))}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {BUCKETS.map((bucket) => (
          <Stack key={bucket.label} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: bucket.color }} />
            <Typography variant="caption" color="text.secondary">{bucket.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
