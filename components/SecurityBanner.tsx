import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SecurityBannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  message: string;
  onDismiss?: () => void;
}

export function SecurityBanner({
  type = 'error',
  message,
  onDismiss,
}: SecurityBannerProps) {
  if (!message) return null;

  const getTheme = () => {
    switch (type) {
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#F87171',
          text: '#991B1B',
          icon: 'shield-sharp' as const,
          iconColor: '#DC2626',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FBBF24',
          text: '#92400E',
          icon: 'alert-circle' as const,
          iconColor: '#D97706',
        };
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#4ADE80',
          text: '#166534',
          icon: 'checkmark-circle' as const,
          iconColor: '#16A34A',
        };
      default:
        return {
          bg: '#EFF6FF',
          border: '#60A5FA',
          text: '#1E40AF',
          icon: 'information-circle' as const,
          iconColor: '#2563EB',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <View style={styles.contentRow}>
        <Ionicons name={theme.icon} size={20} color={theme.iconColor} style={styles.icon} />
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
        >
          <Ionicons name="close" size={18} color={theme.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    borderRadius: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
