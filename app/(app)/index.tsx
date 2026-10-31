import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { UserProfileCard } from '../../components/UserProfileCard';
import { AdminPanel } from '../../components/AdminPanel';
import { SessionInfoModal } from '../../components/SessionInfoModal';

export default function DashboardScreen() {
  const { session, user, profile, role, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const [showSessionModal, setShowSessionModal] = useState(false);

  const isDesktop = width >= 840;
  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Member';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogoBox}>
            <Ionicons name="fitness" size={20} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.navTitle}>HB PLUS FIT</Text>
            <Text style={styles.navSubtitle}>Internal Enterprise Portal</Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() => setShowSessionModal(true)}
            style={styles.navIconButton}
            accessibilityRole="button"
            accessibilityLabel="View session audit"
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#38BDF8" />
            {isDesktop && <Text style={styles.navBtnText}>Session Audit</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signOut}
            style={styles.logoutButton}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={18} color="#F87171" />
            {isDesktop && <Text style={styles.logoutBtnText}>Sign Out</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.desktopScrollContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View>
              <Text style={styles.greetingText}>Welcome back, {firstName} 👋</Text>
              <Text style={styles.welcomeSubtext}>
                Authenticated through Google Workspace with domain access granted.
              </Text>
            </View>
          </View>

          {/* User Profile Card */}
          <UserProfileCard
            profile={profile}
            email={user?.email}
            name={user?.user_metadata?.full_name || user?.user_metadata?.name}
            avatarUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
            role={role}
          />

          {/* Role-Based Content */}
          {role === 'admin' ? (
            /* Admin view: directory & user management */
            <AdminPanel currentUserId={user?.id || ''} />
          ) : (
            /* Standard User view: Employee hub */
            <View style={styles.employeeHubCard}>
              <View style={styles.hubHeader}>
                <View style={styles.hubIconBox}>
                  <Ionicons name="briefcase-outline" size={20} color="#38BDF8" />
                </View>
                <View>
                  <Text style={styles.hubTitle}>Employee Portal & Services</Text>
                  <Text style={styles.hubSubtitle}>Authorized tools for HB Plus Fit personnel</Text>
                </View>
              </View>

              <View style={styles.hubGrid}>
                <View style={styles.hubItem}>
                  <Ionicons name="document-text-outline" size={24} color="#60A5FA" />
                  <Text style={styles.hubItemTitle}>Corporate Handbook</Text>
                  <Text style={styles.hubItemDesc}>HB Plus Fit guidelines & HR policies</Text>
                </View>

                <View style={styles.hubItem}>
                  <Ionicons name="calendar-outline" size={24} color="#34D399" />
                  <Text style={styles.hubItemTitle}>Company Schedule</Text>
                  <Text style={styles.hubItemDesc}>Team all-hands & fitness events</Text>
                </View>

                <View style={styles.hubItem}>
                  <Ionicons name="analytics-outline" size={24} color="#A78BFA" />
                  <Text style={styles.hubItemTitle}>FitTech Analytics</Text>
                  <Text style={styles.hubItemDesc}>Internal fitness application telemetry</Text>
                </View>

                <View style={styles.hubItem}>
                  <Ionicons name="help-buoy-outline" size={24} color="#FBBF24" />
                  <Text style={styles.hubItemTitle}>IT & Security Desk</Text>
                  <Text style={styles.hubItemDesc}>Support for @hbplus.fit accounts</Text>
                </View>
              </View>
            </View>
          )}

          {/* Security Compliance Card */}
          <View style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
              <Text style={styles.complianceTitle}>Security Compliance Status</Text>
            </View>

            <View style={styles.complianceList}>
              <View style={styles.complianceRow}>
                <Ionicons name="radio-button-on" size={14} color="#10B981" />
                <Text style={styles.complianceKey}>OAuth 2.0 PKCE Session</Text>
                <Text style={styles.complianceVal}>ACTIVE</Text>
              </View>
              <View style={styles.complianceRow}>
                <Ionicons name="radio-button-on" size={14} color="#10B981" />
                <Text style={styles.complianceKey}>Domain Whitelist (@hbplus.fit)</Text>
                <Text style={styles.complianceVal}>VALIDATED</Text>
              </View>
              <View style={styles.complianceRow}>
                <Ionicons name="radio-button-on" size={14} color="#10B981" />
                <Text style={styles.complianceKey}>Database Row Level Security</Text>
                <Text style={styles.complianceVal}>ENFORCED</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Session Audit Modal */}
      <SessionInfoModal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        session={session}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  navSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F87171',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  desktopScrollContainer: {
    paddingVertical: 32,
  },
  mainWrapper: {
    width: '100%',
  },
  desktopWrapper: {
    maxWidth: 780,
  },
  welcomeBanner: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  employeeHubCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    marginBottom: 20,
    width: '100%',
  },
  hubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  hubIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  hubSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hubItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginTop: 10,
  },
  hubItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  complianceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    width: '100%',
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  complianceList: {
    gap: 10,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  complianceKey: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
    marginLeft: 8,
  },
  complianceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.5,
  },
});
