import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function FeatureCard({ title, description, icon, onPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        </View>
        <Text style={styles.description}>{description}</Text>
        <Pressable style={styles.checkButton} onPress={onPress}>
          <Text style={styles.checkText}>Check</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2 - 8,
    height: (width - 48) / 2 - 8,
    backgroundColor: '#FFFDF0',
    borderRadius: 24,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131313',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBEBC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconText: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#636363',
    lineHeight: 20,
    marginBottom: 12,
  },
  checkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
  arrow: {
    fontSize: 14,
    fontWeight: '400',
    color: '#131313',
  },
});
