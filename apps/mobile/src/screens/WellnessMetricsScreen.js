import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';

const storage = new AsyncStorageAdapter();

export function WellnessMetricsScreen() {
  const t = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [metrics, setMetrics] = useState({
    energy: 5,
    metabolism: '',
    bowel: 1,
    pain: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const allMetrics = await storage.load(STORAGE_KEYS.WELLNESS_METRICS, {});
      if (allMetrics[today]) {
        setMetrics(allMetrics[today]);
      }
    })();
  }, [today]);

  const handleSave = async () => {
    const allMetrics = await storage.load(STORAGE_KEYS.WELLNESS_METRICS, {});
    allMetrics[today] = metrics;
    await storage.save(STORAGE_KEYS.WELLNESS_METRICS, allMetrics);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20 }}>📊</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.wellness.title}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.muted }}>{t.wellness.today}</Text>
        </View>

        <View style={{ gap: 24 }}>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                {t.wellness.energy}
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted }}>{metrics.energy}/10</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={() => setMetrics({ ...metrics, energy: Math.max(1, metrics.energy - 1) })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
              </Pressable>
              <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${(metrics.energy / 10) * 100}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
              <Pressable
                onPress={() => setMetrics({ ...metrics, energy: Math.min(10, metrics.energy + 1) })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: theme.muted }}>Low</Text>
              <Text style={{ fontSize: 11, color: theme.muted }}>High</Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
              {t.wellness.metabolism}
            </Text>
            <TextInput
              value={metrics.metabolism}
              onChangeText={(text) => setMetrics({ ...metrics, metabolism: text })}
              placeholder="Notes about metabolism, digestion, etc."
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 13,
                color: theme.text,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
              {t.wellness.bowel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() =>
                  setMetrics({
                    ...metrics,
                    bowel: Math.max(0, metrics.bowel - 1),
                  })
                }
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
              </Pressable>
              <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text, minWidth: 48, textAlign: 'center' }}>
                {metrics.bowel}
              </Text>
              <Pressable
                onPress={() =>
                  setMetrics({
                    ...metrics,
                    bowel: metrics.bowel + 1,
                  })
                }
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
              </Pressable>
              <Text style={{ fontSize: 13, color: theme.muted }}>times today</Text>
            </View>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                {t.wellness.pain}
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted }}>{metrics.pain}/10</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={() => setMetrics({ ...metrics, pain: Math.max(0, metrics.pain - 1) })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
              </Pressable>
              <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${(metrics.pain / 10) * 100}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
              <Pressable
                onPress={() => setMetrics({ ...metrics, pain: Math.min(10, metrics.pain + 1) })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: '#F1F5F9',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: theme.muted }}>None</Text>
              <Text style={{ fontSize: 11, color: theme.muted }}>Severe</Text>
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            style={{
              paddingVertical: 14,
              backgroundColor: saved ? '#10B981' : theme.primary,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {saved ? 'Saved!' : t.wellness.save}
            </Text>
          </Pressable>
        </View>
      </Card>
  );
}
