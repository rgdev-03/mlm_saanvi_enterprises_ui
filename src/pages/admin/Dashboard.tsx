import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Button,
  Group,
  Stack,
  ThemeIcon,
  SimpleGrid,
} from '@mantine/core';

interface DashboardCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function AdminDashboard() {
  const { userEmail, userName, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Active Sessions',
      value: '456',
      icon: '⚡',
      color: 'green',
    },
    {
      title: 'Revenue',
      value: '$12,345',
      icon: '💰',
      color: 'yellow',
    },
    {
      title: 'Tasks Completed',
      value: '789',
      icon: '✅',
      color: 'teal',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text color="dimmed" size="sm">
            Welcome back, {userName}!
          </Text>
        </div>
        <Button color="red" variant="light" onClick={handleLogout}>
          Logout
        </Button>
      </Group>

      <Paper p="md" radius="md" withBorder mb="xl">
        <Stack gap="xs">
          <Text fw={500}>User Information</Text>
          <Group grow>
            <div>
              <Text size="sm" color="dimmed">
                Email
              </Text>
              <Text fw={500}>{userEmail}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">
                Name
              </Text>
              <Text fw={500}>{userName}</Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
        {dashboardCards.map((card, index) => (
          <Paper key={index} p="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" color="dimmed" fw={500}>
                {card.title}
              </Text>
              <Text size="xl">{card.icon}</Text>
            </Group>
            <Title order={3}>{card.value}</Title>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">
              Recent Activity
            </Title>
            <Stack gap="md">
              {['User John registered', 'New payment processed', 'System update completed'].map((activity, i) => (
                <Group key={i} justify="space-between">
                  <Text size="sm">{activity}</Text>
                  <Text size="xs" color="dimmed">
                    2 hours ago
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="md">
              Quick Actions
            </Title>
            <Stack gap="sm">
              <Button variant="light" fullWidth>
                View Users
              </Button>
              <Button variant="light" fullWidth>
                View Reports
              </Button>
              <Button variant="light" fullWidth>
                Settings
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
