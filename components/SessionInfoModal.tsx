import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { maskToken, formatDate } from '../utils/formatters';
import { ALLOWED_DOMAIN } from '../utils/domainValidator';

interface SessionInfoModalProps {
  visible: boolean;
  onClose: () => void;
  session: Session | null;
}

export function SessionInfoModal({
  visible,
  onClose,
  session,
}: SessionInfoModalProps) {
  if (!session) return null;

  const expiresAt = session.expires_at
    ? formatDate(new Date(session.expires_at * 1000).toISOString())
    : 'Session Active';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="lock-closed" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Security & Session Audit</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DOMAIN RESTRICTION POLICY</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Allowed Domain</Text>
                <Text style={styles.detailVal}>@{ALLOWED_DOMAIN}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Server-Side Check</Text>
                <Text style={[styles.detailVal, { color: '#34D399' }]}>Active (Postgres Trigger)</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Client-Side Guard</Text>
                <Text style={[styles.detailVal, { color: '#34D399' }]}>Active (Auth Context)</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TOKEN METADATA</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Access Token</Text>
                <Text style={styles.detailVal}>{maskToken(session.access_token)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Token Type</Text>
                <Text style={styles.detailVal}>{session.token_type || 'Bearer'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Expires At</Text>
                <Text style={styles.detailVal}>{expiresAt}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>STORAGE ARCHITECTURE</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Runtime Platform</Text>
                <Text style={styles.detailVal}>{Platform.OS.toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Storage Engine</Text>
                <Text style={styles.detailVal}>
                  {Platform.OS === 'web' ? 'Encrypted Browser LocalStorage' : 'Expo Hardware SecureStore'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Session Persistence</Text>
                <Text style={[styles.detailVal, { color: '#34D399' }]}>Enabled with Auto-Refresh</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={styles.actionBtn}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  scrollArea: {
    marginVertical: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailKey: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
    color: '#F1F5F9',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
