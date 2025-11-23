/**
 * Login page with email/password authentication
 */

import { Alert, Button, Container, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, FormEvent, useEffect } from 'react';

import { useAuth } from '../contexts/useAuth';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      void navigate({ to: '/' });
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    void (async () => {
      try {
        await signIn(email, password);
        await navigate({ to: '/' });
      } catch (err) {
        if (err instanceof Error) {
          // Extract Firebase error message
          const cause = err.cause as { code?: string } | undefined;
          const errorCode = cause?.code ?? 'unknown';

          switch (errorCode) {
            case 'auth/invalid-credential':
              setError('Invalid email or password');
              break;
            case 'auth/user-not-found':
              setError('No account found with this email');
              break;
            case 'auth/wrong-password':
              setError('Invalid password');
              break;
            case 'auth/too-many-requests':
              setError('Too many failed attempts. Please try again later');
              break;
            default:
              setError('Failed to sign in. Please try again');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Container size="xs" mt="xl">
      <Title order={1} mb="lg">
        Sign In
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading}>
            Sign In
          </Button>

          <Button component={Link} to="/signup" variant="subtle">
            Don't have an account? Sign up
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
