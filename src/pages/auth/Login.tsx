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

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    <Container size="sm" py={80}>
      <Paper p="md" radius="md" withBorder>
        <Stack gap="lg">
          <div>
            <Title order={2} ta="center" mb="xs">
              Welcome Back
            </Title>
            <Text color="dimmed" size="sm" ta="center">
              Sign in to your account to continue
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
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
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

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </form>

         
          <Group justify="center">
            <Text size="sm">
              Don't have an account?{' '}
              <Link to="/auth/signup" style={{ color: 'var(--mantine-color-blue-6)', textDecoration: 'none' }}>
                Sign up
              </Link>
            </Text>
          </Group>
        </Stack>
      </Paper>

      <Text size="xs" color="dimmed" ta="center" mt="md">
        Demo credentials: Use any username and password (min 6 chars)
      </Text>
    </Container>
  );
}
