import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { theme } from '../../../ui/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import { AsyncStorageAdapter } from '../../../core/storage';
import { STORAGE_KEYS } from '../../../core/keys';

const storage = new AsyncStorageAdapter();

export function SideEffectList() {
  const t = useTranslation();
  const [sideEffects, setSideEffects] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    protocolId: '',
    minSeverity: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSideEffects();
    loadProtocols();
  }, [filters]);

  const loadProtocols = () => {
    const savedProtocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
    setProtocols(savedProtocols);
  };

  const loadSideEffects = () => {
    const allEffects = storage.load(STORAGE_KEYS.SIDE_EFFECTS, []);
    
    let filtered = Array.isArray(allEffects) ? allEffects : [];
    
    if (filters.startDate) {
      filtered = filtered.filter(se => se.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(se => se.date <= filters.endDate);
    }
    if (filters.protocolId) {
      filtered = filtered.filter(se => se.protocolId === filters.protocolId);
    }
    if (filters.minSeverity) {
      filtered = filtered.filter(se => se.severity >= parseInt(filters.minSeverity, 10));
    }
    
    if (Array.isArray(filtered)) {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    setSideEffects(filtered);
  };

  const handleDelete = (id) => {
    const allEffects = storage.load(STORAGE_KEYS.SIDE_EFFECTS, []);
    const updated = allEffects.filter(se => se.id !== id);
    storage.save(STORAGE_KEYS.SIDE_EFFECTS, updated);
    loadSideEffects();
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return { bg: '#DC2626', text: '#FFFFFF' };
    if (severity >= 5) return { bg: '#F59E0B', text: '#FFFFFF' };
    return { bg: '#EAB308', text: '#000000' };
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
          {t.sideEffects.listTitle}
        </Text>
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
            {t.sideEffects.filters}
          </Text>
        </Pressable>
      </View>

      {showFilters && (
        <View style={{ padding: 16, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
                {t.sideEffects.startDate}
              </Text>
              <TextInput
                value={filters.startDate}
                onChangeText={(startDate) => setFilters({ ...filters, startDate })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.muted}
                style={{
                  backgroundColor: theme.bg,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  color: theme.text,
                  fontSize: 12,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
                {t.sideEffects.endDate}
              </Text>
              <TextInput
                value={filters.endDate}
                onChangeText={(endDate) => setFilters({ ...filters, endDate })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.muted}
                style={{
                  backgroundColor: theme.bg,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  color: theme.text,
                  fontSize: 12,
                }}
              />
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
              {t.sideEffects.minSeverity}
            </Text>
            <TextInput
              keyboardType="numeric"
              value={filters.minSeverity}
              onChangeText={(minSeverity) => setFilters({ ...filters, minSeverity })}
              placeholder="1-10"
              placeholderTextColor={theme.muted}
              style={{
                backgroundColor: theme.bg,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                color: theme.text,
                fontSize: 12,
              }}
            />
          </View>
        </View>
      )}

      {sideEffects.length === 0 ? (
        <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' }}>
          {t.sideEffects.noSideEffects}
        </Text>
      ) : (
        <ScrollView style={{ gap: 12 }}>
          {sideEffects.map((se) => {
            const severityColors = getSeverityColor(se.severity);
            const protocol = protocols.find(p => p.id === se.protocolId);
            return (
              <View
                key={se.id}
                style={{
                  padding: 14,
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text, flex: 1 }}>
                    {se.symptom}
                  </Text>
                  <Pressable
                    onPress={() => handleDelete(se.id)}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16, color: '#DC2626', fontWeight: '700' }}>×</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 11, color: theme.muted }}>
                    {new Date(se.date).toLocaleDateString()}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: severityColors.bg,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: severityColors.text }}>
                      {t.sideEffects.severity}: {se.severity}/10
                    </Text>
                  </View>
                  {se.duration && (
                    <Text style={{ fontSize: 11, color: theme.muted }}>
                      {t.sideEffects.duration}: {se.duration}
                    </Text>
                  )}
                </View>
                {protocol && (
                  <Text style={{ fontSize: 11, color: theme.muted, marginBottom: 4 }}>
                    {t.sideEffects.protocol}: {protocol.name || protocol.id}
                  </Text>
                )}
                {se.notes && (
                  <Text style={{ fontSize: 12, color: theme.text, marginTop: 4 }}>
                    {se.notes}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
