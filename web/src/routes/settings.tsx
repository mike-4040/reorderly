import { Title, Text, Container, Button, Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { getFunctionsUrl } from '../utils/env';

export const Route = createFileRoute('/settings')({
  component: Settings,
});

function Settings() {
  const functionsUrl = getFunctionsUrl();
  const squareLoginUrl = `${functionsUrl}/squareAuthorize?flow=login`;
  const squareInstallUrl = `${functionsUrl}/squareAuthorize?flow=install`;

  return (
    <Container>
      <Title order={1}>Settings</Title>
      <Text mt="md">Configure your settings</Text>
      <Stack mt="md" align="flex-start">
        <Button component="a" href={squareLoginUrl}>
          Login with Square
        </Button>
        <Button component="a" href={squareInstallUrl}>
          Connect your Square Account
        </Button>
      </Stack>
    </Container>
  );
}
