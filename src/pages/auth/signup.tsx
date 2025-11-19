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
    <Container size="sm" py={80}>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="lg">
          <div>
            <Title order={2} ta="center" mb="xs">
              Create Account
            </Title>
            <Text color="dimmed" size="sm" ta="center">
              Sign up to get started
            </Text>
          </div>

          {error && (
            <Alert title="Error" color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.currentTarget.value)}
                required
                disabled={loading}
              />

              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                disabled={loading}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                disabled={loading}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </Stack>
          </form>

          <Group justify="center">
            <Text size="sm">
              Already have an account?{' '}
              <Link to="/auth/login" style={{ color: 'var(--mantine-color-blue-6)', textDecoration: 'none' }}>
                Sign in
              </Link>
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
