import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function CaloriesWidget({ calories = '1278', unit = 'Kkal', change = '3 kg (-3.8%)' }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Current Weight</Text>
          <View style={styles.icon}>
            <Text style={styles.iconText}>📊</Text>
          </View>
        </View>
        <View style={styles.qty}>
          <Text style={styles.value}>{calories}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <View style={styles.change}>
          <Text style={styles.changeIcon}>↓</Text>
          <Text style={styles.changeText}>{change}</Text>
        </View>
      </View>
      <View style={styles.chart}>
        <View style={styles.chartBorder} />
        <View style={styles.chartDot} />
        <View style={styles.chartOverlay} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2 - 8,
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 9,
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    color: '#131313',
    marginRight: 4,
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#B5B5B5',
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    fontSize: 13,
    fontWeight: '400',
    color: '#131313',
    marginRight: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  chart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 45,
  },
  chartBorder: {
    position: 'absolute',
    bottom: 0,
    left: 27.5,
    right: 27.5,
    height: 38,
    borderWidth: 1,
    borderColor: '#75D3E7',
    borderTopWidth: 0,
  },
  chartDot: {
    position: 'absolute',
    bottom: 25,
    right: 149.5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#75D3E7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 27.5,
    width: 88,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
