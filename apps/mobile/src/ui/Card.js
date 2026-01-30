import React from 'react';
import { View } from 'react-native';
import { theme } from './theme';

export function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 20,
          padding: 16,
          overflow: 'hidden',
        },
        style
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 20,
        }}
      />
      <View style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
}

