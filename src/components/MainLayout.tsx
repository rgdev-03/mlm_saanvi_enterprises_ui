import { Outlet } from 'react-router-dom';
import { AppShell, Group, Title, Button, Burger, Text, Avatar, Menu } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from './Sidebar';

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
        width: { base: 160, md: 220, lg: 260 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header
        style={{
          backgroundColor: '#243447',    // Steel Blue
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <Title order={3} c="white">Dashboard</Title>
          </Group>

            <Group visibleFrom="sm" p="md" align="center">
              <div>
              <Text size="sm" fw={500} c="white">
              Welcome,
              </Text>
              <Text size="sm" fw={700} c="white">
              {userName}
              </Text>
            </div>

            <Avatar size="md" radius="xl" color="white" style={{ backgroundColor: '#d21919ff' }}>
              {userName?.charAt(0)?.toUpperCase()}
            </Avatar>
            </Group>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Avatar
                size="sm"
                radius="xl"
                style={{ cursor: 'pointer' }}
                hiddenFrom="sm"
                bg="#ffffffff"
                c="white"
              >
                {userName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown >
              <Menu.Label>{userName}</Menu.Label>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>



      <AppShell.Navbar >
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main >
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
