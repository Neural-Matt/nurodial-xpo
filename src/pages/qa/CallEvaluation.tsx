import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Slider, Switch,
  FormControlLabel, TextField, Stack, Divider, Collapse, Avatar, Link,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import PauseOutlined from '@mui/icons-material/PauseOutlined';
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { scorecardCriteria, callDetails, evaluationDetails, defaultFeedback } from '../../services/mock/qa';

const WAVEFORM_BARS = [
  28, 42, 58, 35, 50, 68, 40, 55, 78, 45, 60, 34, 52, 64, 38, 30, 56, 72, 44, 58,
  36, 50, 40, 64, 80, 54, 38, 30, 46, 60, 70, 50, 34, 58, 44, 54, 40, 64, 50, 30,
  46, 62, 38, 52, 70, 42, 56, 32,
];

const FEEDBACK_LIMIT = 1000;

function initialScores() {
  return Object.fromEntries(scorecardCriteria.map((c) => [c.id, c.score]));
}

export function CallEvaluation() {
  const [scores, setScores] = useState<Record<string, number>>(initialScores());
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(scorecardCriteria.map((c) => [c.id, true])),
  );
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [playing, setPlaying] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);

  const handleDiscard = () => {
    setScores(initialScores());
    setFeedback(defaultFeedback);
  };

  return (
    <Box>
      <Link
        component={RouterLink}
        to="/qa/evaluations-queue"
        underline="hover"
        color="text.secondary"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, fontSize: 14 }}
      >
        <ArrowBackOutlined fontSize="small" /> Back to Evaluations Queue
      </Link>

      <PageHeader
        title="Call Evaluation"
        subtitle="Evaluate agent performance using the scorecard and provide feedback."
        actions={
          <>
            <Button variant="outlined">Save Draft</Button>
            <Button variant="contained">Submit Evaluation</Button>
          </>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Call Recording</Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <IconButton onClick={() => setPlaying((p) => !p)} sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}>
                  {playing ? <PauseOutlined /> : <PlayArrowOutlined />}
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                  00:00 / {callDetails.duration}
                </Typography>
                <Stack direction="row" spacing={0.4} sx={{ flex: 1, alignItems: 'center', height: 32, overflow: 'hidden' }}>
                  {WAVEFORM_BARS.map((height, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 3,
                        borderRadius: 1,
                        height: `${height}%`,
                        bgcolor: idx < 14 ? 'primary.main' : 'rgba(224,32,58,0.25)',
                      }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">1x</Typography>
                <IconButton size="small"><VolumeUpOutlined fontSize="small" /></IconButton>
                <IconButton size="small"><DownloadOutlined fontSize="small" /></IconButton>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Evaluation Scorecard</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Switch size="small" checked={autoCalculate} onChange={(e) => setAutoCalculate(e.target.checked)} />}
                    label={<Typography variant="caption">Auto-Calculate</Typography>}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    Total Score {totalScore}/100
                  </Typography>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <Stack divider={<Divider />}>
                {scorecardCriteria.map((criterion) => (
                  <Box key={criterion.id} sx={{ py: 2 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {criterion.label} <Typography component="span" variant="caption" color="text.secondary">(Weight: {criterion.weight}%)</Typography>
                        </Typography>
                        <Collapse in={expanded[criterion.id]}>
                          <Typography variant="caption" color="text.secondary">{criterion.description}</Typography>
                        </Collapse>
                        <Slider
                          size="small"
                          value={scores[criterion.id]}
                          min={0}
                          max={criterion.maxScore}
                          marks={[0, 0.25, 0.5, 0.75, 1].map((f) => ({ value: Math.round(f * criterion.maxScore) }))}
                          onChange={(_, value) => setScores((prev) => ({ ...prev, [criterion.id]: value as number }))}
                          sx={{ mt: 1, maxWidth: 360 }}
                        />
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {scores[criterion.id]} / {criterion.maxScore}
                        </Typography>
                        <IconButton size="small" onClick={() => setExpanded((prev) => ({ ...prev, [criterion.id]: !prev[criterion.id] }))}>
                          {expanded[criterion.id] ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Overall Feedback</Typography>
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Provide constructive feedback for the agent."
                value={feedback}
                onChange={(event) => setFeedback(event.target.value.slice(0, FEEDBACK_LIMIT))}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                {feedback.length}/{FEEDBACK_LIMIT}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={handleDiscard}>Discard</Button>
                <Button variant="contained">Submit Evaluation</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Call Details</Typography>
              <Stack spacing={1.5}>
                {([
                  ['Call ID', callDetails.callId],
                  ['Date & Time', callDetails.dateTime],
                  ['Duration', callDetails.duration],
                ] as const).map(([label, value]) => (
                  <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                  </Stack>
                ))}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Direction</Typography>
                  <StatusBadge label={callDetails.direction} />
                </Stack>
                {([
                  ['Customer', callDetails.customer],
                  ['Phone Number', callDetails.phoneNumber],
                  ['Campaign', callDetails.campaign],
                  ['Queue', callDetails.queue],
                ] as const).map(([label, value]) => (
                  <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                  </Stack>
                ))}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Agent</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>{callDetails.agent[0]}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{callDetails.agent}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Evaluation Details</Typography>
              <Stack spacing={1.5}>
                {([
                  ['Scorecard', evaluationDetails.scorecard],
                  ['Form', evaluationDetails.form],
                ] as const).map(([label, value]) => (
                  <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                  </Stack>
                ))}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Evaluator</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>{evaluationDetails.evaluator[0]}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{evaluationDetails.evaluator}</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <StatusBadge label={evaluationDetails.status} />
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{evaluationDetails.dueDate}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Attachments</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Call Transcript</Typography>
                  <Link component="button" underline="hover" variant="body2" sx={{ fontWeight: 600 }}>View</Link>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Customer Feedback</Typography>
                  <Link component="button" underline="hover" variant="body2" sx={{ fontWeight: 600 }}>View</Link>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
