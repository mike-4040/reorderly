import { Title, Text, Container } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../utils/route-guards';

export const Route = createFileRoute('/suppliers')({
  beforeLoad: requireAuth,
  component: Suppliers,
});

function Suppliers() {
  return (
    <Container>
      <Title order={1}>Suppliers</Title>
      <Text mt="md">Manage your suppliers</Text>
    </Container>
  );
}
