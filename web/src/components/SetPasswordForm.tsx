import {
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { updatePassword, User } from 'firebase/auth';
import { useState } from 'react';

import { digProperty } from '../utils/object';

interface SetPasswordFormProps {
  user: User;
}

export function SetPasswordForm({ user }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSettingPassword(true);

    try {
      await updatePassword(user, password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errCode = digProperty(err, 'code');
      switch (errCode) {
        case 'auth/requires-recent-login':
          setError(
            'For security, please sign in again before setting a password',
          );
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password');
          break;
        default:
          setError('Failed to set password. Please try again.');
      }
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <Paper withBorder p="md">
      <Title order={3} mb="md">
        Set Password
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Set a password to enable email/password login in addition to Square
        OAuth.
      </Text>

      <form onSubmit={(e) => void handleSubmit(e)}>
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
            error={error}
          />
          <Button
            type="submit"
            loading={isSettingPassword}
            style={{ alignSelf: 'flex-start' }}
          >
            Set Password
          </Button>
          {success && (
            <Text c="green" size="sm">
              Password set successfully!
            </Text>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
