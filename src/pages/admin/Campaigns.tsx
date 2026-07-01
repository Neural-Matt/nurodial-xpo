import { useState } from 'react';
import {
  Box, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Chip, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl,
  Checkbox, FormControlLabel, IconButton,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import {
  fetchCampaigns, createCampaign, updateCampaign, fetchLists, createList, updateList,
} from '../../services/api/client';
import { useApiData } from '../../hooks/useApiData';
import type { Campaign } from '../../types/vicidial';

const DIAL_METHODS = [
  'MANUAL', 'RATIO', 'ADAPT_HARD_LIMIT', 'ADAPT_TAPERED', 'ADAPT_AVERAGE', 'ADAPT_PERCENTMAX',
  'INBOUND_MAN', 'SHARED_RATIO', 'SHARED_ADAPT_HARD_LIMIT', 'SHARED_ADAPT_TAPERED',
  'SHARED_ADAPT_AVERAGE', 'SHARED_ADAPT_PERCENTMAX',
];
const CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9_]{2,8}$/;
const LIST_ID_PATTERN = /^[0-9]{1,14}$/;

interface CampaignFormState {
  campaignId: string;
  campaignName: string;
  dialMethod: string;
  autoDialLevel: string;
  hopperLevel: string;
  localCallTime: string;
  campaignCid: string;
  wrapupSeconds: string;
  dialTimeout: string;
  scheduledCallbacks: boolean;
  voicemailExt: string;
}

function emptyForm(): CampaignFormState {
  return {
    campaignId: '', campaignName: '', dialMethod: 'MANUAL', autoDialLevel: '0', hopperLevel: '1',
    localCallTime: '9am-9pm', campaignCid: '', wrapupSeconds: '0', dialTimeout: '60',
    scheduledCallbacks: false, voicemailExt: '',
  };
}

function campaignToForm(campaign: Campaign): CampaignFormState {
  return {
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    dialMethod: campaign.dialMethod,
    autoDialLevel: String(campaign.dialLevel),
    hopperLevel: String(campaign.hopperLevel),
    localCallTime: campaign.localCallTime,
    campaignCid: campaign.campaignCid,
    wrapupSeconds: String(campaign.wrapupSeconds),
    dialTimeout: String(campaign.dialTimeout),
    scheduledCallbacks: campaign.scheduledCallbacks,
    voicemailExt: campaign.voicemailExt,
  };
}

interface CampaignFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CampaignFormState;
  onClose: () => void;
  onSave: (form: CampaignFormState) => Promise<void>;
}

function CampaignFormDialog({ open, mode, initial, onClose, onSave }: CampaignFormDialogProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = mode === 'create'
    ? CAMPAIGN_ID_PATTERN.test(form.campaignId.trim()) && form.campaignName.trim().length > 0
    : form.campaignName.trim().length > 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'New Campaign' : `Edit ${initial.campaignId}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Campaign ID"
            value={form.campaignId}
            onChange={(e) => setForm({ ...form, campaignId: e.target.value.toUpperCase() })}
            disabled={mode === 'edit'}
            helperText={mode === 'create' ? '2-8 characters, letters/numbers/underscore' : undefined}
            fullWidth
            size="small"
          />
          <TextField
            label="Campaign Name"
            value={form.campaignName}
            onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
            fullWidth
            size="small"
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Dial Method</InputLabel>
            <Select
              label="Dial Method"
              value={form.dialMethod}
              onChange={(e) => setForm({ ...form, dialMethod: e.target.value })}
            >
              {DIAL_METHODS.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Auto Dial Level"
            type="number"
            value={form.autoDialLevel}
            onChange={(e) => setForm({ ...form, autoDialLevel: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Hopper Level"
            type="number"
            value={form.hopperLevel}
            onChange={(e) => setForm({ ...form, hopperLevel: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Call Hours"
            value={form.localCallTime}
            onChange={(e) => setForm({ ...form, localCallTime: e.target.value })}
            placeholder="9am-9pm"
            fullWidth
            size="small"
          />
          <TextField
            label="Caller ID"
            value={form.campaignCid}
            onChange={(e) => setForm({ ...form, campaignCid: e.target.value })}
            placeholder="e.g. 5551234567"
            fullWidth
            size="small"
          />
          <TextField
            label="Dial Timeout (sec)"
            type="number"
            value={form.dialTimeout}
            onChange={(e) => setForm({ ...form, dialTimeout: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Wrap-up Seconds"
            type="number"
            value={form.wrapupSeconds}
            onChange={(e) => setForm({ ...form, wrapupSeconds: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Voicemail Extension"
            value={form.voicemailExt}
            onChange={(e) => setForm({ ...form, voicemailExt: e.target.value })}
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.scheduledCallbacks}
                onChange={(e) => setForm({ ...form, scheduledCallbacks: e.target.checked })}
              />
            }
            label="Allow scheduled callbacks"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave || saving} onClick={() => { void handleSave(); }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CampaignListsTab({ campaignId, allCampaigns }: { campaignId: string; allCampaigns: Campaign[] }) {
  const { data: lists, loading, error, reload } = useApiData(() => fetchLists(campaignId));
  const [newListId, setNewListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const listRows = lists ?? [];
  const canCreate = LIST_ID_PATTERN.test(newListId.trim()) && newListName.trim().length > 0;

  const handleCreate = async () => {
    setCreating(true);
    setActionError(null);
    try {
      await createList({ listId: newListId.trim(), listName: newListName.trim(), campaignId });
      setNewListId('');
      setNewListName('');
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create list.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (listId: string, active: boolean) => {
    setActionError(null);
    try {
      await updateList(listId, { active });
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update list.');
    }
  };

  const handleReassign = async (listId: string, newCampaignId: string) => {
    setActionError(null);
    try {
      await updateList(listId, { campaignId: newCampaignId });
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reassign list.');
    }
  };

  return (
    <Stack spacing={2}>
      {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <TextField
          label="List ID"
          size="small"
          value={newListId}
          onChange={(e) => setNewListId(e.target.value.replace(/\D/g, ''))}
          sx={{ width: 110 }}
        />
        <TextField
          label="List Name"
          size="small"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          sx={{ flex: 1, minWidth: 140 }}
        />
        <Button variant="outlined" disabled={!canCreate || creating} onClick={() => { void handleCreate(); }}>
          {creating ? 'Adding…' : 'Add List'}
        </Button>
      </Stack>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>}

      {!loading && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>List ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Leads</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Move to</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listRows.map((l) => (
              <TableRow key={l.listId}>
                <TableCell>{l.listId}</TableCell>
                <TableCell>{l.listName}</TableCell>
                <TableCell>{l.leadCount}</TableCell>
                <TableCell><StatusBadge label={l.active ? 'Active' : 'Paused'} tone={l.active ? 'success' : 'neutral'} /></TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={l.campaignId}
                    onChange={(e) => { void handleReassign(l.listId, e.target.value); }}
                    sx={{ minWidth: 110 }}
                  >
                    {allCampaigns.map((c) => (
                      <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignId}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { void handleToggleActive(l.listId, !l.active); }}>
                    {l.active ? <BlockOutlined fontSize="small" /> : <PlayCircleOutlined fontSize="small" />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {listRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No lists assigned to this campaign.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

export function Campaigns() {
  const { data: campaigns, loading, error, reload } = useApiData(fetchCampaigns);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const list = campaigns ?? [];
  const activeCount = list.filter((c) => c.active).length;
  const pausedCount = list.filter((c) => !c.active).length;

  const handleToggleActive = async () => {
    if (!selected) return;
    setTogglingActive(true);
    setActionError(null);
    try {
      await updateCampaign(selected.campaignId, { active: !selected.active });
      reload();
      setSelected(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update campaign.');
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDialogSave = async (form: CampaignFormState) => {
    const payload = {
      campaignName: form.campaignName.trim(),
      dialMethod: form.dialMethod,
      autoDialLevel: Number(form.autoDialLevel) || 0,
      hopperLevel: Number(form.hopperLevel) || 0,
      localCallTime: form.localCallTime.trim(),
      campaignCid: form.campaignCid.trim(),
      wrapupSeconds: Number(form.wrapupSeconds) || 0,
      dialTimeout: Number(form.dialTimeout) || 0,
      scheduledCallbacks: form.scheduledCallbacks,
      voicemailExt: form.voicemailExt.trim(),
    };
    if (dialogMode === 'create') {
      await createCampaign({ campaignId: form.campaignId.trim(), ...payload });
    } else if (selected) {
      await updateCampaign(selected.campaignId, payload);
    }
    setDialogMode(null);
    setSelected(null);
    reload();
  };

  return (
    <Box>
      <PageHeader
        title="Blended Campaign"
        subtitle="View and manage inbound/outbound campaigns configured in VICIdial."
        actions={
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setDialogMode('create')}>
            New Campaign
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Total Campaigns" value={list.length} icon={ListAltOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Active" value={activeCount} icon={CampaignOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Paused" value={pausedCount} icon={PauseCircleOutlined} variant="warning" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 780, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dial Method</TableCell>
                <TableCell>Dial Level</TableCell>
                <TableCell>Hopper</TableCell>
                <TableCell>Call Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((campaign) => (
                <TableRow
                  key={campaign.campaignId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => { setSelected(campaign); setActiveTab(0); }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{campaign.campaignName}</Typography>
                    <Typography variant="caption" color="text.secondary">{campaign.campaignId}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={campaign.active ? 'Active' : 'Paused'} tone={campaign.active ? 'success' : 'neutral'} />
                  </TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>{campaign.dialMethod}</TableCell>
                  <TableCell>{campaign.dialLevel}</TableCell>
                  <TableCell>{campaign.hopperLevel}</TableCell>
                  <TableCell>{campaign.localCallTime || '—'}</TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No campaigns found in VICIdial.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      {dialogMode && (
        <CampaignFormDialog
          open
          mode={dialogMode}
          initial={dialogMode === 'edit' && selected ? campaignToForm(selected) : emptyForm()}
          onClose={() => setDialogMode(null)}
          onSave={handleDialogSave}
        />
      )}

      {selected && (
        <DetailDrawer
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          header={
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6">{selected.campaignName}</Typography>
                <StatusBadge label={selected.active ? 'Active' : 'Paused'} tone={selected.active ? 'success' : 'neutral'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">Campaign ID: {selected.campaignId}</Typography>
            </Box>
          }
          tabs={[
            {
              label: 'Dial Settings',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Dial Method', selected.dialMethod],
                    ['Dial Level', selected.dialLevel],
                    ['Hopper Level', selected.hopperLevel],
                    ['Call Hours', selected.localCallTime || '—'],
                    ['Caller ID', selected.campaignCid || '—'],
                    ['Dial Timeout', `${selected.dialTimeout}s`],
                    ['Wrap-up Seconds', selected.wrapupSeconds],
                    ['Voicemail Ext', selected.voicemailExt || '—'],
                    ['Scheduled Callbacks', selected.scheduledCallbacks ? 'Enabled' : 'Disabled'],
                    ['Type', selected.type],
                    ['Status', selected.status],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                  {selected.dialStatuses.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Dial Statuses</Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selected.dialStatuses.map((status) => <Chip key={status} label={status} size="small" />)}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              ),
            },
            {
              label: 'Lists',
              content: <CampaignListsTab campaignId={selected.campaignId} allCampaigns={list} />,
            },
          ]}
          footer={
            <>
              <Button variant="outlined" disabled={togglingActive} onClick={() => { void handleToggleActive(); }}>
                {togglingActive ? 'Saving…' : selected.active ? 'Pause Campaign' : 'Resume Campaign'}
              </Button>
              <Button variant="contained" onClick={() => setDialogMode('edit')}>Edit Campaign</Button>
            </>
          }
        />
      )}
    </Box>
  );
}
