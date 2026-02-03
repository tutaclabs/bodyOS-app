import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from './theme';

export function Chip({ label, selected = false, onPress }) {
  const content = (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: selected ? `${theme.primary}15` : theme.card,
        borderWidth: 1,
        borderColor: selected ? `${theme.primary}55` : theme.border,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? theme.primary : theme.text }}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
