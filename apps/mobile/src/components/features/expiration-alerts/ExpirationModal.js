import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { theme } from '../../../ui/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import { AsyncStorageAdapter } from '../../../core/storage';
import { STORAGE_KEYS } from '../../../core/keys';

const storage = new AsyncStorageAdapter();

export function ExpirationModal({ protocol, onClose, onSave }) {
  const t = useTranslation();
  const [reconstitutionDate, setReconstitutionDate] = useState(
    protocol.reconstitutionDate || ''
  );
  const [expirationDate, setExpirationDate] = useState(protocol.expirationDate || '');
  const [expirationDays, setExpirationDays] = useState(protocol.expirationDays || 30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const protocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
      const updated = protocols.map(p => 
        p.id === protocol.id 
          ? { ...p, reconstitutionDate, expirationDate, expirationDays }
          : p
      );
      storage.save(STORAGE_KEYS.PROTOCOLS, updated);
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Failed to save expiration:', err);
      alert('Failed to save expiration dates');
    } finally {
      setSaving(false);
    }
  };

  const handleReconstitutionChange = (date) => {
    setReconstitutionDate(date);
    if (date && !expirationDate) {
      const reconDate = new Date(date);
      reconDate.setDate(reconDate.getDate() + expirationDays);
      setExpirationDate(reconDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.expirationAlerts.setExpiration}
            </Text>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 20, color: theme.muted, fontWeight: '700' }}>×</Text>
            </Pressable>
          </View>

          <ScrollView>
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
                  {t.expirationAlerts.reconstitutionDate}
                </Text>
                <TextInput
                  type="date"
                  value={reconstitutionDate}
                  onChangeText={handleReconstitutionChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.muted}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: theme.text,
                    borderBottomWidth: 2,
                    borderBottomColor: theme.card,
                  }}
                  onFocus={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.primary } })}
                  onBlur={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.card } })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
                  {t.expirationAlerts.expirationDays}
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={expirationDays.toString()}
                  onChangeText={(text) => {
                    const days = parseInt(text, 10) || 30;
                    setExpirationDays(days);
                    if (reconstitutionDate) {
                      const reconDate = new Date(reconstitutionDate);
                      reconDate.setDate(reconDate.getDate() + days);
                      setExpirationDate(reconDate.toISOString().split('T')[0]);
                    }
                  }}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: theme.text,
                    borderBottomWidth: 2,
                    borderBottomColor: theme.card,
                  }}
                  onFocus={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.primary } })}
                  onBlur={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.card } })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
                  {t.expirationAlerts.expirationDate}
                </Text>
                <TextInput
                  value={expirationDate}
                  onChangeText={setExpirationDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.muted}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: theme.text,
                    borderBottomWidth: 2,
                    borderBottomColor: theme.card,
                  }}
                  onFocus={(e) => {
                    if (e.target?.setNativeProps) {
                      e.target.setNativeProps({ style: { borderBottomColor: theme.primary } });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target?.setNativeProps) {
                      e.target.setNativeProps({ style: { borderBottomColor: theme.card } });
                    }
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    backgroundColor: saving ? theme.muted : theme.primary,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: '#000000', fontWeight: '800', fontSize: 14 }}>
                    {saving ? t.common.loading : t.common.save}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onClose}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>
                    {t.common.cancel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
