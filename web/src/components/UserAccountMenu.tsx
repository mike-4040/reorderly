import { Button, Group, Menu } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '../contexts/useAuth';

export function UserAccountMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    void (async () => {
      try {
        await signOut();
        await navigate({ to: '/login' });
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    })();
  };

  return (
    <Group gap="sm">
      {user ? (
        <Menu>
          <Menu.Target>
            <Button variant="subtle">{user.email}</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={handleSignOut}>Sign Out</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <>
          <Button
            variant="subtle"
            onClick={() => {
              void navigate({ to: '/login' });
            }}
          >
            Sign In
          </Button>
          <Button
            onClick={() => {
              void navigate({ to: '/signup' });
            }}
          >
            Sign Up
          </Button>
        </>
      )}
    </Group>
  );
}
