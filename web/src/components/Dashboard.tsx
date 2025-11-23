import { Title, Text, Container, Button, Stack } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function Dashboard() {
  return (
    <Container>
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
