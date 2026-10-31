import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/GoogleLoginButton';
import { SecurityBanner } from '../../components/SecurityBanner';
import { ALLOWED_DOMAIN } from '../../utils/domainValidator';
import { isSupabaseConfigured } from '../../services/supabase';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading, error, clearError, setError } = useAuth();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ error?: string }>();

  // If redirect brought an error param from callback
  useEffect(() => {
    if (params.error) {
      setError(params.error);
    }
  }, [params.error, setError]);

  const handleLogin = async () => {
    clearError();
    await signInWithGoogle();
  };

  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.desktopScrollContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.loginCard, isDesktop && styles.desktopCard]}>
          {/* Logo & Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="fitness" size={32} color="#38BDF8" />
            </View>
            <Text style={styles.appName}>HB PLUS FIT</Text>
            <Text style={styles.appTagline}>Enterprise Workforce Portal</Text>
          </View>

          {/* Domain Notice Banner */}
          <View style={styles.domainNotice}>
            <View style={styles.lockIconBox}>
              <Ionicons name="lock-closed" size={16} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.domainNoticeTitle}>Corporate Access Only</Text>
              <Text style={styles.domainNoticeText}>
                Requires an active{' '}
                <Text style={styles.domainHighlight}>@{ALLOWED_DOMAIN}</Text> Google Workspace
                account.
              </Text>
            </View>
          </View>

          {/* Missing Supabase Config Notice */}
          {!isSupabaseConfigured && (
            <View style={styles.configAlert}>
              <View style={styles.configAlertHeader}>
                <Ionicons name="warning" size={18} color="#FBBF24" />
                <Text style={styles.configAlertTitle}>Supabase Connection Required</Text>
              </View>
              <Text style={styles.configAlertText}>
                The project currently has placeholder credentials (<Text style={styles.codeText}>your-project-id.supabase.co</Text>).
                To sign in with Google, please replace them in your <Text style={styles.codeText}>.env</Text> file.
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {error && (
            <SecurityBanner
              type="error"
              message={error}
              onDismiss={clearError}
            />
          )}

          {/* Google Sign-in Action */}
          <View style={styles.actionContainer}>
            <GoogleLoginButton
              onPress={handleLogin}
              isLoading={isLoading}
            />

            <Text style={styles.helperText}>
              Select your official @{ALLOWED_DOMAIN} account when prompted by Google.
              Personal accounts (@gmail.com, @yahoo.com) will be blocked.
            </Text>
          </View>

          {/* Security Features Accordion / Highlights */}
          <View style={styles.securitySection}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityHeaderText}>Zero-Trust Security Controls</Text>
            </View>

            <View style={styles.securityFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
                <Text style={styles.featureText}>
                  Server-side PostgreSQL trigger blocks unauthorized signups
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
                <Text style={styles.featureText}>
                  Row Level Security (RLS) protects employee database tables
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
                <Text style={styles.featureText}>
                  Hardware-backed encrypted token storage on native devices
                </Text>
              </View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              HB Plus Fit Inc. © {new Date().getFullYear()} • Secure Authentication
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  desktopScrollContainer: {
    paddingVertical: 40,
  },
  loginCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  desktopCard: {
    maxWidth: 460,
    padding: 36,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  appTagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  domainNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  lockIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  domainNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  domainHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  configAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 14,
    marginBottom: 16,
  },
  configAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  configAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  configAlertText: {
    fontSize: 12,
    color: '#FDE68A',
    lineHeight: 18,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionContainer: {
    marginTop: 6,
    marginBottom: 24,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
  securitySection: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  securityHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.3,
  },
  securityFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 16,
  },
  cardFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
