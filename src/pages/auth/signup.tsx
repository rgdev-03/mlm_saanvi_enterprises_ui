import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  rem,
  Avatar,
} from '@mantine/core';

export function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const STEEL = '#243447';
  const SCARLET = '#E63946';
  const INPUT_BG = '#1f2a30';
  const INPUT_BORDER = 'rgba(255,255,255,0.06)';
  const TEXT_DIM = 'rgba(255,255,255,0.75)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        full_name: fullName,
        email,
        password,
      });

      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Signup failed');
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
      {/* subtle decorative tint */}
      <Box
        style={{
          position: 'absolute',
          width: rem(220),
          height: rem(220),
          borderRadius: '50%',
          background: 'rgba(230,57,70,0.04)',
          filter: 'blur(32px)',
          top: '36px',
          left: '36px',
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
                <Title order={2} ta="center" mb="xs" style={{ color: '#fff' }}>
                  Create Account
                </Title>
                <Text color="dimmed" size="sm" ta="center" style={{ color: TEXT_DIM }}>
                  Sign up to get started
                </Text>
              </div>

              {error && (
                <Alert title="Error" color="red" radius="md">
                  {error}
                </Alert>
              )}

              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
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

                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
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

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
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

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                  disabled={loading}
                  radius="md"
                  size="md"
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

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  style={{
                    backgroundColor: SCARLET,
                    color: 'white',
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader size="sm" color="white" /> <span style={{ marginLeft: 10 }}>Creating account...</span>
                    </>
                  ) : (
                    'Sign up'
                  )}
                </Button>
              </Stack>
            </Stack>
          </form>

          <Group justify="center" mt="md">
            <Text size="sm" style={{ color: TEXT_DIM }}>
              Already have an account?{' '}
              <Anchor component={Link} to="/auth/login" style={{ color: SCARLET, textDecoration: 'none' }}>
                Sign in
              </Anchor>
            </Text>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
