import { Button, Group, Paper, Text, Title } from '@mantine/core';
import { sendEmailVerification, User } from 'firebase/auth';
import { useState } from 'react';

import { digProperty } from '../utils/object';

import { EmailForm } from './EmailForm';

interface EmailSectionProps {
  user: User;
}

export function EmailSection({ user }: EmailSectionProps) {
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendVerification = async () => {
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
          setResendError(
            'Failed to send verification email. Please try again.',
          );
      }
    }
  };

  return (
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
  );
}
