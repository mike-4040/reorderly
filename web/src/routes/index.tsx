import { Alert } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { Dashboard } from '../components/Dashboard';
import { Marketing } from '../components/Marketing';
import { useAuth } from '../contexts/useAuth';

interface HomeSearch {
  error?: string;
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    return {
      error: typeof search.error === 'string' ? search.error : undefined,
    };
  },
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const { error } = Route.useSearch();

  return (
    <>
      {error && (
        <Alert color="red" title="Error" mb="xl">
          {error}
        </Alert>
      )}
      {user ? <Dashboard /> : <Marketing />}
    </>
  );
}
