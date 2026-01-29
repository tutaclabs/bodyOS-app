import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { calculateUnits } from '../core/reconstitution';

export function CalcScreen() {
  const [vialMg, setVialMg] = useState('5');
  const [bacMl, setBacMl] = useState('2');
  const [desiredMcg, setDesiredMcg] = useState('250');

  const units = useMemo(() => {
    const vial = Number(vialMg) || 0;
    const bac = Number(bacMl) || 0;
    const dose = Number(desiredMcg) || 0;
    return calculateUnits({ vialMg: vial, bacMl: bac, desiredMcg: dose });
  }, [vialMg, bacMl, desiredMcg]);

  const showSafetyWarning = units > 50 || (Number(desiredMcg) || 0) > 2000;

  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 16 }}>
          Reconstitution Wizard
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 12 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                Total Vial Content (mg)
              </Text>
              <TextInput
                value={vialMg}
                onChangeText={setVialMg}
                keyboardType="numeric"
                placeholder="e.g. 5"
                placeholderTextColor="#94A3B8"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: theme.text,
                  fontSize: 14
                }}
              />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                BAC Water Added (ml)
              </Text>
              <TextInput
                value={bacMl}
                onChangeText={setBacMl}
                keyboardType="numeric"
                placeholder="e.g. 2"
                placeholderTextColor="#94A3B8"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: theme.text,
                  fontSize: 14
                }}
              />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                Desired Dose (mcg)
              </Text>
              <TextInput
                value={desiredMcg}
                onChangeText={setDesiredMcg}
                keyboardType="numeric"
                placeholder="e.g. 250"
                placeholderTextColor="#94A3B8"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: theme.text,
                  fontSize: 14
                }}
              />
            </View>
          </View>

          <View
            style={{
              width: 140,
              backgroundColor: '#F261010D',
              borderColor: '#F2610133',
              borderWidth: 2,
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
              Draw Amount
            </Text>
            <Text style={{ fontSize: 42, fontWeight: '900', color: theme.primary, marginBottom: 8, fontFamily: 'monospace' }}>
              {units.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'center' }}>
              Units on a 100-unit syringe
            </Text>
          </View>
        </View>

        {showSafetyWarning ? (
          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#FFFBEB',
              borderColor: '#FDE68A',
              borderWidth: 1
            }}
          >
            <Text style={{ fontSize: 12, color: '#92400E' }}>
              <Text style={{ fontWeight: '700' }}>Safety Note:</Text> Large volume draws or high
              doses detected. Double-check math and technique.
            </Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}

