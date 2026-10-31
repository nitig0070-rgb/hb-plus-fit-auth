import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingIndicator({
  message = 'Authenticating...',
  fullscreen = true,
}: LoadingIndicatorProps) {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator size="large" color="#2563EB" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  if (fullscreen) {
    return <View style={styles.fullscreen}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
