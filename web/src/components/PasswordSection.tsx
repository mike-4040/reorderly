import { Button, Paper, Text, Title } from '@mantine/core';
import { User } from 'firebase/auth';
import { useState } from 'react';

import { ChangePasswordModal } from './ChangePasswordModal';

interface PasswordSectionProps {
  user: User;
}

export function PasswordSection({ user }: PasswordSectionProps) {
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  return (
    <>
      <Paper withBorder p="md">
        <Title order={3} mb="md">
          Password
        </Title>
        <Text c="dimmed" size="sm" mb="md">
          Password authentication is enabled. You can sign in with your email and password.
        </Text>
        <Button onClick={() => setChangePasswordModalOpen(true)}>
          Change Password
        </Button>
      </Paper>

      <ChangePasswordModal
        user={user}
        opened={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </>
  );
}
