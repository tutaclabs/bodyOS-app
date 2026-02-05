import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { theme } from '../ui/theme';
import { Screen } from '../ui/Screen';
import { Chip } from '../ui/Chip';
import { PrimaryButton } from '../ui/PrimaryButton';
import { parseProtocolFromText } from '../core/ai-protocol-parser';
import { isBackendConfigured } from '../core/auth-api';
import { libraryItems } from '../data/library-items';
import { MedicalDisclaimerModal } from '../components/MedicalDisclaimer';

const storage = new AsyncStorageAdapter();

export function OnboardingScreen({ onComplete }) {
  const t = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [cabinetQuery, setCabinetQuery] = useState('');
  const [selectedCabinet, setSelectedCabinet] = useState([]);
  const [protocolInput, setProtocolInput] = useState('');
  const [protocols, setProtocols] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [proteinTarget, setProteinTarget] = useState('160');
  const [waterTarget, setWaterTarget] = useState('3');
  const [fiberTarget, setFiberTarget] = useState('35');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const goals = [
    { key: 'energy', label: t.onboarding.goals.energy },
    { key: 'recovery', label: t.onboarding.goals.recovery },
    { key: 'longevity', label: t.onboarding.goals.longevity },
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

  const toggleCabinetItem = (item) => {
    setSelectedCabinet((prev) => {
      const exists = prev.some((entry) => entry.id === item.id);
      if (exists) return prev.filter((entry) => entry.id !== item.id);
      return [...prev, { id: item.id, name: item.name, category: item.category }];
    });
  };

  const filteredCabinetItems = useMemo(() => {
    const query = cabinetQuery.trim().toLowerCase();
    if (!query) return libraryItems;
    return libraryItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [cabinetQuery]);

  const handleNext = async () => {
    if (step < 5) {
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
    settings.cabinet = selectedCabinet;
    settings.bioFloorTargets = {
      protein: Number(proteinTarget) || 0,
      hydration: Number(waterTarget) || 0,
      fiber: Number(fiberTarget) || 0,
    };
    settings.disclaimerAccepted = true;
    await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    const existingProtocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);
    const mergedProtocols = [
      ...(Array.isArray(existingProtocols) ? existingProtocols : []),
      ...protocols,
    ];
    if (protocols.length > 0) {
      await storage.save(STORAGE_KEYS.PROTOCOLS, mergedProtocols);
    }
    const floors = {
      protein: { current: 0, target: Number(proteinTarget) || 0, unit: 'g' },
      fiber: { current: 0, target: Number(fiberTarget) || 0, unit: 'g' },
      hydration: { current: 0, target: Number(waterTarget) || 0, unit: 'L' },
    };
    await storage.save(STORAGE_KEYS.NUTRITION_FLOORS, floors);
    onComplete();
  };

  const handleParseProtocol = async () => {
    if (!protocolInput.trim()) {
      setParseError(t.onboarding.protocolBuilder.empty);
      return;
    }
    if (!isBackendConfigured()) {
      setParseError(t.onboarding.protocolBuilder.backendMissing);
      return;
    }
    setParsing(true);
    setParseError('');
    try {
      const parsed = await parseProtocolFromText(protocolInput);
      const entry = {
        id: Date.now(),
        name: parsed.name,
        cycleOn: parsed.cycleOn,
        cycleOff: parsed.cycleOff,
        timeOfDay: parsed.timeOfDay || 'flexible',
        sourceText: protocolInput.trim(),
      };
      setProtocols((prev) => [...prev, entry]);
      setProtocolInput('');
    } catch (error) {
      setParseError(error.message || t.onboarding.protocolBuilder.error);
    } finally {
      setParsing(false);
    }
  };

  const removeProtocol = (id) => {
    setProtocols((prev) => prev.filter((item) => item.id !== id));
  };

  const canProceed = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return experienceLevel !== '';
    if (step === 5) return disclaimerAccepted;
    return true;
  };

  return (
    <Screen contentStyle={{ paddingTop: 30 }}>
      <MedicalDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccept={() => {
          setDisclaimerAccepted(true);
          setShowDisclaimer(false);
        }}
      />
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

      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((s) => (
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
                <Chip
                  key={goal.key}
                  label={goal.label}
                  selected={selectedGoals.includes(goal.key)}
                  onPress={() => toggleGoal(goal.key)}
                />
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
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.onboarding.step3}
            </Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>
              {t.onboarding.cabinet.subtitle}
            </Text>
            <TextInput
              value={cabinetQuery}
              onChangeText={setCabinetQuery}
              placeholder={t.onboarding.cabinet.searchPlaceholder}
              placeholderTextColor={theme.muted}
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ gap: 10 }}>
              {filteredCabinetItems.map((item) => {
                const isSelected = selectedCabinet.some((entry) => entry.id === item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleCabinetItem(item)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? `${theme.primary}15` : theme.card,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.muted }}>
                          {item.category}
                        </Text>
                      </View>
                      {isSelected && <Text style={{ color: theme.primary, fontSize: 16 }}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
              {filteredCabinetItems.length === 0 && (
                <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ fontSize: 12, color: theme.muted }}>{t.onboarding.cabinet.empty}</Text>
                </View>
              )}
            </ScrollView>
            {selectedCabinet.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {selectedCabinet.map((item) => (
                  <Chip key={item.id} label={item.name} selected onPress={() => toggleCabinetItem(item)} />
                ))}
              </View>
            )}
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.onboarding.step4}
            </Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>
              {t.onboarding.protocolBuilder.subtitle}
            </Text>
            <TextInput
              value={protocolInput}
              onChangeText={(text) => {
                setProtocolInput(text);
                setParseError('');
              }}
              placeholder={t.onboarding.protocolBuilder.placeholder}
              placeholderTextColor={theme.muted}
              multiline
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
                minHeight: 90,
                textAlignVertical: 'top',
                borderWidth: 1,
                borderColor: theme.border,
              }}
              editable={!parsing}
            />
            {parseError ? (
              <Text style={{ fontSize: 11, color: '#DC2626' }}>{parseError}</Text>
            ) : null}
            <PrimaryButton
              label={parsing ? t.onboarding.protocolBuilder.parsing : t.onboarding.protocolBuilder.parse}
              onPress={handleParseProtocol}
              disabled={parsing || !protocolInput.trim()}
            />
            <Text style={{ fontSize: 10, color: theme.muted, textAlign: 'center' }}>
              {t.disclaimer.footer}
            </Text>
            {protocols.length > 0 && (
              <View style={{ gap: 10 }}>
                {protocols.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.muted }}>
                          {item.cycleOn} {t.protocols.daysOn} / {item.cycleOff} {t.protocols.daysOff}
                        </Text>
                        {item.sourceText ? (
                          <Text style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>
                            {item.sourceText}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable onPress={() => removeProtocol(item.id)} style={{ padding: 6 }}>
                        <Text style={{ fontSize: 12, color: theme.muted }}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {step === 5 && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.onboarding.step5}
            </Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>
              {t.onboarding.bioFloors.subtitle}
            </Text>
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                  {t.onboarding.bioFloors.protein}
                </Text>
                <TextInput
                  value={proteinTarget}
                  onChangeText={setProteinTarget}
                  keyboardType="numeric"
                  placeholder="160"
                  placeholderTextColor={theme.muted}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                  {t.onboarding.bioFloors.water}
                </Text>
                <TextInput
                  value={waterTarget}
                  onChangeText={setWaterTarget}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={theme.muted}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                  {t.onboarding.bioFloors.fiber}
                </Text>
                <TextInput
                  value={fiberTarget}
                  onChangeText={setFiberTarget}
                  keyboardType="numeric"
                  placeholder="35"
                  placeholderTextColor={theme.muted}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>
            </View>
            <Pressable
              onPress={() => {
                if (!disclaimerAccepted) setShowDisclaimer(true);
                else setDisclaimerAccepted(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: 8,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: disclaimerAccepted ? theme.primary : theme.border,
                backgroundColor: disclaimerAccepted ? `${theme.primary}15` : theme.card,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: disclaimerAccepted ? theme.primary : theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: disclaimerAccepted ? theme.primary : 'transparent',
                }}
              >
                {disclaimerAccepted && <Text style={{ color: '#000000', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 12, color: theme.text }}>
                {t.onboarding.disclaimer.acceptLabel}
              </Text>
            </Pressable>
            <Pressable onPress={() => setShowDisclaimer(true)}>
              <Text style={{ fontSize: 11, color: theme.primary }}>
                {t.onboarding.disclaimer.viewLink}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 'auto' }}>
        {step > 1 && (
          <PrimaryButton
            label={t.onboarding.back}
            onPress={() => setStep(step - 1)}
            style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          />
        )}
        <PrimaryButton
          label={step === 5 ? t.onboarding.finish : t.onboarding.next}
          onPress={handleNext}
          disabled={!canProceed()}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}
