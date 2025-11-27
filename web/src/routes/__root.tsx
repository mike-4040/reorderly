import { AppShell, Button, Center, Group, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { User } from 'firebase/auth';
import { useEffect } from 'react';

import { UserAccountMenu } from '../components/UserAccountMenu';
import { useAuth } from '../contexts/useAuth';
import { captureException } from '../utils/sentry';

interface RouterContext {
  user: User | null;
}

function ErrorComponent({ error }: { error: Error }) {
  useEffect(() => {
    // Capture error to Sentry only once
    captureException(error);
  }, [error]);

  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Title order={1}>Something went wrong</Title>
        <Text c="dimmed">We've been notified and are looking into it.</Text>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </Stack>
    </Center>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: ErrorComponent,
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
