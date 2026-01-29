import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { STORAGE_KEYS } from '../core/keys';
import { AsyncStorageAdapter } from '../core/storage';
import { checkProtocolSafety } from '../core/ai-safety';
import { generateInsights } from '../core/ai-insights';
import { parseProtocolFromText } from '../core/ai-protocol-parser';
import { checkProtocolInteractions } from '../core/interaction-checker';
import { analyzeStackRedundancies } from '../core/stack-validator';
import { TrackerScreen } from './TrackerScreen';
import { pushProtocols } from '../core/cloud';
import { pushNutritionFloors } from '../core/cloud';
import { isBackendConfigured } from '../core/auth-api';

const storage = new AsyncStorageAdapter();

function SmallPill({ children }) {
  return (
    <View
      style={{
        marginLeft: 'auto',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: theme.emeraldBg,
        borderWidth: 1,
        borderColor: '#D1FAE5'
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '800', color: theme.emeraldText }}>
        {children}
      </Text>
    </View>
  );
}

export function DashboardScreen() {
  const scrollViewRef = useRef(null);
  const [activeSection, setActiveSection] = useState('protocols');
  const [protocols, setProtocols] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [cycleOn, setCycleOn] = useState('5');
  const [cycleOff, setCycleOff] = useState('2');
  const [timeOfDay, setTimeOfDay] = useState('flexible');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [editingProtocol, setEditingProtocol] = useState(null);

  const [floors, setFloors] = useState({
    protein: { current: 120, target: 160, unit: 'g' },
    fiber: { current: 15, target: 35, unit: 'g' },
    hydration: { current: 1.5, target: 3, unit: 'L' }
  });
  const [safetyCheck, setSafetyCheck] = useState(null);
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    (async () => {
      let savedProtocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);
      // Migration: Add timeOfDay to existing protocols
      const needsMigration = savedProtocols.some(p => !p.timeOfDay);
      if (needsMigration) {
        savedProtocols = savedProtocols.map(p => ({
          ...p,
          timeOfDay: p.timeOfDay || 'flexible'
        }));
        await storage.save(STORAGE_KEYS.PROTOCOLS, savedProtocols);
        await pushProtocols(savedProtocols).catch(() => {});
      }
      setProtocols(savedProtocols);
      const savedFloors = await storage.load(STORAGE_KEYS.NUTRITION_FLOORS, null);
      if (savedFloors) setFloors(savedFloors);
    })();
  }, []);

  const activeCount = useMemo(() => protocols.length, [protocols]);

  const addProtocol = async () => {
    if (!name.trim()) return;
    
    if (editingProtocol) {
      const next = protocols.map(p => 
        p.id === editingProtocol.id 
          ? { ...p, name: name.trim(), cycleOn: Number(cycleOn) || 0, cycleOff: Number(cycleOff) || 0, timeOfDay: timeOfDay }
          : p
      );
      setProtocols(next);
      await storage.save(STORAGE_KEYS.PROTOCOLS, next);
      await pushProtocols(next).catch(() => {});
      setEditingProtocol(null);
    } else {
      const next = [
        ...protocols,
        { id: Date.now(), name: name.trim(), cycleOn: Number(cycleOn) || 0, cycleOff: Number(cycleOff) || 0, timeOfDay: timeOfDay }
      ];
      setProtocols(next);
      await storage.save(STORAGE_KEYS.PROTOCOLS, next);
      await pushProtocols(next).catch(() => {});
    }
    
    setName('');
    setCycleOn('5');
    setCycleOff('2');
    setTimeOfDay('flexible');
    setIsAdding(false);
    setUseNaturalLanguage(false);
  };

  const startEdit = (protocol) => {
    setEditingProtocol(protocol);
    setName(protocol.name);
    setCycleOn(String(protocol.cycleOn));
    setCycleOff(String(protocol.cycleOff));
    setTimeOfDay(protocol.timeOfDay || 'flexible');
    setIsAdding(true);
    setUseNaturalLanguage(false);
  };

  const handleParseAndAdd = async () => {
    if (!naturalLanguageInput.trim()) {
      setParseError('Please enter a protocol description');
      return;
    }

    const apiKey = await storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!isBackendConfigured() && !apiKey) {
      setParseError('OpenAI API key required. Add it in the Health tab.');
      return;
    }

    setParsing(true);
    setParseError('');

    try {
      const parsed = await parseProtocolFromText(naturalLanguageInput, apiKey);
      const next = [
        ...protocols,
        { id: Date.now(), name: parsed.name, cycleOn: parsed.cycleOn, cycleOff: parsed.cycleOff, timeOfDay: parsed.timeOfDay || 'flexible' }
      ];
      setProtocols(next);
      await storage.save(STORAGE_KEYS.PROTOCOLS, next);
      await pushProtocols(next).catch(() => {});
      setNaturalLanguageInput('');
      setUseNaturalLanguage(false);
      setIsAdding(false);
    } catch (error) {
      setParseError(error.message || 'Failed to parse protocol. Try being more specific.');
    } finally {
      setParsing(false);
    }
  };

  const deleteProtocol = async (id) => {
    const next = protocols.filter((p) => p.id !== id);
    setProtocols(next);
    await storage.save(STORAGE_KEYS.PROTOCOLS, next);
    await pushProtocols(next).catch(() => {});
  };

  const bumpFloor = async (key, delta) => {
    const next = {
      ...floors,
      [key]: { ...floors[key], current: Math.max(0, (Number(floors[key].current) || 0) + delta) }
    };
    setFloors(next);
    await storage.save(STORAGE_KEYS.NUTRITION_FLOORS, next);
    await pushNutritionFloors(next).catch(() => {});
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isScrolled = contentOffset.y > 100;
    const canScrollMore = contentOffset.y + layoutMeasurement.height < contentSize.height - 100;
    setShowScrollButtons(isScrolled || canScrollMore);
  };

  const handleSafetyCheck = async () => {
    const apiKey = await storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    
    if (protocols.length === 0) {
      setSafetyCheck({
        safe: true,
        warnings: [],
        recommendations: ['No protocols to check. Add protocols to analyze for safety.']
      });
      return;
    }

    setCheckingSafety(true);
    
    const allWarnings = [];
    const allRecommendations = [];
    
    try {
      const interactionCheck = checkProtocolInteractions(protocols);
      if (interactionCheck.hasConflicts) {
        interactionCheck.warnings.forEach(w => {
          allWarnings.push(w.detail || w.message);
        });
      }
      
      const redundancyCheck = analyzeStackRedundancies(protocols);
      if (redundancyCheck.hasRedundancies) {
        redundancyCheck.warnings.forEach(w => {
          allRecommendations.push(w.message);
        });
      }
      
      if (isBackendConfigured() || apiKey) {
        const aiResult = await checkProtocolSafety(protocols, apiKey);
        if (aiResult.warnings) allWarnings.push(...aiResult.warnings);
        if (aiResult.recommendations) allRecommendations.push(...aiResult.recommendations);
      } else {
        allRecommendations.push('Add OpenAI API key in Health tab for AI-powered safety analysis.');
      }
      
      setSafetyCheck({
        safe: allWarnings.length === 0,
        warnings: allWarnings,
        recommendations: allRecommendations
      });
    } catch (error) {
      setSafetyCheck({
        safe: false,
        warnings: [`Error: ${error.message}`],
        recommendations: []
      });
    } finally {
      setCheckingSafety(false);
    }
  };

  const handleGenerateInsights = async () => {
    const apiKey = await storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!isBackendConfigured() && !apiKey) {
      setInsightsError('OpenAI API key required. Add it in the Health tab.');
      return;
    }

    if (protocols.length === 0 && !floors) {
      setInsightsError('Add protocols or nutrition data to generate insights.');
      return;
    }

    setLoadingInsights(true);
    setInsightsError('');

    try {
      const result = await generateInsights(protocols, floors, apiKey);
      setInsights(result.insights);
    } catch (err) {
      setInsightsError(err.message || 'Failed to generate insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: '#fff' }}>
        <Pressable
          onPress={() => setActiveSection('protocols')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeSection === 'protocols' ? theme.primary : '#F1F5F9',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: activeSection === 'protocols' ? '#fff' : theme.text }}>
            📊 Protocols
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('tracker')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeSection === 'tracker' ? theme.primary : '#F1F5F9',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: activeSection === 'tracker' ? '#fff' : theme.text }}>
            📅 Tracker
          </Text>
        </Pressable>
      </View>

      {activeSection === 'tracker' ? (
        <TrackerScreen />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 24 }}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
        <View style={{ gap: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Active Stacks</Text>
            <SmallPill>{activeCount} Active</SmallPill>
          </View>

          {protocols.length > 0 && (
            <Pressable
              onPress={handleSafetyCheck}
              disabled={checkingSafety}
              style={{
                marginTop: 12,
                backgroundColor: '#FEF3C7',
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: 'center',
                opacity: checkingSafety ? 0.5 : 1,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Text style={{ color: '#92400E', fontWeight: '700' }}>
                {checkingSafety ? 'Checking Safety...' : '🛡️ Check Safety'}
              </Text>
            </Pressable>
          )}

          {safetyCheck && (
            <View
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                backgroundColor: safetyCheck.safe ? '#ECFDF5' : '#FEF3C7',
                borderWidth: 1,
                borderColor: safetyCheck.safe ? '#A7F3D0' : '#FDE68A'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: safetyCheck.safe ? '#065F46' : '#92400E', marginBottom: 8 }}>
                Safety Analysis
              </Text>
              
              {safetyCheck.warnings.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 6 }}>
                    ⚠️ Warnings:
                  </Text>
                  {safetyCheck.warnings.map((warning, idx) => (
                    <Text key={idx} style={{ fontSize: 11, color: '#92400E', marginLeft: 8, marginBottom: 4 }}>
                      • {warning}
                    </Text>
                  ))}
                </View>
              )}
              
              {safetyCheck.recommendations.length > 0 && (
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
                    💡 Recommendations:
                  </Text>
                  {safetyCheck.recommendations.map((rec, idx) => (
                    <Text key={idx} style={{ fontSize: 11, color: '#475569', marginLeft: 8, marginBottom: 4 }}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
              
              {safetyCheck.safe && safetyCheck.warnings.length === 0 && (
                <Text style={{ fontSize: 11, color: '#065F46' }}>
                  ✓ No safety concerns detected with current protocols.
                </Text>
              )}
            </View>
          )}

          <Pressable
            onPress={() => {
              if (isAdding && editingProtocol) {
                setEditingProtocol(null);
                setName('');
                setCycleOn('5');
                setCycleOff('2');
              }
              setIsAdding((v) => !v);
              setUseNaturalLanguage(false);
            }}
            style={{
              marginTop: 12,
              backgroundColor: '#F2610114',
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F2610133'
            }}
          >
            <Text style={{ color: theme.primary, fontWeight: '700' }}>
              {isAdding ? (editingProtocol ? 'Cancel Edit' : 'Close') : 'Add Protocol'}
            </Text>
          </Pressable>

          {isAdding ? (
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setUseNaturalLanguage(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: !useNaturalLanguage ? theme.primary : '#F1F5F9',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: !useNaturalLanguage ? '#fff' : theme.text, fontSize: 11, fontWeight: '700' }}>
                    Manual
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setUseNaturalLanguage(true)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: useNaturalLanguage ? theme.primary : '#F1F5F9',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: useNaturalLanguage ? '#fff' : theme.text, fontSize: 11, fontWeight: '700' }}>
                    ⚡ AI Parse
                  </Text>
                </Pressable>
              </View>

              {useNaturalLanguage ? (
                <>
                  <TextInput
                    value={naturalLanguageInput}
                    onChangeText={(text) => {
                      setNaturalLanguageInput(text);
                      setParseError('');
                    }}
                    placeholder='e.g. "Add BPC-157, 5 days on, 2 days off"'
                    placeholderTextColor="#94A3B8"
                    multiline
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text,
                      minHeight: 80,
                      textAlignVertical: 'top'
                    }}
                    editable={!parsing}
                  />
                  {parseError && (
                    <Text style={{ fontSize: 11, color: '#DC2626' }}>{parseError}</Text>
                  )}
                  <Pressable
                    onPress={handleParseAndAdd}
                    disabled={parsing || !naturalLanguageInput.trim()}
                    style={{
                      backgroundColor: theme.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      opacity: parsing || !naturalLanguageInput.trim() ? 0.5 : 1
                    }}
                  >
                    {parsing ? (
                      <Text style={{ color: '#fff', fontWeight: '800' }}>Parsing...</Text>
                    ) : (
                      <Text style={{ color: '#fff', fontWeight: '800' }}>⚡ Parse & Add</Text>
                    )}
                  </Pressable>
                  <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
                    Describe your protocol naturally. AI will extract the details.
                  </Text>
                </>
              ) : (
                <>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Protocol Name (e.g. BPC-157)"
                    placeholderTextColor="#94A3B8"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
                        Days On
                      </Text>
                      <TextInput
                        value={cycleOn}
                        onChangeText={setCycleOn}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: theme.border,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          color: theme.text
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
                        Days Off
                      </Text>
                      <TextInput
                        value={cycleOff}
                        onChangeText={setCycleOff}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: theme.border,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          color: theme.text
                        }}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted, marginBottom: 6 }}>
                      Time of Day
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
                        <Pressable
                          key={time}
                          onPress={() => setTimeOfDay(time)}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: timeOfDay === time ? theme.primary : theme.border,
                            backgroundColor: timeOfDay === time ? `${theme.primary}15` : '#fff',
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{ 
                            fontSize: 11, 
                            fontWeight: '700', 
                            color: timeOfDay === time ? theme.primary : theme.muted,
                            textTransform: 'capitalize'
                          }}>
                            {time}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <Pressable
                    onPress={addProtocol}
                    style={{
                      backgroundColor: theme.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800' }}>
                      {editingProtocol ? 'Update Protocol' : 'Save Protocol'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}

          <View style={{ marginTop: 14, gap: 10 }}>
            {protocols.length === 0 ? (
              <Text style={{ color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 18 }}>
                No active protocols set.
              </Text>
            ) : (
              protocols.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => startEdit(p)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 14,
                    paddingLeft: 18,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    borderRadius: 16,
                    backgroundColor: pressed ? '#F8FAFC' : '#fff',
                    opacity: pressed ? 0.8 : 1,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.primary
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontWeight: '800', color: '#334155' }}>{p.name}</Text>
                    <Text style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {p.cycleOn} On / {p.cycleOff} Off Cycle
                    </Text>
                    {p.timeOfDay && p.timeOfDay !== 'flexible' && (
                      <Text style={{ fontSize: 10, color: theme.primary, textTransform: 'capitalize', marginTop: 2 }}>
                        {p.timeOfDay}
                      </Text>
                    )}
                  </View>
                  <Pressable 
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteProtocol(p.id);
                    }}
                    style={{ padding: 8, marginLeft: 8, borderRadius: 8 }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>Delete</Text>
                  </Pressable>
                </Pressable>
              ))
            )}
          </View>
        </Card>

        {protocols.length > 0 && (
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
              Daily Timeline
            </Text>
            <View style={{ gap: 16 }}>
              {['morning', 'afternoon', 'evening'].map((time) => {
                const timeProtocols = protocols.filter(p => p.timeOfDay === time);
                if (timeProtocols.length === 0) return null;
                
                const timeLabels = {
                  morning: { label: 'Morning', hours: '6-12', icon: '🌅' },
                  afternoon: { label: 'Afternoon', hours: '12-18', icon: '☀️' },
                  evening: { label: 'Evening', hours: '18-24', icon: '🌙' }
                };
                const timeInfo = timeLabels[time];
                
                return (
                  <View key={time} style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 16 }}>{timeInfo.icon}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
                        {timeInfo.label}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>
                        ({timeInfo.hours})
                      </Text>
                    </View>
                    {timeProtocols.map((p) => (
                      <View
                        key={p.id}
                        style={{
                          padding: 12,
                          backgroundColor: '#F8FAFC',
                          borderRadius: 12,
                          borderLeftWidth: 3,
                          borderLeftColor: theme.primary
                        }}
                      >
                        <Text style={{ fontWeight: '700', color: theme.text, marginBottom: 4 }}>
                          {p.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.muted }}>
                          {p.cycleOn} On / {p.cycleOff} Off Cycle
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
              {protocols.filter(p => !p.timeOfDay || p.timeOfDay === 'flexible').length > 0 && (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16 }}>🔄</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
                      Flexible Timing
                    </Text>
                  </View>
                  {protocols.filter(p => !p.timeOfDay || p.timeOfDay === 'flexible').map((p) => (
                    <View
                      key={p.id}
                      style={{
                        padding: 12,
                        backgroundColor: '#F8FAFC',
                        borderRadius: 12,
                        borderLeftWidth: 3,
                        borderLeftColor: theme.muted
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: theme.text, marginBottom: 4 }}>
                        {p.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>
                        {p.cycleOn} On / {p.cycleOff} Off Cycle
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card>
        )}

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>
              Bio-Supportive Floors
            </Text>
            <View
              style={{
                marginLeft: 'auto',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: '#F1F5F9'
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B' }}>
                NO CALORIE TRACKING
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14, gap: 18 }}>
            {Object.entries(floors).map(([key, data]) => {
              const progress = Math.min(1, (Number(data.current) || 0) / (Number(data.target) || 1));
              return (
                <View key={key} style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Text style={{ textTransform: 'capitalize', fontWeight: '700', color: '#475569' }}>
                      {key}
                    </Text>
                    <Text style={{ color: '#0F172A' }}>
                      <Text style={{ fontFamily: undefined, fontWeight: '900', fontSize: 18 }}>
                        {data.current}
                      </Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                        {' '}
                        / {data.target}
                        {data.unit} Floor
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: '#F1F5F9',
                      overflow: 'hidden'
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.round(progress * 100)}%`,
                        backgroundColor: theme.primary,
                        borderRadius: 999
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      onPress={() => bumpFloor(key, -5)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <Text style={{ fontWeight: '800', color: '#64748B' }}>-</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => bumpFloor(key, 5)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: '#F8FAFC',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ fontWeight: '800', color: '#334155' }}>Add Progress</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{ backgroundColor: '#F261010D', borderColor: '#F2610133' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Personalized Insights</Text>
            <Pressable
              onPress={handleGenerateInsights}
              disabled={loadingInsights}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: theme.primary,
                borderRadius: 12,
                opacity: loadingInsights ? 0.5 : 1
              }}
            >
              {loadingInsights ? (
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Analyzing...</Text>
              ) : (
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>⚡ Generate</Text>
              )}
            </Pressable>
          </View>

          {insightsError && (
            <View style={{ marginBottom: 12, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' }}>
              <Text style={{ fontSize: 11, color: '#DC2626' }}>{insightsError}</Text>
            </View>
          )}

          {insights.length > 0 && (
            <View style={{ gap: 10 }}>
              {insights.map((insight, idx) => (
                  <View
                    key={idx}
                    style={{
                      padding: 12,
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#F2610119'
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#334155', lineHeight: 18 }}>{insight}</Text>
                  </View>
              ))}
            </View>
          )}

          {insights.length === 0 && !loadingInsights && !insightsError && (
            <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', paddingVertical: 12 }}>
              Tap "Generate" to analyze your protocols and nutrition data for personalized insights.
            </Text>
          )}
        </Card>

        <Card style={{ backgroundColor: '#0F172A', borderColor: '#0F172A' }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#E2E8F0' }}>Data Sovereignty</Text>
          <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 16, color: '#94A3B8' }}>
            bodyOS does not use a cloud database. Protocol data and nutrition targets live locally on your device.
          </Text>
        </Card>
      </View>
      </ScrollView>
      )}

      {showScrollButtons && activeSection === 'protocols' && (
        <View style={{ position: 'absolute', right: 16, bottom: 100, gap: 8 }}>
          <TouchableOpacity
            onPress={scrollToTop}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={scrollToBottom}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>↓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
