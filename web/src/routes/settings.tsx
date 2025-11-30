import { Title, Text, Container, Button, Stack, Paper, Group, PasswordInput } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { sendEmailVerification, updatePassword } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { EmailForm } from '../components/EmailForm';
import { useAuth } from '../contexts/useAuth';
import { getFunctionsUrl } from '../utils/env';
import { digProperty } from '../utils/object';
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
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

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

  const handleResendVerification = async () => {
    if (!user) {
      return;
    }

    setResendSuccess(false);
    setResendError(null);

    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      const errCode = digProperty(err, 'code');
      switch (errCode) {
        case 'auth/too-many-requests':
          setResendError('Too many requests. Please try again later.');
          break;
        default:
          setResendError('Failed to send verification email. Please try again.');
      }
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPasswordError(null);
    setPasswordSuccess(false);

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsSettingPassword(true);

    try {
      await updatePassword(user, password);
      setPasswordSuccess(true);
      setPassword('');
      setConfirmPassword('');
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      const errCode = digProperty(err, 'code');
      switch (errCode) {
        case 'auth/requires-recent-login':
          setPasswordError('For security, please sign in again before setting a password');
          break;
        case 'auth/weak-password':
          setPasswordError('Password is too weak. Please use a stronger password');
          break;
        default:
          setPasswordError('Failed to set password. Please try again.');
      }
    } finally {
      setIsSettingPassword(false);
    }
  };

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
              <>
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
                      onClick={() => void handleResendVerification()}
                    >
                      Resend Verification
                    </Button>
                  )}
                </Group>
                {resendSuccess && (
                  <Text c="green" size="sm" mt="xs">
                    Verification email sent! Please check your inbox.
                  </Text>
                )}
                {resendError && (
                  <Text c="red" size="sm" mt="xs">
                    {resendError}
                  </Text>
                )}
              </>
            ) : (
              <EmailForm />
            )}
          </Paper>

          {/* Password Section */}
          <Paper withBorder p="md">
            <Title order={3} mb="md">
              Password
            </Title>

            <form onSubmit={(e) => void handleSetPassword(e)}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  disabled={isSettingPassword}
                />
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                  disabled={isSettingPassword}
                  error={passwordError}
                />
                <Button type="submit" loading={isSettingPassword} style={{ alignSelf: 'flex-start' }}>
                  Set Password
                </Button>
                {passwordSuccess && (
                  <Text c="green" size="sm">
                    Password set successfully!
                  </Text>
                )}
              </Stack>
            </form>
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
