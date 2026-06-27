import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

// Simple KPI cards to demonstrate the design language
const kpis = [
  { label: 'Active Calls', value: 12 },
  { label: 'Agents Online', value: 34 },
  { label: 'Avg. Wait Time', value: '00:01:23' },
  { label: 'New Tickets', value: 5 },
];

export const Dashboard: React.FC = () => (
  <>
    <Typography variant="h4" gutterBottom>
      Dashboard
    </Typography>
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.label}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {kpi.label}
              </Typography>
              <Typography variant="h5" component="div">
                {kpi.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);
