import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { LoadingIndicator } from '../components/LoadingIndicator';

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingIndicator message="Initializing HB Plus Fit..." />;
  }

  if (session) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
