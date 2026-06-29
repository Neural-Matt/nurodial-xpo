import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Divider,
} from '@mui/material';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import ApiOutlined from '@mui/icons-material/ApiOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import AddOutlined from '@mui/icons-material/AddOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usage, invoices, invoiceTotalCount, subscription, paymentMethods } from '../../services/mock/billing';

function UsageMeter({ icon: Icon, title, subtitle, used, limit, remainingLabel, resetsInDays }: {
  icon: typeof PhoneInTalkOutlined;
  title: string;
  subtitle: string;
  used: number;
  limit: number;
  remainingLabel: string;
  resetsInDays: number;
}) {
  const pct = Math.round((used / limit) * 100);
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(224,32,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon fontSize="small" sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          </Box>
        </Stack>
        <StatusBadge label={`${pct}% Used`} tone={pct > 80 ? 'error' : 'warning'} />
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {used.toLocaleString()} <Typography component="span" variant="body1" color="text.secondary">/ {limit.toLocaleString()}</Typography>
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">{remainingLabel} remaining</Typography>
        <Typography variant="caption" color="text.secondary">Resets in {resetsInDays} days</Typography>
      </Stack>
    </Box>
  );
}

export function BillingSubscription() {
  const [period, setPeriod] = useState('This Month');

  return (
    <Box>
      <PageHeader title="Billing & Subscription" subtitle="Manage your subscription, usage, invoices, and payment methods." />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Usage Overview</Typography>
                <Select size="small" value={period} onChange={(event) => setPeriod(event.target.value)}>
                  <MenuItem value="This Month">This Month</MenuItem>
                  <MenuItem value="Last Month">Last Month</MenuItem>
                </Select>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your usage this billing cycle ({usage.cycleLabel})
              </Typography>

              <UsageMeter
                icon={PhoneInTalkOutlined}
                title="Minutes"
                subtitle="Outbound & Inbound Calls"
                used={usage.minutes.used}
                limit={usage.minutes.limit}
                remainingLabel={`${usage.minutes.remaining.toLocaleString()} mins`}
                resetsInDays={usage.minutes.resetsInDays}
              />
              <UsageMeter
                icon={ApiOutlined}
                title="API Calls"
                subtitle="Total API Requests"
                used={usage.apiCalls.used}
                limit={usage.apiCalls.limit}
                remainingLabel={`${usage.apiCalls.remaining.toLocaleString()} calls`}
                resetsInDays={usage.apiCalls.resetsInDays}
              />

              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8f8f9', borderRadius: 2, p: 2, flexWrap: 'wrap' }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <InfoOutlined fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Need more resources?</Typography>
                    <Typography variant="caption" color="text.secondary">Upgrade your plan or purchase add-ons to increase your limits.</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="outlined">View Add-ons</Button>
                  <Button variant="contained">Upgrade Plan</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Invoice History</Typography>
                  <Typography variant="body2" color="text.secondary">View and download your recent invoices.</Typography>
                </Box>
                <Button size="small">View All Invoices</Button>
              </Stack>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 560, '& td, & th': { whiteSpace: 'nowrap' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell><StatusBadge label={invoice.status} /></TableCell>
                        <TableCell align="right">
                          <IconButton size="small"><VisibilityOutlined fontSize="small" /></IconButton>
                          <IconButton size="small"><FileDownloadOutlined fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing 1 to {invoices.length} of {invoiceTotalCount} invoices
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[1, 2, 3].map((p) => (
                    <Button key={p} size="small" variant={p === 1 ? 'contained' : 'text'} sx={{ minWidth: 32 }}>{p}</Button>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Current Subscription</Typography>
                <StatusBadge label={subscription.status} />
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(224,32,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WorkspacePremiumOutlined sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{subscription.plan}</Typography>
                  <Typography variant="caption" color="text.secondary">{subscription.description}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                {([
                  ['Monthly Subscription', `$${subscription.monthly.toFixed(2)}/month`],
                  ['Billing Cycle', subscription.billingCycle],
                  ['Next Billing Date', subscription.nextBillingDate],
                  ['Status', subscription.status],
                ] as const).map(([label, value]) => (
                  <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Button variant="outlined" fullWidth>Manage Subscription</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Methods</Typography>
                <Button size="small" startIcon={<AddOutlined fontSize="small" />} sx={{ whiteSpace: 'nowrap' }}>Add Payment Method</Button>
              </Stack>
              <Stack spacing={2}>
                {paymentMethods.map((pm) => (
                  <Stack key={pm.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <CreditCardOutlined color="action" />
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{pm.brand} •••• {pm.last4}</Typography>
                          {pm.isDefault && <StatusBadge label="Default" tone="neutral" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Expires {pm.expires}</Typography>
                      </Box>
                    </Stack>
                    <IconButton size="small"><MoreVertOutlined fontSize="small" /></IconButton>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <LockOutlined fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Your payment information is secure and encrypted. We never store your full card details.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
