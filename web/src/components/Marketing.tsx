import { Title, Text, Container, Button, Stack } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function Marketing() {
  return (
    <Container>
      <Title order={1}>Welcome to Reorderly</Title>
      <Text mt="md" size="lg">
        Streamline your supplier management and ordering process.
      </Text>
      <Stack mt="xl" gap="md" align="flex-start">
        <Button component={Link} to="/signup" size="lg">
          Get Started
        </Button>
        <Button component={Link} to="/login" variant="light" size="lg">
          Sign In
        </Button>
      </Stack>
    </Container>
  );
}
