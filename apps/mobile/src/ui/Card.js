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
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

