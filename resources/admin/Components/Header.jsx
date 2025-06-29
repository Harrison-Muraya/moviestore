import { AppShell, Burger, Group, Skeleton } from '@mantine/core';


export default function Header({toggle, opened}) {
   
    return (
        <AppShell.Header>
                <Group h="100%" px="md">
                  <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                </Group>
              </AppShell.Header>
    );
}