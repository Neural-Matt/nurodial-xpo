import { useEffect, useState, type ElementType } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab, TextField,
  Stack, Avatar, Chip, Select, MenuItem, Divider,
} from '@mui/material';
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined';
import MicOutlined from '@mui/icons-material/MicOutlined';
import MicOffOutlined from '@mui/icons-material/MicOffOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import DialpadOutlined from '@mui/icons-material/DialpadOutlined';
import PhoneForwardedOutlined from '@mui/icons-material/PhoneForwardedOutlined';
import AddIcCallOutlined from '@mui/icons-material/AddIcCallOutlined';
import CallEndOutlined from '@mui/icons-material/CallEndOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import NoteAddOutlined from '@mui/icons-material/NoteAddOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  customerProfile, interactionOverview, timeline as initialTimeline, callControl,
  knowledgeArticles, interactionTags as initialTags, dispositionOptions,
} from '../../services/mock/agentInteraction';
import type { TimelineEvent } from '../../services/mock/agentInteraction';
import { colors } from '../../theme/palette';

const TIMELINE_ICONS: Record<TimelineEvent['icon'], { icon: ElementType; color: string }> = {
  call: { icon: PhoneOutlined, color: colors.info },
  verify: { icon: VerifiedOutlined, color: colors.success },
  note: { icon: NoteAddOutlined, color: colors.warning },
  tag: { icon: LocalOfferOutlined, color: colors.primary },
  transfer: { icon: SwapHorizOutlined, color: colors.info },
};

function formatDuration(totalSeconds: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const PROFILE_TABS = ['Interaction', 'Details', 'History', 'Notes', 'Tasks'];
const KB_TABS = ['Recommended', 'Recent'];

export function ActiveInteraction() {
  const [elapsed, setElapsed] = useState(258);
  const [profileTab, setProfileTab] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState(initialTimeline);
  const [noteInput, setNoteInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [tags, setTags] = useState(initialTags);
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [disposition, setDisposition] = useState('');
  const [kbTab, setKbTab] = useState(0);
  const [kbSearch, setKbSearch] = useState('');

  useEffect(() => {
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const addNote = () => {
    if (!noteInput.trim()) return;
    setTimelineEvents((prev) => [
      ...prev,
      { id: `note-${Date.now()}`, icon: 'note', title: 'Note Added', description: noteInput.trim(), time: new Date().toLocaleTimeString() },
    ]);
    setNoteInput('');
  };

  const addTag = () => setTags((prev) => [...prev, `Tag ${prev.length + 1}`]);

  const filteredArticles = knowledgeArticles
    .filter((article) => article.title.toLowerCase().includes(kbSearch.toLowerCase()))
    .slice()
    .sort((a, b) => (kbTab === 0 ? b.relevance - a.relevance : 0));

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', flexWrap: 'wrap', gap: 1.5 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="body1" sx={{ fontWeight: 700 }}>Active Interaction</Typography>
          <Typography variant="body1" color="text.secondary">{formatDuration(elapsed)}</Typography>
          <VolumeUpOutlined fontSize="small" color="action" />
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined">Wrap Up</Button>
          <Button variant="contained" color="error">End Interaction</Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{customerProfile.name.split(' ').map((n) => n[0]).join('')}</Avatar>
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{customerProfile.name}</Typography>
                    {customerProfile.verified && <StatusBadge label="Verified" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Customer since {customerProfile.customerSince}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', color: 'text.secondary' }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><EmailOutlined fontSize="inherit" /><Typography variant="caption">{customerProfile.email}</Typography></Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><PhoneOutlined fontSize="inherit" /><Typography variant="caption">{customerProfile.phone}</Typography></Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><LocationOnOutlined fontSize="inherit" /><Typography variant="caption">{customerProfile.location}</Typography></Stack>
                <Typography variant="caption">Account ID: {customerProfile.accountId}</Typography>
              </Stack>

              <Tabs value={profileTab} onChange={(_, v) => setProfileTab(v)} sx={{ mb: 2, minHeight: 36 }}>
                {PROFILE_TABS.map((label) => <Tab key={label} label={label} sx={{ minHeight: 36, fontSize: 13 }} />)}
              </Tabs>

              {profileTab === 0 ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Overview</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {([
                      ['Interaction ID', interactionOverview.interactionId],
                      ['Channel', interactionOverview.channel],
                      ['Queue', interactionOverview.queue],
                      ['Start Time', interactionOverview.startTime],
                      ['Agent', interactionOverview.agent],
                      ['Duration', formatDuration(elapsed)],
                    ] as const).map(([label, value]) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={label}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                      </Grid>
                    ))}
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Status</Typography>
                      <StatusBadge label={interactionOverview.status} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Priority</Typography>
                      <StatusBadge label={interactionOverview.priority} />
                    </Grid>
                  </Grid>

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
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No {PROFILE_TABS[profileTab].toLowerCase()} to show yet.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Call Control</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <TextField label="From" size="small" value={callControl.from} sx={{ minWidth: 200 }} slotProps={{ input: { readOnly: true } }} />
                <TextField label="To" size="small" value={callControl.to} sx={{ minWidth: 200 }} slotProps={{ input: { readOnly: true } }} />
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                <IconButton onClick={() => setMuted((v) => !v)} sx={{ bgcolor: muted ? 'error.main' : 'action.hover', color: muted ? '#fff' : 'inherit' }}>
                  {muted ? <MicOffOutlined /> : <MicOutlined />}
                </IconButton>
                <IconButton onClick={() => setOnHold((v) => !v)} sx={{ bgcolor: onHold ? 'warning.main' : 'action.hover', color: onHold ? '#fff' : 'inherit' }}>
                  <PauseCircleOutlined />
                </IconButton>
                <IconButton sx={{ bgcolor: 'action.hover' }}><DialpadOutlined /></IconButton>
                <IconButton sx={{ bgcolor: 'action.hover' }}><PhoneForwardedOutlined /></IconButton>
                <IconButton sx={{ bgcolor: 'action.hover' }}><AddIcCallOutlined /></IconButton>
              </Stack>
              <Button variant="contained" color="error" startIcon={<CallEndOutlined />}>End Call</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Interaction Tags</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                <Chip label="+ Add Tag" size="small" variant="outlined" onClick={addTag} sx={{ cursor: 'pointer' }} />
              </Stack>
            </CardContent>
          </Card>
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
              <Select size="small" fullWidth defaultValue="all" sx={{ mb: 2 }}>
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="billing">Billing</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
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
              <Button fullWidth sx={{ mt: 2 }}>View All Articles</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter disposition notes..."
              value={dispositionNotes}
              onChange={(event) => setDispositionNotes(event.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <Select
              size="small"
              displayEmpty
              value={disposition}
              onChange={(event) => setDisposition(event.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value=""><em>Select Disposition</em></MenuItem>
              {dispositionOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
            <Button variant="contained" startIcon={<SaveOutlined />}>Save Disposition</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
