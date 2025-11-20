import { Title, Text, Container } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/useAuth';

interface WelcomeSearch {
  token?: string;
}

export const Route = createFileRoute('/welcome')({
  component: Welcome,
  validateSearch: (search: Record<string, unknown>): WelcomeSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    };
  },
});

function Welcome() {
  const { token } = Route.useSearch();
  const { signInWithCustomToken } = useAuth();
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

  return (
    <Container>
      <Title order={1}>Welcome to Reorderly</Title>
      <Text mt="md">Get started by connecting your first supplier.</Text>
    </Container>
  );
}
