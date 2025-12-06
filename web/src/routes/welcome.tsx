import { Title, Text, Container } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { EmailForm } from '../components/EmailForm';
import { useAuth } from '../contexts/useAuth';

interface WelcomeSearch {
  token?: string;
}

export const Route = createFileRoute('/welcome')({
  validateSearch: (search: Record<string, unknown>): WelcomeSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    };
  },
  component: Welcome,
});

function Welcome() {
  const { token } = Route.useSearch();
  const { signInWithCustomToken, user, isLoadingAuthState } = useAuth();
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

  // Wait for auth to fully load before deciding what to show
  if (isLoadingAuthState) {
    return null;
  }

  // Redirect unauthenticated users without a token to home
  if (!user && !token) {
    void navigate({ to: '/', replace: true });
    return null;
  }

  // Show email form if user doesn't have email
  if (user && !user.email) {
    return (
      <Container size="xs" mt="xl">
        <Title order={1}>Welcome to Reorderly</Title>
        <Text mt="md" mb="xl">
          To get started, please add your email address. We'll use it to send
          you important updates and enable account recovery.
        </Text>

        <EmailForm />
      </Container>
    );
  }

  // Show generic welcome for authenticated users with email
  if (user) {
    return (
      <Container>
        <Title order={1}>Welcome to Reorderly</Title>
        <Text mt="md">Get started by connecting your first supplier.</Text>
      </Container>
    );
  }

  // Waiting for token sign-in to complete
  return null;
}
