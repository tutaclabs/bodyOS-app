import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';

const storage = new AsyncStorageAdapter();

export function ProfileScreen({ onLogout }) {
  const t = useTranslation();
  const [userSettings, setUserSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const loadProfileData = async () => {
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    const user = await storage.load(STORAGE_KEYS.CURRENT_USER, null);
    setUserSettings(settings);
    setCurrentUser(user);
  };

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear your onboarding data. You\'ll need to complete onboarding again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
            delete settings.onboarding;
            delete settings.goals;
            delete settings.experienceLevel;
            delete settings.lifestyle;
            await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
            setUserSettings(settings);
            Alert.alert('Success', 'Onboarding data cleared. Restart app to see onboarding again.');
          },
        },
      ]
    );
  };

  const getExperienceLabel = (level) => {
    if (!level) return 'Not set';
    const labels = {
      beginner: t.onboarding.experience.beginner,
      intermediate: t.onboarding.experience.intermediate,
      advanced: t.onboarding.experience.advanced,
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goalKey) => {
    const labels = {
      energy: t.onboarding.goals.energy,
      sleep: t.onboarding.goals.sleep,
      skin: t.onboarding.goals.skin,
      bodyComposition: t.onboarding.goals.bodyComposition,
      longevity: t.onboarding.goals.longevity,
      focus: t.onboarding.goals.focus,
    };
    return labels[goalKey] || goalKey;
  };

  if (!userSettings) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Card>
          <Text style={{ textAlign: 'center', color: theme.muted, paddingVertical: 20 }}>
            Loading profile...
          </Text>
        </Card>
      </ScrollView>
    );
  }

  const onboarding = userSettings.onboarding || {};
  const goals = userSettings.goals || [];
  const experienceLevel = userSettings.experienceLevel || '';
  const lifestyle = userSettings.lifestyle || {};

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 20 }}>👤</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>Profile</Text>
        </View>

        {currentUser && (
          <View style={{ marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 4 }}>
              Email
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
              {currentUser.email}
            </Text>
            {onboarding.completedAt && (
              <Text style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
                Member since {new Date(onboarding.completedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {onboarding.completed ? (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
                Optimization Goals
              </Text>
              {goals.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {goals.map((goal, idx) => (
                    <View
                      key={idx}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: '#F261010D',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#F2610133',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                        {getGoalLabel(goal)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 13, color: theme.muted }}>No goals selected</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
                Experience Level
              </Text>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#F1F5F9',
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                  {getExperienceLabel(experienceLevel)}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
                Lifestyle Factors
              </Text>
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 4 }}>
                    {t.onboarding.lifestyle.sleepQuality}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.sleepQuality || 5) / 10) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, minWidth: 40 }}>
                      {lifestyle.sleepQuality || 5}/10
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 4 }}>
                    {t.onboarding.lifestyle.stress}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.stress || 5) / 10) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, minWidth: 40 }}>
                      {lifestyle.stress || 5}/10
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: 4 }}>
                    {t.onboarding.lifestyle.trainingFreq}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.trainingFreq || 3) / 7) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, minWidth: 40 }}>
                      {lifestyle.trainingFreq || 3} {t.onboarding.lifestyle.perWeek}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleClearOnboarding}
              style={{
                paddingVertical: 12,
                backgroundColor: '#FEE2E2',
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                Reset Onboarding Data
              </Text>
            </Pressable>
          </>
        ) : (
          <View
            style={{
              padding: 20,
              backgroundColor: '#FFFBEB',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#FDE68A',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 8 }}>
              Onboarding Not Completed
            </Text>
            <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
              Complete onboarding to personalize your experience and see your profile information here.
            </Text>
          </View>
        )}

        {onLogout && (
          <Pressable
            onPress={onLogout}
            style={{
              marginTop: 24,
              paddingVertical: 14,
              backgroundColor: theme.primary,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Logout</Text>
          </Pressable>
        )}
      </Card>

      <Card style={{ backgroundColor: '#0F172A', borderColor: '#0F172A' }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#E2E8F0', marginBottom: 8 }}>
          Data Privacy
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 16, color: '#94A3B8' }}>
          All your data is stored locally on this device. No information is sent to external servers
          except when using AI features (with your API key). You can clear all data by uninstalling
          the app.
        </Text>
      </Card>
    </ScrollView>
  );
}
