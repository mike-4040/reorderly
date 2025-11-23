import { AppShell, Center, Group, Loader, Tabs } from '@mantine/core';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { User } from 'firebase/auth';

import { UserAccountMenu } from '../components/UserAccountMenu';
import { useAuth } from '../contexts/useAuth';

interface RouterContext {
  user: User | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user, isLoadingAuthState } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoadingAuthState) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <AppShell header={{ height: 60 }} padding="md" withBorder={false}>
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Tabs
            value={currentPath}
            onChange={(value) => {
              if (value) {
                void navigate({ to: value });
              }
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="/">Home</Tabs.Tab>
              {user && (
                <>
                  <Tabs.Tab value="/suppliers">Suppliers</Tabs.Tab>
                  <Tabs.Tab value="/settings">Settings</Tabs.Tab>
                </>
              )}
            </Tabs.List>
          </Tabs>

          <UserAccountMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <TanStackRouterDevtools />
    </AppShell>
  );
}
