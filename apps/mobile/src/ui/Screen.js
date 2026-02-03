import React from 'react';
import { ScrollView, View } from 'react-native';
import { theme } from './theme';

export function Screen({ children, contentStyle, scroll = true }) {
  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, padding: 16 }, contentStyle]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 120, gap: 16 }, contentStyle]}
    >
      {children}
    </ScrollView>
  );
}
