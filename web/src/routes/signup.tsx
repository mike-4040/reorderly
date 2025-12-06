/**
 * Signup page with Square OAuth
 */

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/useAuth';
import { getFunctionsUrl } from '../utils/env';

export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      void navigate({ to: '/' });
    }
  }, [user, navigate]);

  const functionsUrl = getFunctionsUrl();
  const squareInstallUrl = `${functionsUrl}/squareAuthorize?flow=install`;

  return (
    <Container size="xs" mt="xl">
      <Title order={1} mb="lg">
        Get Started
      </Title>

      <Stack gap="md">
        <Text>
          Connect your Square account to start managing your suppliers and
          orders.
        </Text>

        <Button component="a" href={squareInstallUrl} size="lg">
          Connect Square Account
        </Button>

        <Button component={Link} to="/login" variant="subtle">
          Already have an account? Sign in
        </Button>
      </Stack>
    </Container>
  );
}
