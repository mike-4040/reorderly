import { Title, Text, Container, Button, Stack } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/useAuth';
import { getFunctionsUrl } from '../utils/env';

interface SettingsSearch {
  token?: string;
}

export const Route = createFileRoute('/settings')({
  component: Settings,
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    };
  },
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
        <Stack mt="md" align="flex-start">
          <Text>Logged in as {user.uid}</Text>
          <Button onClick={() => void signOut()}>
            Logout
          </Button>
        </Stack>
      )}
    </Container>
  );
}
