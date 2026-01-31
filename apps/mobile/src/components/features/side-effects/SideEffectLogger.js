import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { theme } from '../../../ui/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import { AsyncStorageAdapter } from '../../../core/storage';
import { STORAGE_KEYS } from '../../../core/keys';

const storage = new AsyncStorageAdapter();

const COMMON_SIDE_EFFECTS = [
  'Nausea',
  'Headache',
  'Fatigue',
  'Dizziness',
  'Injection site redness',
  'Injection site pain',
  'Muscle soreness',
  'Sleep disturbance',
  'Mood changes',
  'Digestive issues',
];

export function SideEffectLogger({ onSave, initialProtocolId }) {
  const t = useTranslation();
  const [protocols, setProtocols] = useState([]);
  const [formData, setFormData] = useState({
    protocolId: initialProtocolId || '',
    date: new Date().toISOString().split('T')[0],
    symptom: '',
    severity: 5,
    duration: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = () => {
    const savedProtocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
    setProtocols(Array.isArray(savedProtocols) ? savedProtocols : []);
  };

  const handleSubmit = async () => {
    if (!formData.symptom.trim()) {
      alert(t.sideEffects.symptomRequired);
      return;
    }

    try {
      setSaving(true);
      const sideEffects = storage.load(STORAGE_KEYS.SIDE_EFFECTS, []);
      const newEffect = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      storage.save(STORAGE_KEYS.SIDE_EFFECTS, [...sideEffects, newEffect]);
      
      setFormData({
        protocolId: '',
        date: new Date().toISOString().split('T')[0],
        symptom: '',
        severity: 5,
        duration: '',
        notes: '',
      });
      onSave?.();
    } catch (err) {
      console.error('Failed to save side effect:', err);
      alert('Failed to save side effect');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ gap: 16 }}>
      <View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
          {t.sideEffects.protocol} (Optional)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={() => setFormData({ ...formData, protocolId: '' })}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: formData.protocolId === '' ? theme.primary : theme.border,
              backgroundColor: formData.protocolId === '' ? `${theme.primary}15` : theme.card,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: formData.protocolId === '' ? theme.primary : theme.text }}>
              {t.sideEffects.noProtocol}
            </Text>
          </Pressable>
          {Array.isArray(protocols) && protocols.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setFormData({ ...formData, protocolId: p.id })}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: formData.protocolId === p.id ? theme.primary : theme.border,
                backgroundColor: formData.protocolId === p.id ? `${theme.primary}15` : theme.card,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: formData.protocolId === p.id ? theme.primary : theme.text }}>
                {p.name || p.id}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
          {t.sideEffects.date}
        </Text>
        <TextInput
          value={formData.date}
          onChangeText={(date) => setFormData({ ...formData, date })}
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
          {t.sideEffects.symptom} *
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {COMMON_SIDE_EFFECTS.map((symptom) => (
            <Pressable
              key={symptom}
              onPress={() => setFormData({ ...formData, symptom })}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: formData.symptom === symptom ? theme.primary : theme.card,
                borderWidth: 1,
                borderColor: formData.symptom === symptom ? theme.primary : theme.border,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: formData.symptom === symptom ? '#000000' : theme.text }}>
                {symptom}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={formData.symptom}
          onChangeText={(symptom) => setFormData({ ...formData, symptom })}
          placeholder={t.sideEffects.symptomPlaceholder}
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
          {t.sideEffects.severity}: {formData.severity}/10
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => setFormData({ ...formData, severity: Math.max(1, formData.severity - 1) })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>-</Text>
          </Pressable>
          <View style={{ flex: 1, height: 8, backgroundColor: theme.card, borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                width: `${(formData.severity / 10) * 100}%`,
                height: '100%',
                backgroundColor: theme.primary,
              }}
            />
          </View>
          <Pressable
            onPress={() => setFormData({ ...formData, severity: Math.min(10, formData.severity + 1) })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>+</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: theme.muted }}>{t.sideEffects.mild}</Text>
          <Text style={{ fontSize: 10, color: theme.muted }}>{t.sideEffects.severe}</Text>
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted, marginBottom: 8 }}>
          {t.sideEffects.duration} (Optional)
        </Text>
        <TextInput
          value={formData.duration}
          onChangeText={(duration) => setFormData({ ...formData, duration })}
          placeholder="e.g., 2 hours, 1 day"
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
          {t.sideEffects.notes} (Optional)
        </Text>
        <TextInput
          value={formData.notes}
          onChangeText={(notes) => setFormData({ ...formData, notes })}
          placeholder={t.sideEffects.notesPlaceholder}
          placeholderTextColor={theme.muted}
          multiline
          numberOfLines={3}
          style={{
            backgroundColor: theme.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: theme.text,
            minHeight: 80,
            textAlignVertical: 'top',
            borderBottomWidth: 2,
            borderBottomColor: theme.card,
          }}
          onFocus={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.primary } })}
          onBlur={(e) => e.target?.setNativeProps?.({ style: { borderBottomColor: theme.card } })}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={saving || !formData.symptom.trim()}
        style={{
          paddingVertical: 14,
          backgroundColor: saving || !formData.symptom.trim() ? theme.muted : theme.primary,
          borderRadius: 12,
          alignItems: 'center',
          opacity: saving || !formData.symptom.trim() ? 0.6 : 1,
          marginTop: 8,
        }}
      >
        <Text style={{ color: '#000000', fontWeight: '800', fontSize: 14 }}>
          {saving ? t.common.loading : t.sideEffects.save}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
