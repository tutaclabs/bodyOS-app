import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { STORAGE_KEYS } from '../core/keys';
import { AsyncStorageAdapter } from '../core/storage';
import { askResearchQuestion } from '../core/ai-research';
import { WellnessMetricsScreen } from './WellnessMetricsScreen';
import { BiohackingInsightsScreen } from './BiohackingInsightsScreen';
import { GoalModeScreen } from './GoalModeScreen';
import { isBackendConfigured } from '../core/auth-api';
import { SideEffectLogger } from '../components/features/side-effects/SideEffectLogger';
import { SideEffectList } from '../components/features/side-effects/SideEffectList';

const storage = new AsyncStorageAdapter();

const AIResearchAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!isBackendConfigured()) {
      setError('Backend not configured. Please set API_URL in environment variables.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await askResearchQuestion(question);
      setAnswer(response);
    } catch (err) {
      setError(err.message || 'Failed to get response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313' }}>
          ⚡ AI Research Assistant
        </Text>
      </View>

      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask about compounds, protocols, dosing..."
        placeholderTextColor="#B5B5B5"
        style={{
          borderWidth: 1,
          borderColor: '#F7F7F7',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 13,
          color: '#131313',
          backgroundColor: '#F7F7F7',
          marginBottom: 12,
          fontWeight: '600',
        }}
        editable={!loading}
      />
      <Pressable
        onPress={handleAsk}
        disabled={loading || !question.trim()}
        style={{
          backgroundColor: theme.primary,
          borderRadius: 16,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: loading || !question.trim() ? 0.5 : 1,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={{ color: '#000000', fontWeight: '900', fontSize: 14 }}>Ask AI</Text>
        )}
      </Pressable>

      {error && (
        <View style={{ marginTop: 16, padding: 14, backgroundColor: '#FEE2E2', borderRadius: 16, borderWidth: 1, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '600' }}>{error}</Text>
        </View>
      )}

      {answer && (
        <View style={{ marginTop: 16, padding: 16, backgroundColor: '#F7F7F7', borderRadius: 16 }}>
          <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export function HealthScreen() {
  const [activeSection, setActiveSection] = useState('wellness');
  const [sideEffectRefresh, setSideEffectRefresh] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F7F7F7', backgroundColor: '#FFFFFF' }}>
        <Pressable
          onPress={() => setActiveSection('wellness')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: activeSection === 'wellness' ? theme.primary : '#F7F7F7',
            alignItems: 'center',
            shadowColor: activeSection === 'wellness' ? theme.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeSection === 'wellness' ? 0.2 : 0,
            shadowRadius: 4,
            elevation: activeSection === 'wellness' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '900', color: activeSection === 'wellness' ? '#000000' : '#131313' }}>
            💊 Wellness
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('goals')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: activeSection === 'goals' ? theme.primary : '#F7F7F7',
            alignItems: 'center',
            shadowColor: activeSection === 'goals' ? theme.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeSection === 'goals' ? 0.2 : 0,
            shadowRadius: 4,
            elevation: activeSection === 'goals' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '900', color: activeSection === 'goals' ? '#000000' : '#131313' }}>
            🎯 Goals
          </Text>
        </Pressable>
      </View>

      {activeSection === 'goals' ? (
        <GoalModeScreen />
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
          <WellnessMetricsScreen />
          
          <BiohackingInsightsScreen />
          
          <Card>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#131313', marginBottom: 20 }}>
          Safety & Vetted Resources
        </Text>

        <View style={{ gap: 16 }}>
          <View
            style={{
              backgroundColor: '#F7F7F7',
              borderRadius: 24,
              padding: 16
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', marginBottom: 12 }}>
              "White Market" Checklist
            </Text>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                • Verifiable physical business address (not just a PO Box).
              </Text>
              <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                • Recent 3rd-party HPLC testing with batch-specific COAs.
              </Text>
              <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                • Domain registration age and transparent ownership.
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#F7F7F7',
              borderRadius: 24,
              padding: 16
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#131313', marginBottom: 12 }}>
              Empirical Summaries
            </Text>
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                  BPC-157 Research Summary
                </Text>
                <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                  Systemic pentadecapeptide identified in gastric juice. Studies suggest
                  modulation of NO system and growth factor expression in tendon healing.
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                  GHK-Cu Copper Peptide
                </Text>
                <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                  Known for skin remodeling and hair follicle stimulation. Evidence points to
                  broad anti-inflammatory and antioxidant activities via gene expression
                  modulation.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

          <Card>
            <AIResearchAssistant />
          </Card>

          <Card>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#131313', marginBottom: 20 }}>
              Side Effect Tracking
            </Text>
            <SideEffectLogger
              onSave={() => setSideEffectRefresh(prev => prev + 1)}
            />
          </Card>

          <Card>
            <SideEffectList key={sideEffectRefresh} />
          </Card>
        </ScrollView>
      )}
    </View>
  );
}
