import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function HeartRateInfoWidget({ title = 'Heart Rate Range', value = '87 bpm' }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.valueIcon}>↓</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 3 - 8,
    height: 98,
    backgroundColor: '#FFE595',
    borderRadius: 24,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueIcon: {
    fontSize: 13,
    fontWeight: '400',
    color: '#131313',
    marginRight: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '400',
    color: '#131313',
  },
});
