import { AppShell, Burger, Group, Text } from '@mantine/core';
import { FaBell, FaUserCircle } from 'react-icons/fa';

export default function AdminHeader({ toggle, opened }) {
  return (
    <AppShell.Header
      style={{
        height: '60px', // Ensures enough space
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#fff', // Makes sure it's not hidden on dark backgrounds
        zIndex: 10, // Bring to front if necessary
      }}
    >
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Text fw={700} size="lg">Admin Dashboard</Text>
      </Group>

      <Group gap="md">
        <FaBell size={20} color="#495057" />
        <FaUserCircle size={24} color="#495057" />
      </Group>
    </AppShell.Header>
  );
}
