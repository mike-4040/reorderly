import { Title, Text, Container, Button, Stack, Skeleton } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AccountSection } from '../components/AccountSection';
import { EmailSection } from '../components/EmailSection';
import { PasswordSection } from '../components/PasswordSection';
import { SetPasswordForm } from '../components/SetPasswordForm';
import { UserInfoSection } from '../components/UserInfoSection';
import { useAuth } from '../contexts/useAuth';
import { useUserData } from '../hooks/useUserData';
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
  const { user, signInWithCustomToken } = useAuth();
  const {
    data: userData,
    isLoading: isLoadingUserData,
    error: errorUserData,
  } = useUserData();
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

  // Check if user has password authentication enabled
  const hasPassword = user?.providerData.some(
    (provider) => provider.providerId === 'password',
  );

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
          {isLoadingUserData && <Skeleton height={150} />}
          {errorUserData && (
            <Text c="red" size="sm">
              Failed to load user information
            </Text>
          )}
          {userData && <UserInfoSection userData={userData} />}

          <EmailSection user={user} />

          {hasPassword ? (
            <PasswordSection user={user} />
          ) : (
            <SetPasswordForm user={user} />
          )}

          <AccountSection user={user} />
        </Stack>
      )}
    </Container>
  );
}
