import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../../../ui/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import { AsyncStorageAdapter } from '../../../core/storage';
import { STORAGE_KEYS } from '../../../core/keys';

const storage = new AsyncStorageAdapter();

const SITE_LOCATIONS = [
  { value: 'left_deltoid', label: 'Left Deltoid' },
  { value: 'right_deltoid', label: 'Right Deltoid' },
  { value: 'abdomen_upper_left', label: 'Abdomen Upper Left' },
  { value: 'abdomen_upper_right', label: 'Abdomen Upper Right' },
  { value: 'abdomen_lower_left', label: 'Abdomen Lower Left' },
  { value: 'abdomen_lower_right', label: 'Abdomen Lower Right' },
  { value: 'left_thigh', label: 'Left Thigh' },
  { value: 'right_thigh', label: 'Right Thigh' },
  { value: 'left_glute', label: 'Left Glute' },
  { value: 'right_glute', label: 'Right Glute' },
];

export function InjectionSiteSelector({ onSelect, selectedSite }) {
  const t = useTranslation();
  const [suggested, setSuggested] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestion();
  }, []);

  const loadSuggestion = async () => {
    try {
      setLoading(true);
      const logs = storage.load(STORAGE_KEYS.PEPTIDE_LOGS, []);
      
      if (logs.length === 0) {
        setSuggested({ recommended: 'left_deltoid', needsRotation: false });
        if (!selectedSite) {
          onSelect?.('left_deltoid');
        }
        return;
      }

      const recentLogs = logs
        .filter(log => log.injectionSite)
        .slice(-3)
        .map(log => log.injectionSite);

      const needsRotation = recentLogs.length >= 3 && new Set(recentLogs).size === 1;
      
      const siteUsage = {};
      logs.forEach(log => {
        if (log.injectionSite) {
          siteUsage[log.injectionSite] = (siteUsage[log.injectionSite] || 0) + 1;
        }
      });

      const lastUsed = recentLogs[recentLogs.length - 1];
      const recommended = needsRotation 
        ? SITE_LOCATIONS.find(site => site.value !== lastUsed)?.value || 'left_deltoid'
        : lastUsed || 'left_deltoid';

      setSuggested({ recommended, needsRotation });
      
      if (recommended && !selectedSite) {
        onSelect?.(recommended);
      }
    } catch (err) {
      console.error('Failed to load suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (site) => {
    onSelect?.(site);
  };

  return (
    <View style={{ gap: 12 }}>
      {suggested?.needsRotation && (
        <View style={{ padding: 12, backgroundColor: '#F59E0B20', borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B' }}>
          <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '700' }}>
            {t.injectionTracker.rotationWarning}
          </Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SITE_LOCATIONS.map((site) => {
          const isSelected = selectedSite === site.value;
          const isRecommended = suggested?.recommended === site.value && !isSelected;
          return (
            <Pressable
              key={site.value}
              onPress={() => handleSelect(site.value)}
              style={{
                flex: 1,
                minWidth: '48%',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isSelected ? theme.primary : isRecommended ? '#F59E0B' : theme.border,
                backgroundColor: isSelected ? theme.primary : isRecommended ? '#F59E0B20' : theme.card,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '700', 
                color: isSelected ? '#000000' : isRecommended ? '#F59E0B' : theme.text 
              }}>
                {site.label}
              </Text>
              {isRecommended && (
                <Text style={{ fontSize: 10, color: '#F59E0B', marginTop: 2 }}>
                  Recommended
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
