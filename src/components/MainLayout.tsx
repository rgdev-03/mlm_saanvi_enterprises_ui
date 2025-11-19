import { Outlet } from 'react-router-dom';
import { AppShell, Group, Title, Button, Burger, Stack, Text, Avatar, Menu } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';

export function MainLayout() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <AppShell
      padding="md"
      header={{ height: { base: 60, md: 70, lg: 80 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 400 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3}>Dashboard</Title>
          </Group>
          <Group visibleFrom="sm">
        <Text size="sm">{userName}</Text>
        <Button size="sm" variant="subtle" onClick={handleLogout}>
          Logout
        </Button>
          </Group>
          <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <Avatar 
            size="sm" 
            radius="xl" 
            style={{ cursor: 'pointer' }}
            hiddenFrom="sm"
          >
            {userName?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{userName}</Menu.Label>
          <Menu.Item onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="md">
          <Button fullWidth variant="subtle" justify="flex-start">
            Dashboard
          </Button>
          <Button fullWidth variant="subtle" justify="flex-start">
            Users
          </Button>
          <Button fullWidth variant="subtle" justify="flex-start">
            Reports
          </Button>
          <Button fullWidth variant="subtle" justify="flex-start">
            Settings
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
