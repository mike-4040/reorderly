import { Modal, Stack, PasswordInput, Button, Text } from '@mantine/core';
import { updatePassword, User } from 'firebase/auth';
import { useState } from 'react';

import { digProperty } from '../utils/object';

interface ChangePasswordModalProps {
  user: User;
  opened: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  user,
  opened,
  onClose,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsChanging(true);

    try {
      await updatePassword(user, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmNewPassword('');
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const errCode = digProperty(err, 'code');
      switch (errCode) {
        case 'auth/requires-recent-login':
          setError(
            'For security, please sign in again before changing your password',
          );
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password');
          break;
        default:
          setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Change Password">
      <form onSubmit={(e) => void handleSubmit(e)}>
        <Stack gap="md">
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            required
            disabled={isChanging}
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.currentTarget.value)}
            required
            disabled={isChanging}
            error={error}
          />
          <Button type="submit" loading={isChanging} fullWidth>
            Change Password
          </Button>
          {success && (
            <Text c="green" size="sm">
              Password changed successfully!
            </Text>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
