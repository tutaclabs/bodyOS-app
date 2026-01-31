import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, Linking, ActivityIndicator } from 'react-native';
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
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    (async () => {
      if (isBackendConfigured()) {
        setKeySaved(true);
        return;
      }
      const savedKey = await storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
      if (savedKey) {
        setApiKey(savedKey);
        setKeySaved(true);
      }
    })();
  }, []);

  const handleSaveKey = async () => {
    if (apiKey.trim()) {
      await storage.save(STORAGE_KEYS.OPENAI_API_KEY, apiKey.trim());
      setKeySaved(true);
      setShowKeyInput(false);
    }
  };

  const handleRemoveKey = async () => {
    await storage.save(STORAGE_KEYS.OPENAI_API_KEY, '');
    setApiKey('');
    setKeySaved(false);
    setAnswer('');
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!isBackendConfigured() && !apiKey) {
      setError('OpenAI API key is required');
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await askResearchQuestion(question, apiKey);
      setAnswer(response);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
          ⚡ AI Research Assistant
        </Text>
        {keySaved ? (
          <Pressable onPress={handleRemoveKey}>
            <Text style={{ fontSize: 11, color: theme.muted }}>Remove Key</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setShowKeyInput(!showKeyInput)}>
            <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>
              {showKeyInput ? 'Cancel' : 'Add API Key'}
            </Text>
          </Pressable>
        )}
      </View>

      {showKeyInput && !keySaved && !isBackendConfigured() && (
        <View style={{ marginBottom: 12, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your OpenAI API key"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 12,
              color: theme.text,
              marginBottom: 8
            }}
          />
          <Pressable
            onPress={handleSaveKey}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 12 }}>Save Key</Text>
          </Pressable>
          <Text style={{ fontSize: 10, color: theme.muted, marginTop: 8 }}>
            Your API key is stored locally. Get one at{' '}
            <Text
              style={{ color: theme.primary, textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL('https://platform.openai.com/api-keys')}
            >
              platform.openai.com
            </Text>
          </Text>
        </View>
      )}

      {keySaved && (
        <>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask about compounds, protocols, dosing..."
            style={{
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 13,
              color: theme.text,
              backgroundColor: theme.card,
              marginBottom: 10
            }}
            editable={!loading}
          />
          <Pressable
            onPress={handleAsk}
            disabled={loading || !question.trim()}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: loading || !question.trim() ? 0.5 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={{ color: '#000000', fontWeight: '800', fontSize: 13 }}>Ask AI</Text>
            )}
          </Pressable>
        </>
      )}

      {error && (
        <View style={{ marginTop: 12, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 11, color: '#DC2626' }}>{error}</Text>
        </View>
      )}

      {answer && (
        <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.card, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ fontSize: 12, color: theme.text, lineHeight: 18 }}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export function HealthScreen() {
  const [activeSection, setActiveSection] = useState('wellness');
  const [sideEffectRefresh, setSideEffectRefresh] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.bg }}>
        <Pressable
          onPress={() => setActiveSection('wellness')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeSection === 'wellness' ? theme.primary : theme.card,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: activeSection === 'wellness' ? '#000000' : theme.text }}>
            💊 Wellness
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('goals')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeSection === 'goals' ? theme.primary : theme.card,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: activeSection === 'goals' ? '#000000' : theme.text }}>
            🎯 Goals
          </Text>
        </Pressable>
      </View>

      {activeSection === 'goals' ? (
        <GoalModeScreen />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
          <WellnessMetricsScreen />
          
          <BiohackingInsightsScreen />
          
          <Card>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>
          Safety & Vetted Resources
        </Text>

        <View style={{ marginTop: 12, gap: 12 }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: '#E2E8F0',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
              "White Market" Checklist
            </Text>
            <View style={{ marginTop: 8, gap: 6 }}>
              <Text style={{ fontSize: 12, color: theme.muted }}>
                • Verifiable physical business address (not just a PO Box).
              </Text>
              <Text style={{ fontSize: 12, color: '#475569' }}>
                • Recent 3rd-party HPLC testing with batch-specific COAs.
              </Text>
              <Text style={{ fontSize: 12, color: '#475569' }}>
                • Domain registration age and transparent ownership.
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderColor: '#E2E8F0',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
              Empirical Summaries
            </Text>
            <View style={{ marginTop: 8, gap: 10 }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
                  BPC-157 Research Summary
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: theme.muted }}>
                  Systemic pentadecapeptide identified in gastric juice. Studies suggest
                  modulation of NO system and growth factor expression in tendon healing.
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>
                  GHK-Cu Copper Peptide
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: '#64748B' }}>
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
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
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
