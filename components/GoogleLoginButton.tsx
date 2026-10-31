import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
} from 'react-native';

interface GoogleLoginButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Pixel-accurate, accessible Google "G" multi-colored icon
 */
function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <View style={styles.googleIconBox}>
        {/* Simple colored blocks creating the distinct 4-color Google G palette */}
        <View style={[styles.cornerPill, { backgroundColor: '#4285F4', top: 2, right: 2 }]} />
        <View style={[styles.cornerPill, { backgroundColor: '#34A853', bottom: 2, right: 2 }]} />
        <View style={[styles.cornerPill, { backgroundColor: '#FBBC05', bottom: 2, left: 2 }]} />
        <View style={[styles.cornerPill, { backgroundColor: '#EA4335', top: 2, left: 2 }]} />
        <View style={styles.innerWhiteCutout}>
          <Text style={styles.gText}>G</Text>
        </View>
      </View>
    </View>
  );
}

export function GoogleLoginButton({
  onPress,
  isLoading = false,
  disabled = false,
}: GoogleLoginButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        (disabled || isLoading) && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#1E293B" style={styles.spinner} />
      ) : (
        <GoogleIcon />
      )}
      <Text style={styles.buttonText}>
        {isLoading ? 'Connecting to Google...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        } as any)
      : {}),
  },
  buttonDisabled: {
    opacity: 0.6,
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as any) : {}),
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cornerPill: {
    position: 'absolute',
    width: 14,
    height: 14,
  },
  innerWhiteCutout: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  gText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4285F4',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  spinner: {
    marginRight: 10,
  },
});
