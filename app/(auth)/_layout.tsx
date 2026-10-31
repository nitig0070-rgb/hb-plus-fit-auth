import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LoadingIndicator } from '../../components/LoadingIndicator';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  // If already authenticated and verified, redirect straight to dashboard
  if (isLoading) {
    return <LoadingIndicator message="Verifying session..." />;
  }

  if (session) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
