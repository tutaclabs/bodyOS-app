import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function HeartRateChart({ 
  bpm = 88, 
  date = '20 August 2024',
  onDateChange,
  onPrevDate,
  onNextDate
}) {
  const [activeTab, setActiveTab] = useState('days');

  const tabs = [
    { key: 'days', label: 'Days' },
    { key: 'weeks', label: 'Weeks' },
    { key: 'months', label: 'Months' },
    { key: 'years', label: 'Years' },
  ];

  const yAxisLabels = [200, 160, 120, 80, 40];
  const xAxisLabels = ['00.00', '06.00', '12.00', '18.00', '00.00'];
  const chartHeight = 176;
  const chartWidth = width - 32 - 47 - 27.5;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabBorder} />}
          </Pressable>
        ))}
      </View>

      <View style={styles.canvas}>
        <View style={styles.infoBar}>
          <View style={styles.bpmInfo}>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <Text style={styles.bpmUnit}>bpm</Text>
          </View>
          <View style={styles.dateSelector}>
            <Pressable style={styles.dateArrow} onPress={onPrevDate}>
              <Text style={styles.dateArrowText}>◄</Text>
            </Pressable>
            <Text style={styles.dateText}>{date}</Text>
            <Pressable style={styles.dateArrow} onPress={onNextDate}>
              <Text style={styles.dateArrowText}>►</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            {yAxisLabels.map((label, idx) => {
              const yPosition = (idx / (yAxisLabels.length - 1)) * chartHeight;
              return (
                <View key={idx} style={[styles.gridRow, { top: yPosition }]}>
                  <Text style={styles.yAxisLabel}>{label}</Text>
                  <View style={styles.gridLine} />
                </View>
              );
            })}

            <View style={styles.chartLineContainer}>
              <View style={[styles.chartGradientLine, { left: chartWidth / 2 - 0.5 }]} />
              <View style={[styles.chartDot, { top: 0, left: chartWidth / 2 - 6 }]} />
            </View>
          </View>

          <View style={styles.xAxis}>
            {xAxisLabels.map((label, idx) => (
              <Text key={idx} style={styles.xAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 359,
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingTop: 24,
    paddingHorizontal: 63,
    gap: 32,
  },
  tab: {
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  tabTextActive: {
    color: '#FF4545',
    fontWeight: '700',
  },
  tabBorder: {
    position: 'absolute',
    bottom: -21,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FF4545',
  },
  canvas: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  bpmInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpmValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#131313',
    marginRight: 4,
  },
  bpmUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#131313',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  chartContainer: {
    marginTop: 32,
  },
  chartArea: {
    height: 176,
    position: 'relative',
    paddingLeft: 16,
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#B5B5B5',
    width: 30,
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFEFEF',
    marginLeft: 2,
  },
  chartLineContainer: {
    position: 'absolute',
    left: 47,
    top: 101,
    bottom: 16,
  },
  chartGradientLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 1,
    height: 194.5,
    backgroundColor: '#FF4545',
    opacity: 0.8,
  },
  chartDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4545',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#B5B5B5',
  },
});
