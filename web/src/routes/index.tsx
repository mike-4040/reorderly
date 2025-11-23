import { createFileRoute } from '@tanstack/react-router';

import { Dashboard } from '../components/Dashboard';
import { Marketing } from '../components/Marketing';
import { useAuth } from '../contexts/useAuth';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <Marketing />;
}
