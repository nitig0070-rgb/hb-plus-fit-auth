import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { isAuthorizedDomain, DOMAIN_RESTRICTION_ERROR_MESSAGE } from '../../utils/domainValidator';

export default function ProtectedAppLayout() {
  const { session, isLoading, signOut } = useAuth();

  // 1. Loading state during auth check
  if (isLoading) {
    return <LoadingIndicator message="Verifying session and security clearance..." />;
  }

  // 2. Unauthenticated check: Block direct URL access
  if (!session || !session.user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 3. Domain validation check: If somehow a non-hbplus.fit session is present
  if (!isAuthorizedDomain(session.user.email)) {
    signOut();
    return (
      <Redirect
        href={{
          pathname: '/(auth)/login',
          params: { error: DOMAIN_RESTRICTION_ERROR_MESSAGE },
        }}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
