import { Title, Text, Container, Button, Stack, Alert } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { useAuth } from '../contexts/useAuth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <Container>
      {user && !user.email && (
        <Alert variant="light" color="yellow" title="Account setup incomplete" mb="xl">
          Please add your email address to complete your account setup.{' '}
          <Button component={Link} to="/settings" variant="subtle" size="compact-sm" color="yellow">
            Go to Settings
          </Button>
        </Alert>
      )}

      {user && user.email && !user.emailVerified && (
        <Alert variant="light" color="blue" title="Email verification pending" mb="xl">
          Please verify your email address. Check your inbox for the verification link.{' '}
          <Button component={Link} to="/settings" variant="subtle" size="compact-sm" color="blue">
            Resend verification
          </Button>
        </Alert>
      )}

      <Title order={1}>Dashboard</Title>
      <Text mt="md">Welcome back! Here's your dashboard.</Text>
      <Stack mt="xl" gap="md">
        <Button component={Link} to="/suppliers" size="lg">
          Manage Suppliers
        </Button>
        <Button component={Link} to="/settings" variant="light" size="lg">
          Settings
        </Button>
      </Stack>
    </Container>
  );
}
