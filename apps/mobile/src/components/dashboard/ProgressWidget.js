import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';

export function ProgressWidget({ progress = 91, calories = 1350, date = '19 September', onDatePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          <Text style={styles.title}>Your Progress</Text>
        </View>
        <Text style={styles.percentage}>{progress}%</Text>
        <Pressable style={styles.dateSelector} onPress={onDatePress}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={styles.dateIcon}>
            <Text style={styles.dateIconText}>▼</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.chart}>
        <View style={styles.chartBorder}>
          <View style={styles.chartBg}>
            <View style={styles.chartInner}>
              <View style={styles.chartInfo}>
                <Text style={styles.chartValue}>{calories}</Text>
                <Text style={styles.chartLabel}>Calories</Text>
              </View>
            </View>
          </View>
          <View style={styles.chartDot}>
            <Text style={styles.chartDotIcon}>❤️</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 161.5,
    backgroundColor: '#BCE7F0',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    width: 200,
    height: 128,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
  },
  percentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#131313',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
    marginRight: 8,
  },
  dateIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateIconText: {
    fontSize: 12,
    color: '#131313',
  },
  chart: {
    width: 129,
    height: 129.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartBorder: {
    width: 129,
    height: 129,
    borderRadius: 65,
    backgroundColor: '#D6F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartBg: {
    width: 89,
    height: 89,
    borderRadius: 45,
    backgroundColor: '#D6F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64A7B5',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  chartInner: {
    width: 77,
    height: 77,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInfo: {
    alignItems: 'center',
  },
  chartValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#131313',
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  chartDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#FF4545',
    borderWidth: 2,
    borderColor: '#FF9E9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartDotIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
});
