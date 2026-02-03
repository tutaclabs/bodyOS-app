import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from './theme';

export function SectionHeader({ title, subtitle, actionLabel, onPress }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 4, fontSize: 12, color: theme.muted }}>{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onPress}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: `${theme.primary}15`,
            borderWidth: 1,
            borderColor: `${theme.primary}33`,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
