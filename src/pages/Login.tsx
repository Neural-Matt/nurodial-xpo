import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert, Stack, Divider } from '@mui/material';
import { useAuth } from '../context/useAuth';
import { findAccountByUsername } from '../services/mock/accounts';
import { landingPathForRole } from '../config/landingPaths';
import { colors } from '../theme/palette';

const DEMO_ACCOUNTS = [
  { role: 'Administrator', user: 'admin', pass: 'admin123' },
  { role: 'Supervisor', user: 'supervisor', pass: 'supervisor123' },
  { role: 'Agent', user: 'agent', pass: 'agent123' },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      const role = findAccountByUsername(username)?.role ?? 'Agent';
      navigate(landingPathForRole(role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.pageBg,
        p: 2,
      }}
    >
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            N
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>NuroDial</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your contact center console.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
          Demo credentials
        </Typography>
        <Stack spacing={0.5}>
          {DEMO_ACCOUNTS.map((account) => (
            <Typography key={account.user} variant="caption" color="text.secondary">
              {account.role}: <code>{account.user}</code> / <code>{account.pass}</code>
            </Typography>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
