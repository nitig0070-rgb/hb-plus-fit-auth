import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../services/profileService';
import { getInitials, formatDate } from '../utils/formatters';

interface UserProfileCardProps {
  profile: UserProfile | null;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  role?: 'admin' | 'user';
}

export function UserProfileCard({
  profile,
  email,
  name,
  avatarUrl,
  role = 'user',
}: UserProfileCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const displayEmail = profile?.email || email || 'user@hbplus.fit';
  const displayName = profile?.full_name || name || displayEmail.split('@')[0];
  const displayAvatar = profile?.avatar_url || avatarUrl;
  const displayRole = profile?.role || role;
  const initials = getInitials(displayName, displayEmail);
  const isAdmin = displayRole === 'admin';

  return (
    <View style={styles.card}>
      {/* Top Banner Accent */}
      <View style={[styles.cardBanner, isAdmin ? styles.bannerAdmin : styles.bannerUser]} />

      <View style={styles.innerContent}>
        <View style={styles.headerRow}>
          {/* Avatar with fallback */}
          <View style={styles.avatarWrapper}>
            {displayAvatar && !imageFailed ? (
              <Image
                source={{ uri: displayAvatar }}
                style={styles.avatarImage}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.avatarFallback, isAdmin ? styles.avatarAdmin : styles.avatarUser]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.statusOnlineBadge} />
          </View>

          {/* User Role Badge */}
          <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={14}
              color={isAdmin ? '#818CF8' : '#38BDF8'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.roleText, isAdmin ? styles.roleTextAdmin : styles.roleTextUser]}>
              {isAdmin ? 'ADMINISTRATOR' : 'STAFF MEMBER'}
            </Text>
          </View>
        </View>

        {/* User Identity */}
        <View style={styles.infoSection}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>

        {/* Verification Pill */}
        <View style={styles.verificationRow}>
          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.verifiedText}>Verified @hbplus.fit Corporate Account</Text>
          </View>
        </View>

        {/* Profile Attributes Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>DEPARTMENT</Text>
            <Text style={styles.metaValue}>{profile?.department || 'Operations & FitTech'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>AUTHENTICATION</Text>
            <Text style={styles.metaValue}>Google OAuth 2.0</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>ACCESS LEVEL</Text>
            <Text style={[styles.metaValue, { color: isAdmin ? '#A78BFA' : '#38BDF8' }]}>
              {isAdmin ? 'Full System Admin' : 'Standard Read / Write'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>LAST SIGN IN</Text>
            <Text style={styles.metaValue}>
              {formatDate(profile?.last_sign_in_at || new Date().toISOString())}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  cardBanner: {
    height: 8,
    width: '100%',
  },
  bannerAdmin: {
    backgroundColor: '#6366F1',
  },
  bannerUser: {
    backgroundColor: '#0284C7',
  },
  innerContent: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#475569',
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#475569',
  },
  avatarAdmin: {
    backgroundColor: '#4338CA',
  },
  avatarUser: {
    backgroundColor: '#0369A1',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statusOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleBadgeAdmin: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366F1',
  },
  roleBadgeUser: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0284C7',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  roleTextAdmin: {
    color: '#A5B4FC',
  },
  roleTextUser: {
    color: '#7DD3FC',
  },
  infoSection: {
    marginTop: 18,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  verificationRow: {
    marginTop: 14,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#34D399',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 16,
  },
  metaItem: {
    width: Platform.OS === 'web' ? '46%' : '47%',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 3,
  },
});
