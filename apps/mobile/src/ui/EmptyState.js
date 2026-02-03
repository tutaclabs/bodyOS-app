import React from 'react';
import { View, Text } from 'react-native';
import { theme } from './theme';

export function EmptyState({ title, subtitle }) {
  return (
    <View style={{ paddingVertical: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>{title}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 6, fontSize: 12, color: theme.muted, textAlign: 'center' }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
