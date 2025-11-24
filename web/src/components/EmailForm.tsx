import { Button, Stack, Text, TextInput } from '@mantine/core';
import { sendEmailVerification, updateEmail } from 'firebase/auth';
import { useState } from 'react';

import { useAuth } from '../contexts/useAuth';

export function EmailForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateEmail(user, email);
      await sendEmailVerification(user);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to set email');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Text c="green" fw={500}>
        Verification email sent! Please check your inbox.
      </Text>
    );
  }

  return (
    <form onSubmit={(e) => void handleSetEmail(e)}>
      <Stack gap="md">
        <TextInput
          label="Email Address"
          placeholder="your@email.com"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          error={error}
          disabled={isSubmitting}
        />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Add Email
        </Button>
      </Stack>
    </form>
  );
}
