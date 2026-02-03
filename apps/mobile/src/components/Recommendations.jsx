import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { getPersonalizedRecommendations } from '../core/ai-recommendations';
import { useLanguage } from '../contexts/LanguageContext';

const storage = new AsyncStorageAdapter();

export default function Recommendations({ onAddToProtocols, compact = false }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRec, setExpandedRec] = useState(new Set());

  const handleGetRecommendations = async () => {
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (!settings.onboarding?.completed) {
      setError(t.recommendations.completeOnboarding);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getPersonalizedRecommendations(language);
      setRecommendations(result);
    } catch (err) {
      setError(err.message || t.recommendations.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedRec);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRec(newExpanded);
  };

  const handleAddToProtocols = async (rec) => {
    if (onAddToProtocols) {
      const newProtocol = {
        name: rec.compoundName,
        cycleOn: rec.cycleOn || 5,
        cycleOff: rec.cycleOff || 2,
        id: Date.now(),
        active: true,
      };
      await onAddToProtocols(newProtocol);
      Alert.alert('Success', t.recommendations.addedToProtocols);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Peptide':
        return { bg: '#F3E8FF', text: '#7C3AED', border: '#C4B5FD' };
      case 'Vitamin':
        return { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' };
      case 'Mineral':
        return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
      case 'Fatty Acid':
        return { bg: '#FED7AA', text: '#EA580C', border: '#FDBA74' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  if (compact) {
    return (
      <Card style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}33` }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 18 }}>✨</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{t.recommendations.title}</Text>
        </View>
        <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 12 }}>{t.recommendations.compactDescription}</Text>
        <Pressable
          onPress={handleGetRecommendations}
          disabled={loading}
          style={{
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
            marginBottom: 12,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 13 }}>✨ {t.recommendations.getRecommendations}</Text>
          )}
        </Pressable>
        
        {error && (
          <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 8, marginBottom: 12 }}>{error}</Text>
        )}

        {recommendations && (
          <View style={{ gap: 12, marginTop: 12 }}>
            {recommendations.warnings && recommendations.warnings.length > 0 && (
              <View style={{ padding: 12, backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E', marginBottom: 8 }}>⚠️ {t.recommendations.warnings}</Text>
                {recommendations.warnings.map((warning, idx) => (
                  <Text key={idx} style={{ fontSize: 11, color: '#92400E', marginLeft: 8, marginBottom: 4 }}>
                    • {warning}
                  </Text>
                ))}
              </View>
            )}

            {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
              <View style={{ gap: 10 }}>
                {recommendations.recommendations.map((rec, idx) => {
                  const isExpanded = expandedRec.has(idx);
                  const categoryColors = getCategoryColor(rec.category);
                  return (
                    <View
                      key={idx}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 12,
                        overflow: 'hidden',
                      }}
                    >
                      <Pressable
                        onPress={() => toggleExpand(idx)}
                        style={{
                          padding: 14,
                          backgroundColor: theme.card,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                              <Text style={{ fontWeight: '800', color: theme.text, fontSize: 15 }}>{rec.compoundName}</Text>
                              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: categoryColors.bg, borderWidth: 1, borderColor: categoryColors.border }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: categoryColors.text }}>{rec.category}</Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 12, color: theme.muted }} numberOfLines={1}>{rec.rationale}</Text>
                          </View>
                          {onAddToProtocols && (
                            <Pressable
                              onPress={() => handleAddToProtocols(rec)}
                              style={{
                                padding: 8,
                                backgroundColor: theme.primary,
                                borderRadius: 8,
                                marginLeft: 8,
                              }}
                            >
                              <Text style={{ color: '#000000', fontSize: 16, fontWeight: '800' }}>+</Text>
                            </Pressable>
                          )}
                        </View>
                      </Pressable>

                      {isExpanded && (
                        <View style={{ padding: 14, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, gap: 12 }}>
                          <View>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.rationale}</Text>
                            <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 18 }}>{rec.rationale}</Text>
                          </View>

                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.dosageRange}</Text>
                              <Text style={{ fontSize: 12, color: theme.muted }}>{rec.dosageRange}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.timing}</Text>
                              <Text style={{ fontSize: 12, color: theme.muted }}>{rec.timing}</Text>
                            </View>
                          </View>

                          {rec.cycleOn && rec.cycleOff && (
                            <View>
                              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.cycle}</Text>
                              <Text style={{ fontSize: 12, color: theme.muted }}>
                                {rec.cycleOn} {t.protocols.daysOn} / {rec.cycleOff} {t.protocols.daysOff}
                              </Text>
                            </View>
                          )}

                          {rec.safetyNotes && rec.safetyNotes.length > 0 && (
                            <View>
                              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>ℹ️ {t.recommendations.safetyNotes}</Text>
                              {rec.safetyNotes.map((note, noteIdx) => (
                                <Text key={noteIdx} style={{ fontSize: 11, color: theme.muted, marginLeft: 8, marginBottom: 2 }}>
                                  • {note}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : recommendations && (
              <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', paddingVertical: 12 }}>{t.recommendations.noRecommendations}</Text>
            )}

            {recommendations.considerations && recommendations.considerations.length > 0 && (
              <View style={{ padding: 12, backgroundColor: '#DBEAFE', borderRadius: 12, borderWidth: 1, borderColor: '#93C5FD' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E40AF', marginBottom: 8 }}>ℹ️ {t.recommendations.considerations}</Text>
                {recommendations.considerations.map((consideration, idx) => (
                  <Text key={idx} style={{ fontSize: 11, color: '#1E40AF', marginLeft: 8, marginBottom: 4 }}>
                    • {consideration}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>✨</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{t.recommendations.title}</Text>
        </View>
        <Pressable
          onPress={handleGetRecommendations}
          disabled={loading}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: theme.primary,
            borderRadius: 12,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={{ color: '#000000', fontSize: 11, fontWeight: '700' }}>✨ {t.recommendations.getRecommendations}</Text>
          )}
        </Pressable>
      </View>

      {error && (
        <View style={{ marginBottom: 12, padding: 10, backgroundColor: '#FEE2E2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 11, color: '#DC2626' }}>{error}</Text>
        </View>
      )}

      {recommendations && (
        <View style={{ gap: 12 }}>
          {recommendations.warnings && recommendations.warnings.length > 0 && (
            <View style={{ padding: 12, backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E', marginBottom: 8 }}>⚠️ {t.recommendations.warnings}</Text>
              {recommendations.warnings.map((warning, idx) => (
                <Text key={idx} style={{ fontSize: 11, color: '#92400E', marginLeft: 8, marginBottom: 4 }}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
            <View style={{ gap: 10 }}>
              {recommendations.recommendations.map((rec, idx) => {
                const isExpanded = expandedRec.has(idx);
                const categoryColors = getCategoryColor(rec.category);
                return (
                  <View
                    key={idx}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <Pressable
                      onPress={() => toggleExpand(idx)}
                      style={{
                        padding: 14,
                        backgroundColor: theme.card,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <Text style={{ fontWeight: '800', color: theme.text, fontSize: 15 }}>{rec.compoundName}</Text>
                            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: categoryColors.bg, borderWidth: 1, borderColor: categoryColors.border }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: categoryColors.text }}>{rec.category}</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 12, color: theme.muted }} numberOfLines={1}>{rec.rationale}</Text>
                        </View>
                        {onAddToProtocols && (
                          <Pressable
                            onPress={() => handleAddToProtocols(rec)}
                            style={{
                              padding: 8,
                              backgroundColor: theme.primary,
                              borderRadius: 8,
                              marginLeft: 8,
                            }}
                          >
                            <Text style={{ color: '#000000', fontSize: 16, fontWeight: '800' }}>+</Text>
                          </Pressable>
                        )}
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View style={{ padding: 14, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, gap: 12 }}>
                        <View>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.rationale}</Text>
                          <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 18 }}>{rec.rationale}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.dosageRange}</Text>
                            <Text style={{ fontSize: 12, color: theme.muted }}>{rec.dosageRange}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.timing}</Text>
                            <Text style={{ fontSize: 12, color: theme.muted }}>{rec.timing}</Text>
                          </View>
                        </View>

                        {rec.cycleOn && rec.cycleOff && (
                          <View>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{t.recommendations.cycle}</Text>
                            <Text style={{ fontSize: 12, color: theme.muted }}>
                              {rec.cycleOn} {t.protocols.daysOn} / {rec.cycleOff} {t.protocols.daysOff}
                            </Text>
                          </View>
                        )}

                        {rec.safetyNotes && rec.safetyNotes.length > 0 && (
                          <View>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>ℹ️ {t.recommendations.safetyNotes}</Text>
                            {rec.safetyNotes.map((note, noteIdx) => (
                              <Text key={noteIdx} style={{ fontSize: 11, color: theme.muted, marginLeft: 8, marginBottom: 2 }}>
                                • {note}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', paddingVertical: 12 }}>{t.recommendations.noRecommendations}</Text>
          )}

          {recommendations.considerations && recommendations.considerations.length > 0 && (
            <View style={{ padding: 12, backgroundColor: '#DBEAFE', borderRadius: 12, borderWidth: 1, borderColor: '#93C5FD' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E40AF', marginBottom: 8 }}>ℹ️ {t.recommendations.considerations}</Text>
              {recommendations.considerations.map((consideration, idx) => (
                <Text key={idx} style={{ fontSize: 11, color: '#1E40AF', marginLeft: 8, marginBottom: 4 }}>
                  • {consideration}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {!recommendations && !loading && !error && (
        <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', paddingVertical: 12 }}>{t.recommendations.description}</Text>
      )}
    </Card>
  );
}
