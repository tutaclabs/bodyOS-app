import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../ui/theme';

const { width } = Dimensions.get('window');

export function ActivityWidget({ onGetStarted }) {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.ornament} />
        <View style={styles.content}>
          <View style={styles.details}>
            <Text style={styles.title}>My Activity Recaps</Text>
            <Text style={styles.subtitle}>Everything you need to know about your health.</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
            <View style={styles.buttonIcon}>
              <Text style={styles.buttonIconText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2 - 8,
    height: 268,
  },
  banner: {
    flex: 1,
    backgroundColor: '#FFE9CA',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  ornament: {
    position: 'absolute',
    top: 118,
    left: -27,
    width: 225,
    height: 225,
    borderRadius: 112.5,
    backgroundColor: '#FADD9B',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  details: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#636363',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    height: 54,
    backgroundColor: theme.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#131313',
  },
});
