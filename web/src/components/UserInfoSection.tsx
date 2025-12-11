/**
 * User information section component
 * Displays user's role and merchant ID
 */

import { Paper, Stack, Text, Title } from '@mantine/core';

import { UserData } from '../hooks/useUserData';

interface Props {
  userData: UserData;
}

export function UserInfoSection({ userData }: Props) {
  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="sm">
        <Title order={3}>User Information</Title>

        <div>
          <Text size="sm" c="dimmed">
            User ID
          </Text>
          <Text>{userData.id}</Text>
        </div>

        <div>
          <Text size="sm" c="dimmed">
            Merchant ID
          </Text>
          <Text>{userData.merchantId}</Text>
        </div>

        <div>
          <Text size="sm" c="dimmed">
            Role
          </Text>
          <Text tt="capitalize">{userData.role}</Text>
        </div>
      </Stack>
    </Paper>
  );
}
