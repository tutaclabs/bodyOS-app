import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { theme } from '../ui/theme';

const storage = new AsyncStorageAdapter();

export function OnboardingScreen({ onComplete }) {
  const t = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [lifestyle, setLifestyle] = useState({
    sleepQuality: 5,
    stress: 5,
    trainingFreq: 3,
  });

  const goals = [
    { key: 'energy', label: t.onboarding.goals.energy },
    { key: 'sleep', label: t.onboarding.goals.sleep },
    { key: 'skin', label: t.onboarding.goals.skin },
    { key: 'bodyComposition', label: t.onboarding.goals.bodyComposition },
    { key: 'longevity', label: t.onboarding.goals.longevity },
    { key: 'focus', label: t.onboarding.goals.focus },
  ];

  const experienceLevels = [
    { key: 'beginner', label: t.onboarding.experience.beginner },
    { key: 'intermediate', label: t.onboarding.experience.intermediate },
    { key: 'advanced', label: t.onboarding.experience.advanced },
  ];

  const toggleGoal = (goalKey) => {
    setSelectedGoals((prev) =>
      prev.includes(goalKey)
        ? prev.filter((g) => g !== goalKey)
        : [...prev, goalKey]
    );
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.onboarding = {
      completed: true,
      completedAt: Date.now(),
    };
    settings.goals = selectedGoals;
    settings.experienceLevel = experienceLevel;
    settings.lifestyle = lifestyle;
    await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    onComplete();
  };

  const canProceed = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return experienceLevel !== '';
    return true;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
    >
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            width: 64,
            height: 64,
            backgroundColor: theme.primary,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900' }}>⚡</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text, marginBottom: 8 }}>
          {t.onboarding.title}
        </Text>
        <Text style={{ fontSize: 14, color: theme.muted }}>{t.onboarding.subtitle}</Text>
      </View>

      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: s <= step ? theme.primary : '#E2E8F0',
              }}
            />
          ))}
        </View>

        {step === 1 && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 16 }}>
              {t.onboarding.step1}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {goals.map((goal) => (
                <Pressable
                  key={goal.key}
                  onPress={() => toggleGoal(goal.key)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedGoals.includes(goal.key) ? theme.primary : '#E2E8F0',
                    backgroundColor: selectedGoals.includes(goal.key) ? `${theme.primary}15` : theme.card,
                    minWidth: '45%',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: theme.text,
                      }}
                    >
                      {goal.label}
                    </Text>
                    {selectedGoals.includes(goal.key) && (
                      <Text style={{ color: theme.primary, fontSize: 16 }}>✓</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 16 }}>
              {t.onboarding.step2}
            </Text>
            <View style={{ gap: 12 }}>
              {experienceLevels.map((level) => (
                <Pressable
                  key={level.key}
                  onPress={() => setExperienceLevel(level.key)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: experienceLevel === level.key ? theme.primary : '#E2E8F0',
                    backgroundColor: experienceLevel === level.key ? `${theme.primary}15` : theme.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
                      {level.label}
                    </Text>
                    {experienceLevel === level.key && (
                      <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 16 }}>
              {t.onboarding.step3}
            </Text>
            <View style={{ gap: 24 }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                    {t.onboarding.lifestyle.sleepQuality}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.muted }}>
                    {lifestyle.sleepQuality}/10
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, sleepQuality: Math.max(1, lifestyle.sleepQuality - 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${(lifestyle.sleepQuality / 10) * 100}%`,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, sleepQuality: Math.min(10, lifestyle.sleepQuality + 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{t.onboarding.lifestyle.low}</Text>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{t.onboarding.lifestyle.high}</Text>
                </View>
              </View>

              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                    {t.onboarding.lifestyle.stress}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.muted }}>{lifestyle.stress}/10</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, stress: Math.max(1, lifestyle.stress - 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${(lifestyle.stress / 10) * 100}%`,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, stress: Math.min(10, lifestyle.stress + 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{t.onboarding.lifestyle.low}</Text>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{t.onboarding.lifestyle.high}</Text>
                </View>
              </View>

              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                    {t.onboarding.lifestyle.trainingFreq}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.muted }}>
                    {lifestyle.trainingFreq} {t.onboarding.lifestyle.perWeek}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, trainingFreq: Math.max(0, lifestyle.trainingFreq - 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${(lifestyle.trainingFreq / 7) * 100}%`,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={() => setLifestyle({ ...lifestyle, trainingFreq: Math.min(7, lifestyle.trainingFreq + 1) })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: '#F1F5F9',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: theme.muted, fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 'auto' }}>
        {step > 1 && (
          <Pressable
            onPress={() => setStep(step - 1)}
            style={{
              flex: 1,
              paddingVertical: 14,
              backgroundColor: '#F1F5F9',
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
              {t.onboarding.back}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canProceed()}
          style={{
            flex: 1,
            paddingVertical: 14,
            backgroundColor: canProceed() ? theme.primary : '#E2E8F0',
            borderRadius: 12,
            alignItems: 'center',
            opacity: canProceed() ? 1 : 0.5,
          }}
        >
          <Text style={{ color: '#000000', fontWeight: '700', fontSize: 15 }}>
            {step === 3 ? t.onboarding.finish : t.onboarding.next}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
