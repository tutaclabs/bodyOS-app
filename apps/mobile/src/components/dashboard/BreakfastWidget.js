import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function BreakfastWidget({ 
  mealName = 'Breakfast',
  calories = '350 calories',
  proteins = '62.5',
  fats = '23.6',
  carbs = '45.7',
  rdc = '14%',
  onAdd,
  onEdit,
  onSeeProgress
}) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={styles.titleSection}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.title}>{mealName}</Text>
              <Text style={styles.calories}>{calories}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={onAdd}>
              <Text style={styles.actionButtonText}>+</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.actionButtonText}>✎</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.macros}>
          <View style={styles.macro}>
            <Text style={styles.macroLabel}>Proteins</Text>
            <Text style={styles.macroValue}>{proteins}</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>{fats}</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{carbs}</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroLabel}>RDC</Text>
            <Text style={styles.macroValue}>{rdc}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.dateSelector}>
            <Text style={styles.dateText}>Today</Text>
            <View style={styles.dateIcon}>
              <Text style={styles.dateIconText}>▼</Text>
            </View>
          </View>
          <Pressable style={styles.progressButton} onPress={onSeeProgress}>
            <Text style={styles.progressButtonText}>See Progress</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 184,
    backgroundColor: '#D2EBBF',
    borderRadius: 24,
    padding: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 7,
  },
  iconText: {
    fontSize: 16,
  },
  titleCol: {
    marginTop: 7,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 4,
  },
  calories: {
    fontSize: 16,
    fontWeight: '400',
    color: '#131313',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 7,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
  },
  macro: {
    flex: 1,
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#636363',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#131313',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
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
  progressButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
});
