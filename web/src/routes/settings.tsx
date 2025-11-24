import { Title, Text, Container, Button, Stack, Paper, Group } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { sendEmailVerification } from 'firebase/auth';
import { useEffect } from 'react';

import { EmailForm } from '../components/EmailForm';
import { useAuth } from '../contexts/useAuth';
import { getFunctionsUrl } from '../utils/env';
import { requireAuth } from '../utils/route-guards';

interface SettingsSearch {
  token?: string;
}

export const Route = createFileRoute('/settings')({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    };
  },
  beforeLoad: requireAuth,
  component: Settings,
});

function Settings() {
  const { token } = Route.useSearch();
  const { user, signInWithCustomToken, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      signInWithCustomToken(token)
        .then(() => {
          // Remove token from URL without adding to browser history
          void navigate({ to: '.', search: {}, replace: true });
        })
        .catch((error) => {
          console.error('Failed to sign in with custom token:', error);
        });
    }
  }, [token, signInWithCustomToken, navigate]);

  const functionsUrl = getFunctionsUrl();
  const squareLoginUrl = `${functionsUrl}/squareAuthorize?flow=login`;
  const squareInstallUrl = `${functionsUrl}/squareAuthorize?flow=install`;

  return (
    <Container>
      <Title order={1}>Settings</Title>
      <Text mt="md">Configure your settings</Text>

      {!user && (
        <Stack mt="md" align="flex-start">
          <Button component="a" href={squareLoginUrl}>
            Login with Square
          </Button>
          <Button component="a" href={squareInstallUrl}>
            Connect your Square Account
          </Button>
        </Stack>
      )}

      {user && (
        <Stack mt="xl" gap="xl">
          {/* Email Section */}
          <Paper withBorder p="md">
            <Title order={3} mb="md">
              Email Address
            </Title>

            {user.email ? (
              <Group gap="md">
                <Text>
                  {user.email}{' '}
                  {user.emailVerified ? (
                    <Text span c="green" fw={500}>
                      (Verified)
                    </Text>
                  ) : (
                    <Text span c="orange" fw={500}>
                      (Not Verified)
                    </Text>
                  )}
                </Text>
                {!user.emailVerified && (
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => void sendEmailVerification(user)}
                  >
                    Resend Verification
                  </Button>
                )}
              </Group>
            ) : (
              <EmailForm />
            )}
          </Paper>

          {/* Account Section */}
          <Paper withBorder p="md">
            <Title order={3} mb="md">
              Account
            </Title>
            <Stack gap="md" align="flex-start">
              <Text>User ID: {user.uid}</Text>
              <Button onClick={() => void signOut()}>Logout</Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}
