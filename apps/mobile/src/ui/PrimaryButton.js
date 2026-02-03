import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { theme } from './theme';

export function PrimaryButton({ label, onPress, disabled = false, loading = false, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: disabled ? '#E2E8F0' : theme.primary,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 14,
          alignItems: 'center',
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#000000' }}>{label}</Text>
      )}
    </Pressable>
  );
}
