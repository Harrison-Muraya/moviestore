import React from 'react';
import { Button, Card, Container, Text, Title, Stack, Center } from '@mantine/core';
import { useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
  const resend = useForm();

  const handleResend = () => {
    resend.post(route('verification.send'));
  };

  const logout = useForm();

  return (
    <Container size="sm" pt="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Title align="center" order={2}>Verify Your Email</Title>
          <Text align="center">
            Thanks for signing up! Please verify your email by clicking the link we sent you.
            If you didn’t receive the email, you can request another below.
          </Text>

          {status === 'verification-link-sent' && (
            <Text color="green" align="center">
              A new verification link has been sent to your email.
            </Text>
          )}

          <Center>
            <Button color="green" onClick={handleResend} loading={resend.processing}>
              Resend Verification Email
            </Button>
          </Center>

          <form method="POST" action={route('logout')}>
            <Center>
              <Button variant="subtle" color="gray" type="submit">
                Logout
              </Button>
            </Center>
          </form>
        </Stack>
      </Card>
    </Container>
  );
}