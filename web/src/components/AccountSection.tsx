import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { User } from 'firebase/auth';

import { useAuth } from '../contexts/useAuth';

interface AccountSectionProps {
  user: User;
}

export function AccountSection({ user }: AccountSectionProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    void signOut().then(() => {
      void navigate({ to: '/' });
    });
  };

  return (
    <Paper withBorder p="md">
      <Title order={3} mb="md">
        Account
      </Title>
      <Stack gap="md" align="flex-start">
        <Text>User ID: {user.uid}</Text>
        <Button onClick={handleSignOut}>Logout</Button>
      </Stack>
    </Paper>
  );
}
