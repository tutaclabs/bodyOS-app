import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../ui/theme';

export function LandingScreen({ onEnterApp }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📱 The Lab in Your Pocket</Text>
        </View>
        <Text style={styles.title}>
          Biohacking, <Text style={styles.titleAccent}>Simplified.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Manage peptides, track nutrient floors, and optimize your biology with clinical precision.
        </Text>
        
        <TouchableOpacity style={styles.primaryButton} onPress={onEnterApp}>
          <Text style={styles.primaryButtonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>Engineered for Complexity</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureLabel}>Recon Wizard</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureLabel}>HRV Sync</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureLabel}>Local Vault</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureLabel}>Scan Fuel</Text>
          </View>
        </View>
      </View>

      <View style={styles.privacySection}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyTitle}>Privacy First. Always.</Text>
        <Text style={styles.privacyText}>
          Your biological data never leaves your device. We use zero-knowledge architecture to protect your sovereignty.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  titleAccent: {
    color: theme.primary,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  features: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -6,
  },
  featureCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    margin: 6,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
  },
  privacySection: {
    backgroundColor: '#0F172A',
    margin: 24,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  privacyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
