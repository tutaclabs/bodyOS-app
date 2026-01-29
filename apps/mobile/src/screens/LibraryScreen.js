import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { libraryItems } from '../data/library-items';
import { BodyOSIntelligenceScreen } from './BodyOSIntelligenceScreen';

export function LibraryScreen() {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = ['All', ...new Set(libraryItems.map((item) => item.category))];

  const filteredItems = libraryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mechanismOfAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wellnessUses.some((use) => use.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getEvidenceColor = (level) => {
    switch (level) {
      case 'Strong':
        return { bg: '#ECFDF5', text: '#065F46' };
      case 'Moderate':
        return { bg: '#FFFBEB', text: '#92400E' };
      case 'Low':
      case 'Low to Moderate':
        return { bg: '#F1F5F9', text: '#475569' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 20 }}>📚</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
            {t.library.title}
          </Text>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.library.search}
          style={{
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 14,
            color: theme.text,
            backgroundColor: '#fff',
            marginBottom: 12,
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === cat ? theme.primary : '#F1F5F9',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: selectedCategory === cat ? '#fff' : theme.text,
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View
          style={{
            backgroundColor: '#F1F5F9',
            borderColor: '#E2E8F0',
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 8 }}>
            "White Market" Checklist
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, color: '#475569' }}>
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
      </Card>

      {filteredItems.length === 0 ? (
        <Card>
          <Text style={{ textAlign: 'center', color: theme.muted, paddingVertical: 20 }}>
            No items found matching your search.
          </Text>
        </Card>
      ) : (
        filteredItems.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const evidenceColor = getEvidenceColor(item.evidenceLevel);
          return (
            <Card key={item.id}>
              <Pressable onPress={() => toggleExpand(item.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                        {item.name}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: '#F1F5F9',
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.muted }}>
                          {item.category}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: evidenceColor.bg,
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', color: evidenceColor.text }}>
                          {item.evidenceLevel}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{ fontSize: 12, color: theme.muted, lineHeight: 16 }}
                      numberOfLines={isExpanded ? 0 : 2}
                    >
                      {item.mechanismOfAction}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: theme.muted, marginLeft: 12 }}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </Pressable>

              {isExpanded && (
                <View style={{ marginTop: 16, gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 6 }}>
                      {t.library.mechanism}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 18 }}>
                      {item.mechanismOfAction}
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 6 }}>
                      {t.library.uses}
                    </Text>
                    {item.wellnessUses.map((use, idx) => (
                      <Text key={idx} style={{ fontSize: 12, color: theme.muted, marginBottom: 4 }}>
                        • {use}
                      </Text>
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                        {t.library.forms}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.muted }}>{item.commonForms}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                        {t.library.timing}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.muted }}>{item.timing}</Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                      {t.library.avoid}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.muted }}>{item.whoShouldAvoid}</Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                      {t.library.interactions}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.muted }}>{item.interactions}</Text>
                  </View>

                  {(item.researchOnly || item.prescriptionOnly) && (
                    <View
                      style={{
                        backgroundColor: '#FEF3C7',
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E', marginBottom: 8 }}>
                        ⚠️ Safety Information
                      </Text>
                      {item.researchOnly && (
                        <Text style={{ fontSize: 11, color: '#92400E', marginBottom: 4 }}>
                          • Research-only compound. Not FDA-approved for human use.
                        </Text>
                      )}
                      {item.prescriptionOnly && (
                        <Text style={{ fontSize: 11, color: '#92400E', marginBottom: 4 }}>
                          • Prescription-only. Requires medical supervision.
                        </Text>
                      )}
                      {item.questionsForClinician && item.questionsForClinician.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 6 }}>
                            Questions to Ask a Clinician:
                          </Text>
                          {item.questionsForClinician.map((q, idx) => (
                            <Text key={idx} style={{ fontSize: 11, color: '#92400E', marginBottom: 4, marginLeft: 8 }}>
                              • {q}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                      {t.library.regulatory}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.text, fontWeight: '700' }}>
                      {item.regulatoryStatus}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          );
        })
      )}

      <View style={{ marginTop: 16 }}>
        <BodyOSIntelligenceScreen />
      </View>
    </ScrollView>
  );
}
