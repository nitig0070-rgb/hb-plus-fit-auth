import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  UserProfile,
  getAllProfiles,
  updateUserRole,
  UserRole,
} from '../services/profileService';
import { formatDate } from '../utils/formatters';

interface AdminPanelProps {
  currentUserId: string;
}

export function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const { profiles: data, error } = await getAllProfiles();
    if (error) {
      setActionMessage(`Could not fetch team directory: ${error}`);
    } else {
      setProfiles(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getAllProfiles().then(({ profiles: data, error }) => {
      if (!active) return;
      if (error) {
        setActionMessage(`Could not fetch team directory: ${error}`);
      } else {
        setProfiles(data);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleRole = async (targetUser: UserProfile) => {
    if (targetUser.id === currentUserId) {
      setActionMessage('You cannot change your own administrator privileges.');
      return;
    }

    const newRole: UserRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(targetUser.id);
    setActionMessage(null);

    const { success, error } = await updateUserRole(targetUser.id, newRole);
    if (success) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUser.id ? { ...p, role: newRole } : p))
      );
      setActionMessage(`Updated ${targetUser.email} to ${newRole.toUpperCase()}.`);
    } else {
      setActionMessage(`Role update failed: ${error}`);
    }
    setUpdatingId(null);
  };

  const totalUsers = profiles.length;
  const adminCount = profiles.filter((p) => p.role === 'admin').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.adminIconBox}>
            <Ionicons name="shield-half" size={20} color="#818CF8" />
          </View>
          <View>
            <Text style={styles.title}>Admin Control Panel</Text>
            <Text style={styles.subtitle}>HB Plus Fit Employee Directory & Role Governance</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={loadData}
          style={styles.refreshButton}
          accessibilityRole="button"
          accessibilityLabel="Refresh directory"
        >
          <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Analytics Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>ORGANIZATION USERS</Text>
          <Text style={styles.statNumber}>{totalUsers || 1}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>ADMIN PRIVILEGES</Text>
          <Text style={[styles.statNumber, { color: '#818CF8' }]}>{adminCount || 1}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DOMAIN LOCK</Text>
          <Text style={[styles.statNumber, { color: '#10B981', fontSize: 16, marginTop: 4 }]}>
            ENFORCED
          </Text>
        </View>
      </View>

      {actionMessage && (
        <View style={styles.messageBox}>
          <Ionicons name="information-circle" size={16} color="#60A5FA" />
          <Text style={styles.messageText}>{actionMessage}</Text>
        </View>
      )}

      {/* Directory Table / List */}
      <View style={styles.directoryContainer}>
        <Text style={styles.sectionHeading}>Company Accounts (@hbplus.fit)</Text>

        {isLoading ? (
          <ActivityIndicator size="small" color="#818CF8" style={{ marginVertical: 20 }} />
        ) : profiles.length === 0 ? (
          <Text style={styles.emptyText}>No registered members found in Supabase profiles.</Text>
        ) : (
          profiles.map((item) => {
            const isSelf = item.id === currentUserId;
            const isItemAdmin = item.role === 'admin';
            const isUpdating = updatingId === item.id;

            return (
              <View key={item.id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.full_name || 'Team Member'}</Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                  <Text style={styles.memberDate}>
                    Joined: {formatDate(item.created_at)}
                  </Text>
                </View>

                <View style={styles.memberActions}>
                  <View
                    style={[
                      styles.roleTag,
                      isItemAdmin ? styles.roleTagAdmin : styles.roleTagUser,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleTagText,
                        isItemAdmin ? styles.roleTagTextAdmin : styles.roleTagTextUser,
                      ]}
                    >
                      {item.role.toUpperCase()}
                    </Text>
                  </View>

                  {!isSelf && (
                    <TouchableOpacity
                      onPress={() => handleToggleRole(item)}
                      disabled={isUpdating}
                      style={[
                        styles.toggleButton,
                        isItemAdmin ? styles.toggleButtonDemote : styles.toggleButtonPromote,
                      ]}
                      accessibilityRole="button"
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.toggleButtonText}>
                          {isItemAdmin ? 'Demote to User' : 'Make Admin'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    marginBottom: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 4,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  messageText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#93C5FD',
    fontWeight: '500',
    flex: 1,
  },
  directoryContainer: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 14,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexWrap: Platform.OS === 'web' ? 'nowrap' : 'wrap',
    gap: 10,
  },
  memberInfo: {
    flex: 1,
    minWidth: 160,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  memberEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  memberDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleTagAdmin: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366F1',
  },
  roleTagUser: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0284C7',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleTagTextAdmin: {
    color: '#A5B4FC',
  },
  roleTagTextUser: {
    color: '#7DD3FC',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  toggleButtonDemote: {
    backgroundColor: '#334155',
  },
  toggleButtonPromote: {
    backgroundColor: '#4338CA',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
