import React from 'react';
import { View } from 'react-native';
import { theme } from './theme';

export function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 16,
          overflow: 'hidden',
        },
        style
      ]}
    >
      <View style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
}

