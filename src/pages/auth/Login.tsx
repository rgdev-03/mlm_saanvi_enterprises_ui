import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Alert,
  Loader,
  Box,
  Anchor,
  Checkbox,
  Divider,
  Avatar,
  rem,
} from '@mantine/core';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const STEEL = '#243447';
  const SCARLET = '#E63946';
  const INPUT_BG = '#1f2a30';
  const INPUT_BORDER = 'rgba(255,255,255,0.06)';
  const TEXT_DIM = 'rgba(255,255,255,0.75)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${STEEL} 0%, #33505A 60%)`,
        position: 'relative',
        padding: '48px',
      }}
    >
      {/* decorative circles */}
      <Box
        style={{
          position: 'absolute',
          width: rem(260),
          height: rem(260),
          borderRadius: '50%',
          background: 'rgba(230,57,70,0.06)', // subtle scarlet tint
          filter: 'blur(32px)',
          top: '40px',
          left: '40px',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          width: rem(160),
          height: rem(160),
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          filter: 'blur(20px)',
          bottom: '40px',
          right: '40px',
          pointerEvents: 'none',
        }}
      />

      <Container size={650} px="sm">
        <Paper
          radius="md"
          p="xl"
          w="30rem"
          withBorder
          shadow="xl"
          style={{
            backdropFilter: 'blur(6px)',
            background: 'linear-gradient(180deg, rgba(36,52,71,0.95), rgba(36,52,71,0.9))',
            border: `1px solid rgba(255,255,255,0.04)`,
            color: 'white',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <div>
                

                <Title order={2} ta="center" style={{ color: '#fff' }}>
                  Welcome back
                </Title>
                <Text size="sm" color="dimmed" ta="center" mt={4} style={{ color: TEXT_DIM }}>
                  Sign in to your account to continue
                </Text>
              </div>

              {error && (
                <Alert title="Error" color="red" radius="md">
                  {error}
                </Alert>
              )}

              <Stack gap="sm">
                <TextInput
                  label="Username"
                  placeholder="your.username"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
                  autoComplete="username"
                  styles={{
                    label: { color: 'rgba(255,255,255,0.85)' },
                    input: {
                      background: INPUT_BG,
                      color: '#fff',
                      border: `1px solid ${INPUT_BORDER}`,
                      height: rem(42),
                    },
                    wrapper: { width: '100%' },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
                  autoComplete="current-password"
                  styles={{
                    label: { color: 'rgba(255,255,255,0.85)' },
                    input: {
                      background: INPUT_BG,
                      color: '#fff',
                      border: `1px solid ${INPUT_BORDER}`,
                      height: rem(42),
                    },
                  }}
                />

                <Group justify="space-between" align="center" style={{ marginTop: rem(6) }}>
                  <Checkbox
                    label="Remember me"
                    checked={remember}
                    onChange={(event) => setRemember(event.currentTarget.checked)}
                    disabled={loading}
                    styles={{
                      label: { color: TEXT_DIM },
                      input: { background: 'transparent' },
                    }}
                  />

                  <Anchor component={Link} to="/auth/forgot" size="sm" style={{ color: SCARLET }}>
                    Forgot password?
                  </Anchor>
                </Group>

                <Button
                  type="submit"
                  fullWidth
                  radius="md"
                  size="md"
                  loading={loading}
                  style={{
                    backgroundColor: SCARLET,
                    color: 'white',
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader size="sm" color="white" /> <span style={{ marginLeft: 10 }}>Signing in...</span>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <Divider label="Or continue with" labelPosition="center" style={{ color: 'rgba(255,255,255,0.45)' }} />

                {/* social buttons placeholder (disabled) */}
                {/* <Group grow gap="sm">
                  <Button component="button" radius="md" size="md" variant="default" disabled>
                    Google
                  </Button>
                  <Button component="button" radius="md" size="md" variant="default" disabled>
                    GitHub
                  </Button>
                </Group> */}
              </Stack>

              <Group justify="center" mt="sm">
                <Text size="sm" color="dimmed" style={{ color: TEXT_DIM }}>
                  Don't have an account?{' '}
                  <Anchor component={Link} to="/auth/signup" style={{ color: SCARLET }}>
                    Sign up
                  </Anchor>
                </Text>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
