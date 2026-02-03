import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { Screen } from '../ui/Screen';
import { SectionHeader } from '../ui/SectionHeader';
import { Chip } from '../ui/Chip';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import Recommendations from '../components/Recommendations';

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
      <Screen>
        <Card>
          <Text style={{ textAlign: 'center', color: theme.muted, paddingVertical: 20 }}>
            Loading profile...
          </Text>
        </Card>
      </Screen>
    );
  }

  const onboarding = userSettings.onboarding || {};
  const goals = userSettings.goals || [];
  const experienceLevel = userSettings.experienceLevel || '';
  const lifestyle = userSettings.lifestyle || {};

  return (
    <Screen>
      <Card>
        <SectionHeader title="Profile" subtitle="Your onboarding and goals" />

        {currentUser && (
            <View style={{ marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F7F7F7' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Email
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#131313' }}>
              {currentUser.email}
            </Text>
            {onboarding.completedAt && (
              <Text style={{ fontSize: 12, color: '#B5B5B5', marginTop: 6, fontWeight: '400' }}>
                Member since {new Date(onboarding.completedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {onboarding.completed ? (
          <>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#131313', marginBottom: 16 }}>
                Optimization Goals
              </Text>
              {goals.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {goals.map((goal, idx) => (
                    <Chip key={idx} label={getGoalLabel(goal)} selected />
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 13, color: '#B5B5B5', fontWeight: '600' }}>No goals selected</Text>
              )}
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#131313', marginBottom: 16 }}>
                Experience Level
              </Text>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#F7F7F7',
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313' }}>
                  {getExperienceLabel(experienceLevel) || 'Not set'}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#131313', marginBottom: 16 }}>
                Lifestyle Factors
              </Text>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t.onboarding.lifestyle.sleepQuality}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1, height: 10, backgroundColor: '#F7F7F7', borderRadius: 8, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.sleepQuality || 5) / 10) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', minWidth: 50 }}>
                      {lifestyle.sleepQuality || 5}/10
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t.onboarding.lifestyle.stress}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1, height: 10, backgroundColor: '#F7F7F7', borderRadius: 8, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.stress || 5) / 10) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', minWidth: 50 }}>
                      {lifestyle.stress || 5}/10
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t.onboarding.lifestyle.trainingFreq}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1, height: 10, backgroundColor: '#F7F7F7', borderRadius: 8, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${((lifestyle.trainingFreq || 3) / 7) * 100}%`,
                          backgroundColor: theme.primary,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', minWidth: 50 }}>
                      {lifestyle.trainingFreq || 3} {t.onboarding.lifestyle.perWeek}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleClearOnboarding}
              style={{
                paddingVertical: 14,
                backgroundColor: '#FEE2E2',
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#DC2626' }}>
                Reset Onboarding Data
              </Text>
            </Pressable>
          </>
        ) : null}

        {onboarding.completed && (
          <Recommendations compact={true} onAddToProtocols={async (protocol) => {
            const protocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);
            const updated = [...protocols, protocol];
            await storage.save(STORAGE_KEYS.PROTOCOLS, updated);
          }} />
        )}

        {!onboarding.completed && (
          <View
            style={{
              padding: 20,
              backgroundColor: '#F7F7F7',
              borderRadius: 24,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', marginBottom: 8 }}>
              Onboarding Not Completed
            </Text>
            <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
              Complete onboarding to personalize your experience and see your profile information here.
            </Text>
          </View>
        )}

        {onLogout && (
          <PrimaryButton label="Logout" onPress={onLogout} style={{ marginTop: 16 }} />
        )}
      </Card>

      <Card style={{ backgroundColor: '#131313', borderRadius: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF', marginBottom: 12 }}>
          Data Privacy
        </Text>
        <Text style={{ fontSize: 13, lineHeight: 20, color: '#B5B5B5', fontWeight: '400' }}>
          Your account data is synced with the backend server. Some data like protocols and settings
          are also stored locally for offline access. AI features require your OpenAI API key.
        </Text>
      </Card>
    </Screen>
  );
}
