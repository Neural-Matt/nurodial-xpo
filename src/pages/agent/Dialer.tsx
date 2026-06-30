import { useEffect, useMemo, useState, type ElementType } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab, TextField,
  Stack, Avatar, Chip, Select, MenuItem, Divider, Switch, FormControlLabel, Alert,
  CircularProgress, Menu, Popover,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined';
import MicOutlined from '@mui/icons-material/MicOutlined';
import MicOffOutlined from '@mui/icons-material/MicOffOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import DialpadOutlined from '@mui/icons-material/DialpadOutlined';
import PhoneForwardedOutlined from '@mui/icons-material/PhoneForwardedOutlined';
import CallEndOutlined from '@mui/icons-material/CallEndOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import NoteAddOutlined from '@mui/icons-material/NoteAddOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import BackspaceOutlined from '@mui/icons-material/BackspaceOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/useAuth';
import { useAgentSession } from '../../context/useAgentSession';
import { derivedAvailability, AVAILABILITY_TONE } from '../../context/agentSessionStore';
import { leads } from '../../services/mock/leads';
import { campaigns } from '../../services/mock/campaigns';
import { dispositions } from '../../services/mock/dispositions';
import { callScripts, defaultCallScript } from '../../services/mock/scripts';
import { scheduleCallback, callbacks } from '../../services/mock/callbacks';
import { knowledgeArticles, type TimelineEvent } from '../../services/mock/agentInteraction';
import type { Lead } from '../../types/vicidial';
import { colors } from '../../theme/palette';

const TIMELINE_ICONS: Record<TimelineEvent['icon'], { icon: ElementType; color: string }> = {
  call: { icon: PhoneOutlined, color: colors.info },
  verify: { icon: VerifiedOutlined, color: colors.success },
  note: { icon: NoteAddOutlined, color: colors.warning },
  tag: { icon: LocalOfferOutlined, color: colors.primary },
  transfer: { icon: SwapHorizOutlined, color: colors.info },
};

const PROFILE_TABS = ['Interaction', 'Lead Details', 'History', 'Script'];
const KB_TABS = ['Recommended', 'Recent'];
const DIALPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const TRANSFER_TARGETS = ['Supervisor', 'Sales Team', 'Billing Team'];

function formatDuration(totalSeconds: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return raw;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function leadName(lead: Lead) {
  return `${lead.firstName} ${lead.lastName}`.trim() || 'Unknown Caller';
}

function makeAdHocLead(phoneNumber: string, campaignId: string | null, sourceId: string): Lead {
  return {
    leadId: `AD-HOC-${Date.now()}`,
    listId: '',
    campaignId: campaignId ?? '',
    phoneNumber,
    phoneCode: '1',
    firstName: 'Unknown',
    lastName: 'Caller',
    email: '',
    province: '',
    city: '',
    address: '',
    vendorLeadCode: '',
    sourceId,
    status: 'NEW',
    calledCount: 0,
    lastCallTime: '',
    nextCallbackTime: '',
    customFields: {},
  };
}

export function Dialer() {
  const { user } = useAuth();
  const { currentCampaignId, availability, activeCall, startCall, advanceCallStatus, endCall } = useAgentSession();
  const currentCampaign = useMemo(() => campaigns.find((c) => c.campaignId === currentCampaignId), [currentCampaignId]);
  const upNextLeads = useMemo(
    () => leads.filter((l) => l.campaignId === currentCampaignId).slice(0, 5),
    [currentCampaignId],
  );

  // Idle-state controls
  const [dialNumber, setDialNumber] = useState('');
  const [autoDial, setAutoDial] = useState(false);
  const [manualPreviewLead, setManualPreviewLead] = useState<Lead | null>(null);

  // Connected-state controls (reset whenever a new call starts)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const [profileTab, setProfileTab] = useState(0);
  const [kbTab, setKbTab] = useState(0);
  const [kbSearch, setKbSearch] = useState('');
  const [disposition, setDisposition] = useState('');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [callbackTime, setCallbackTime] = useState<Dayjs | null>(null);
  const [transferAnchor, setTransferAnchor] = useState<null | HTMLElement>(null);
  const [dtmfAnchor, setDtmfAnchor] = useState<null | HTMLElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastCallKey, setLastCallKey] = useState<number | null>(null);

  // Reset per-call UI state whenever a genuinely new call starts. This runs
  // during render (not an effect) — the React-recommended pattern for
  // resetting state in response to an identity change, avoiding an extra
  // commit/re-render pass.
  if (activeCall && activeCall.startTime !== lastCallKey) {
    setLastCallKey(activeCall.startTime);
    setElapsed(0);
    setTimelineEvents([
      {
        id: 'start',
        icon: 'call',
        title: activeCall.direction === 'inbound' ? 'Incoming Call' : 'Outbound Call Started',
        description: `${activeCall.direction === 'inbound' ? 'Incoming call from' : 'Calling'} ${formatPhone(activeCall.lead.phoneNumber)}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setTags([]);
    setNoteInput('');
    setMuted(false);
    setProfileTab(0);
    setDisposition('');
    setDispositionNotes('');
    setCallbackTime(null);
  }

  // Ringing -> connected: outbound auto-connects, inbound waits for Answer.
  useEffect(() => {
    if (activeCall?.status === 'ringing' && activeCall.direction === 'outbound') {
      const timer = setTimeout(() => advanceCallStatus('connected'), 1800);
      return () => clearTimeout(timer);
    }
  }, [activeCall?.status, activeCall?.direction, advanceCallStatus]);

  // Live call timer — ticks via the interval callback only, never sets state
  // synchronously in the effect body itself.
  useEffect(() => {
    if (!activeCall || activeCall.status === 'ringing') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [activeCall]);

  // Auto-dial: once enabled, dial the next lead after a short preview delay.
  // The lead shown during that delay is purely derived (see autoPreviewLead
  // below) — the effect's only job is scheduling the eventual startCall.
  useEffect(() => {
    if (!autoDial || activeCall || upNextLeads.length === 0) return;
    const timer = setTimeout(() => startCall(upNextLeads[0], 'auto'), 2000);
    return () => clearTimeout(timer);
  }, [autoDial, activeCall, upNextLeads, startCall]);

  const autoPreviewLead = autoDial && !activeCall && upNextLeads.length > 0 ? upNextLeads[0] : null;
  const previewLead = manualPreviewLead ?? autoPreviewLead;
  const previewMode: 'manual' | 'auto' | null = manualPreviewLead ? 'manual' : (autoPreviewLead ? 'auto' : null);
  const displayedAvailability = derivedAvailability(activeCall, availability);
  const selectedDisposition = dispositions.find((d) => d.statusCode === disposition);

  const handleManualCall = () => {
    if (!dialNumber.trim()) return;
    startCall(makeAdHocLead(dialNumber.trim(), currentCampaignId, 'MANUAL'), 'manual');
    setDialNumber('');
  };

  const handlePreviewNext = () => {
    if (upNextLeads.length === 0) return;
    setManualPreviewLead(upNextLeads[0]);
  };

  const handleSimulateIncoming = () => {
    const inboundLead = makeAdHocLead('5550001234', currentCampaignId, 'INBOUND');
    startCall(inboundLead, 'manual', 'inbound');
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    setTimelineEvents((prev) => [
      ...prev,
      { id: `note-${Date.now()}`, icon: 'note', title: 'Note Added', description: noteInput.trim(), time: new Date().toLocaleTimeString() },
    ]);
    setNoteInput('');
  };

  const addTag = () => setTags((prev) => [...prev, `Tag ${prev.length + 1}`]);

  const handleTransfer = (target: string) => {
    setTransferAnchor(null);
    setTimelineEvents((prev) => [
      ...prev,
      { id: `transfer-${Date.now()}`, icon: 'transfer', title: 'Call Transferred', description: `Transferred to ${target}`, time: new Date().toLocaleTimeString() },
    ]);
    endCall();
  };

  const canSaveDisposition = Boolean(disposition)
    && (!selectedDisposition?.requiresNotes || dispositionNotes.trim().length > 0)
    && (!selectedDisposition?.requiresCallback || callbackTime !== null);

  const handleSaveDisposition = () => {
    if (!activeCall || !selectedDisposition) return;
    if (selectedDisposition.requiresCallback && callbackTime) {
      scheduleCallback({
        id: `cb-${Date.now()}`,
        leadId: activeCall.lead.leadId,
        campaignId: activeCall.campaignId,
        agentUser: user!.username,
        scheduledTime: callbackTime.toISOString(),
        notes: dispositionNotes,
        createdAt: new Date().toISOString(),
      });
    }
    endCall();
  };

  const filteredArticles = knowledgeArticles
    .filter((article) => article.title.toLowerCase().includes(kbSearch.toLowerCase()))
    .slice()
    .sort((a, b) => (kbTab === 0 ? b.relevance - a.relevance : 0));

  const leadCallbacks = activeCall ? callbacks.filter((cb) => cb.leadId === activeCall.lead.leadId) : [];
  const scriptText = (currentCampaign ? callScripts[currentCampaign.campaignId] : undefined) ?? defaultCallScript;

  return (
    <Box>
      <PageHeader
        title="Dialer"
        subtitle={currentCampaign ? `Working campaign: ${currentCampaign.campaignName}` : 'Select a campaign to begin dialing.'}
      />

      {!currentCampaignId && (
        <Alert severity="warning" sx={{ mb: 3 }} action={<Button component={RouterLink} to="/agent/home/campaign-selection" size="small">Select Campaign</Button>}>
          No campaign selected.
        </Alert>
      )}

      {currentCampaignId && !activeCall && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Manual Dial</Typography>
                <TextField
                  fullWidth
                  value={dialNumber}
                  onChange={(event) => setDialNumber(event.target.value.replace(/[^0-9*#]/g, ''))}
                  placeholder="Enter phone number"
                  sx={{ mb: 2 }}
                  slotProps={{ input: { style: { fontSize: 20, letterSpacing: 1 } } }}
                />
                <Grid container spacing={1} sx={{ mb: 2, maxWidth: 280 }}>
                  {DIALPAD_KEYS.map((key) => (
                    <Grid size={4} key={key}>
                      <Button fullWidth variant="outlined" sx={{ fontSize: 18, py: 1 }} onClick={() => setDialNumber((prev) => prev + key)}>
                        {key}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" startIcon={<CallOutlined />} disabled={!dialNumber.trim()} onClick={handleManualCall}>
                    Call
                  </Button>
                  <IconButton onClick={() => setDialNumber((prev) => prev.slice(0, -1))} disabled={!dialNumber}>
                    <BackspaceOutlined />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>

            {currentCampaign?.dialMethod === 'INBOUND' && (
              <Card>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Inbound Queue</Typography>
                      <Typography variant="body2" color="text.secondary">Simulate a customer call ringing in.</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<PhoneOutlined />} onClick={handleSimulateIncoming}>Simulate Incoming Call</Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Up Next</Typography>
                  <FormControlLabel
                    control={<Switch checked={autoDial} onChange={(event) => setAutoDial(event.target.checked)} />}
                    label="Auto-Dial"
                  />
                </Stack>

                {previewLead && (
                  <Card variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(224,32,58,0.04)' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {previewMode === 'auto' ? 'Auto-dialing next lead…' : 'Preview'}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{leadName(previewLead)}</Typography>
                      <Typography variant="body2" color="text.secondary">{formatPhone(previewLead.phoneNumber)}</Typography>
                      {previewMode === 'auto' ? (
                        <CircularProgress size={20} sx={{ mt: 1.5 }} />
                      ) : (
                        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                          <Button size="small" variant="contained" onClick={() => { startCall(previewLead, 'preview'); setManualPreviewLead(null); }}>
                            Dial Now
                          </Button>
                          <Button size="small" onClick={() => setManualPreviewLead(null)}>Skip</Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!previewLead && (
                  <Button fullWidth variant="outlined" sx={{ mb: 2 }} disabled={upNextLeads.length === 0} onClick={handlePreviewNext}>
                    Preview Next Lead
                  </Button>
                )}

                <Stack divider={<Divider />} spacing={1}>
                  {upNextLeads.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No leads loaded for this campaign.
                    </Typography>
                  )}
                  {upNextLeads.map((lead) => (
                    <Stack key={lead.leadId} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{leadName(lead)}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatPhone(lead.phoneNumber)}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <StatusBadge label={lead.status} />
                        <IconButton size="small" color="primary" onClick={() => startCall(lead, 'click-to-call')}>
                          <CallOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeCall?.status === 'ringing' && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 24 }}>
              {leadName(activeCall.lead).split(' ').map((n) => n[0]).join('')}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{leadName(activeCall.lead)}</Typography>
            <Typography variant="body1" color="text.secondary">{formatPhone(activeCall.lead.phoneNumber)}</Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'info.main', fontWeight: 600 }}>
              {activeCall.direction === 'inbound' ? 'Incoming Call…' : 'Connecting…'}
            </Typography>
            {activeCall.direction === 'inbound' ? (
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="success" startIcon={<CallOutlined />} onClick={() => advanceCallStatus('connected')}>
                  Answer Call
                </Button>
                <Button variant="outlined" color="error" startIcon={<CallEndOutlined />} onClick={endCall}>
                  Decline
                </Button>
              </Stack>
            ) : (
              <CircularProgress sx={{ mt: 3 }} />
            )}
          </CardContent>
        </Card>
      )}

      {activeCall && activeCall.status !== 'ringing' && (
        <>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', flexWrap: 'wrap', gap: 1.5 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: activeCall.status === 'wrapup' ? 'warning.main' : 'success.main' }} />
              <StatusBadge label={displayedAvailability} tone={AVAILABILITY_TONE[displayedAvailability]} />
              <Typography variant="body1" color="text.secondary">{formatDuration(elapsed)}</Typography>
              <VolumeUpOutlined fontSize="small" color="action" />
            </Stack>
            {activeCall.status !== 'wrapup' && (
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" color="error" startIcon={<CallEndOutlined />} onClick={() => advanceCallStatus('wrapup')}>
                  End Call
                </Button>
              </Stack>
            )}
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{leadName(activeCall.lead).split(' ').map((n) => n[0]).join('')}</Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{leadName(activeCall.lead)}</Typography>
                        <StatusBadge label={activeCall.lead.status} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">Lead ID: {activeCall.lead.leadId}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', color: 'text.secondary' }}>
                    {activeCall.lead.email && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><EmailOutlined fontSize="inherit" /><Typography variant="caption">{activeCall.lead.email}</Typography></Stack>
                    )}
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><PhoneOutlined fontSize="inherit" /><Typography variant="caption">{formatPhone(activeCall.lead.phoneNumber)}</Typography></Stack>
                    {activeCall.lead.city && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><LocationOnOutlined fontSize="inherit" /><Typography variant="caption">{activeCall.lead.city}, {activeCall.lead.province}</Typography></Stack>
                    )}
                  </Stack>

                  <Tabs value={profileTab} onChange={(_, v) => setProfileTab(v)} sx={{ mb: 2, minHeight: 36 }}>
                    {PROFILE_TABS.map((label) => <Tab key={label} label={label} sx={{ minHeight: 36, fontSize: 13 }} />)}
                  </Tabs>

                  {profileTab === 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Interaction Timeline</Typography>
                      <Stack spacing={2} sx={{ mb: 2 }}>
                        {timelineEvents.map((event) => {
                          const { icon: Icon, color } = TIMELINE_ICONS[event.icon];
                          return (
                            <Stack key={event.id} direction="row" spacing={1.5}>
                              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: `${color}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon sx={{ fontSize: 16, color }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.title}</Typography>
                                  <Typography variant="caption" color="text.secondary">{event.time}</Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">{event.description}</Typography>
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                      <Stack direction="row" spacing={1.5}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add a note..."
                          value={noteInput}
                          onChange={(event) => setNoteInput(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && addNote()}
                        />
                        <Button variant="contained" onClick={addNote}>Add Note</Button>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                        <Chip label="+ Add Tag" size="small" variant="outlined" onClick={addTag} sx={{ cursor: 'pointer' }} />
                      </Stack>
                    </>
                  )}

                  {profileTab === 1 && (
                    <Grid container spacing={2}>
                      {([
                        ['List ID', activeCall.lead.listId || '—'],
                        ['Source', activeCall.lead.sourceId || '—'],
                        ['Address', activeCall.lead.address || '—'],
                        ['City', activeCall.lead.city || '—'],
                        ['Province', activeCall.lead.province || '—'],
                        ['Vendor Lead Code', activeCall.lead.vendorLeadCode || '—'],
                      ] as const).map(([label, value]) => (
                        <Grid size={{ xs: 6, sm: 4 }} key={label}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {profileTab === 2 && (
                    <Stack spacing={2}>
                      <Grid container spacing={2}>
                        {([
                          ['Times Called', activeCall.lead.calledCount],
                          ['Last Call', activeCall.lead.lastCallTime || 'Never'],
                          ['Next Callback', activeCall.lead.nextCallbackTime || 'None scheduled'],
                        ] as const).map(([label, value]) => (
                          <Grid size={{ xs: 6, sm: 4 }} key={label}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      {leadCallbacks.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Scheduled Callbacks</Typography>
                          <Stack spacing={1}>
                            {leadCallbacks.map((cb) => (
                              <Typography key={cb.id} variant="body2" color="text.secondary">
                                {new Date(cb.scheduledTime).toLocaleString()} — {cb.notes || 'No notes'}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {profileTab === 3 && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {scriptText.replace('{firstName}', activeCall.lead.firstName).replace('{agent}', user!.displayName)}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {currentCampaign && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Campaign Info</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Campaign</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{currentCampaign.campaignName}</Typography></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Type</Typography><StatusBadge label={currentCampaign.type} tone="info" /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Dial Method</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{currentCampaign.dialMethod}</Typography></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Leads Remaining</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{currentCampaign.leadsRemaining}</Typography></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {activeCall.status !== 'wrapup' && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Call Control</Typography>
                    <Stack direction="row" spacing={1.5}>
                      <IconButton onClick={() => setMuted((v) => !v)} sx={{ bgcolor: muted ? 'error.main' : 'action.hover', color: muted ? '#fff' : 'inherit' }}>
                        {muted ? <MicOffOutlined /> : <MicOutlined />}
                      </IconButton>
                      <IconButton
                        onClick={() => advanceCallStatus(activeCall.status === 'hold' ? 'connected' : 'hold')}
                        sx={{ bgcolor: activeCall.status === 'hold' ? 'warning.main' : 'action.hover', color: activeCall.status === 'hold' ? '#fff' : 'inherit' }}
                      >
                        {activeCall.status === 'hold' ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                      </IconButton>
                      <IconButton sx={{ bgcolor: 'action.hover' }} onClick={(event) => setDtmfAnchor(event.currentTarget)}>
                        <DialpadOutlined />
                      </IconButton>
                      <IconButton sx={{ bgcolor: 'action.hover' }} onClick={(event) => setTransferAnchor(event.currentTarget)}>
                        <PhoneForwardedOutlined />
                      </IconButton>
                    </Stack>
                    <Popover anchorEl={dtmfAnchor} open={Boolean(dtmfAnchor)} onClose={() => setDtmfAnchor(null)}>
                      <Grid container spacing={0.5} sx={{ p: 1.5, maxWidth: 180 }}>
                        {DIALPAD_KEYS.map((key) => (
                          <Grid size={4} key={key}>
                            <Button sx={{ minWidth: 0 }}>{key}</Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Popover>
                    <Menu anchorEl={transferAnchor} open={Boolean(transferAnchor)} onClose={() => setTransferAnchor(null)}>
                      {TRANSFER_TARGETS.map((target) => (
                        <MenuItem key={target} onClick={() => handleTransfer(target)}>{target}</MenuItem>
                      ))}
                    </Menu>
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Knowledge Base</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search articles..."
                    value={kbSearch}
                    onChange={(event) => setKbSearch(event.target.value)}
                    slotProps={{ input: { startAdornment: <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} /> } }}
                    sx={{ mb: 2 }}
                  />
                  <Tabs value={kbTab} onChange={(_, v) => setKbTab(v)} sx={{ mb: 1.5, minHeight: 32 }}>
                    {KB_TABS.map((label) => <Tab key={label} label={label} sx={{ minHeight: 32, fontSize: 13 }} />)}
                  </Tabs>
                  <Stack divider={<Divider />} spacing={1.5}>
                    {filteredArticles.map((article) => (
                      <Box key={article.id} sx={{ py: 0.5 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, pr: 1 }}>{article.title}</Typography>
                          <Chip label={article.category} size="small" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{article.relevance}% match</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              {activeCall.status === 'wrapup' && (
                <Alert severity="warning" sx={{ mb: 2 }}>Call ended. Select a disposition to finish.</Alert>
              )}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Select
                    size="small"
                    displayEmpty
                    value={disposition}
                    onChange={(event) => setDisposition(event.target.value)}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value=""><em>Select Disposition</em></MenuItem>
                    {dispositions.map((option) => <MenuItem key={option.statusCode} value={option.statusCode}>{option.label}</MenuItem>)}
                  </Select>
                  {selectedDisposition?.requiresCallback && (
                    <DateTimePicker
                      label="Callback time"
                      value={callbackTime}
                      onChange={(value) => setCallbackTime(value)}
                      minDateTime={dayjs()}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  )}
                  <TextField
                    size="small"
                    placeholder={selectedDisposition?.requiresNotes ? 'Notes required for this disposition...' : 'Enter disposition notes...'}
                    value={dispositionNotes}
                    onChange={(event) => setDispositionNotes(event.target.value)}
                    sx={{ flex: 1, minWidth: 220 }}
                  />
                  <Button variant="contained" startIcon={<SaveOutlined />} disabled={!canSaveDisposition} onClick={handleSaveDisposition}>
                    Save Disposition
                  </Button>
                </Stack>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
