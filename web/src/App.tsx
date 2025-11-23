import { RouterProvider, createRouter } from '@tanstack/react-router';

import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/useAuth';
import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  context: {
    user: null, // Will be set by RouterProvider
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppRouter() {
  const { user } = useAuth();
  return <RouterProvider router={router} context={{ user }} />;
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
