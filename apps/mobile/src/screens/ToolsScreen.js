import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { calculateUnits } from '../core/reconstitution';
import { libraryItems } from '../data/library-items';
import { BodyOSIntelligenceScreen } from './BodyOSIntelligenceScreen';

export function ToolsScreen() {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState('calc');

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F7F7F7', backgroundColor: '#FFFFFF' }}>
        <Pressable
          onPress={() => setActiveSection('calc')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: activeSection === 'calc' ? theme.primary : '#F7F7F7',
            alignItems: 'center',
            shadowColor: activeSection === 'calc' ? theme.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeSection === 'calc' ? 0.2 : 0,
            shadowRadius: 4,
            elevation: activeSection === 'calc' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '900', color: activeSection === 'calc' ? '#000000' : '#131313' }}>
            🧪 Calculator
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('library')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: activeSection === 'library' ? theme.primary : '#F7F7F7',
            alignItems: 'center',
            shadowColor: activeSection === 'library' ? theme.primary : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeSection === 'library' ? 0.2 : 0,
            shadowRadius: 4,
            elevation: activeSection === 'library' ? 2 : 0,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '900', color: activeSection === 'library' ? '#000000' : '#131313' }}>
            📚 Library
          </Text>
        </Pressable>
      </View>

      {activeSection === 'calc' ? <CalcSection /> : <LibrarySection />}
    </View>
  );
}

function CalcSection() {
  const t = useTranslation();
  const [vialMg, setVialMg] = useState('5');
  const [bacMl, setBacMl] = useState('2');
  const [desiredMcg, setDesiredMcg] = useState('250');
  const [focusedInput, setFocusedInput] = useState(null);

  const units = useMemo(() => {
    const vial = Number(vialMg) || 0;
    const bac = Number(bacMl) || 0;
    const dose = Number(desiredMcg) || 0;
    return calculateUnits({ vialMg: vial, bacMl: bac, desiredMcg: dose });
  }, [vialMg, bacMl, desiredMcg]);

  const showSafetyWarning = units > 50 || (Number(desiredMcg) || 0) > 2000;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
      <Card>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#131313', marginBottom: 24 }}>
          {t.reconstitution.title}
        </Text>

        <View style={{ gap: 20 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 1: {t.reconstitution.vialMg}
            </Text>
            <TextInput
              value={vialMg}
              onChangeText={setVialMg}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="#B5B5B5"
              onFocus={() => setFocusedInput('vialMg')}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: '#F7F7F7',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#131313',
                fontSize: 16,
                fontWeight: '700',
                borderWidth: focusedInput === 'vialMg' ? 2 : 0,
                borderColor: focusedInput === 'vialMg' ? theme.primary : 'transparent',
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 2: {t.reconstitution.bacMl}
            </Text>
            <TextInput
              value={bacMl}
              onChangeText={setBacMl}
              keyboardType="numeric"
              placeholder="e.g. 2"
              placeholderTextColor="#B5B5B5"
              onFocus={() => setFocusedInput('bacMl')}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: '#F7F7F7',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#131313',
                fontSize: 16,
                fontWeight: '700',
                borderWidth: focusedInput === 'bacMl' ? 2 : 0,
                borderColor: focusedInput === 'bacMl' ? theme.primary : 'transparent',
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#B5B5B5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 3: {t.reconstitution.desiredMcg}
            </Text>
            <TextInput
              value={desiredMcg}
              onChangeText={setDesiredMcg}
              keyboardType="numeric"
              placeholder="e.g. 250"
              placeholderTextColor="#B5B5B5"
              onFocus={() => setFocusedInput('desiredMcg')}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: '#F7F7F7',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#131313',
                fontSize: 16,
                fontWeight: '700',
                borderWidth: focusedInput === 'desiredMcg' ? 2 : 0,
                borderColor: focusedInput === 'desiredMcg' ? theme.primary : 'transparent',
              }}
            />
          </View>
        </View>

        <View
          style={{
            marginTop: 24,
            padding: 32,
            backgroundColor: '#F7F7F7',
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#B5B5B5', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
            {t.reconstitution.drawAmount}
          </Text>
          <Text style={{ fontSize: 64, fontWeight: '900', color: theme.primary, marginBottom: 8, fontFamily: 'monospace', letterSpacing: -2 }}>
            {units.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 12, color: '#B5B5B5', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            {t.reconstitution.units}
          </Text>
        </View>

        {showSafetyWarning && (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: '#FEF3C7',
              borderColor: '#FDE68A',
              borderWidth: 1
            }}
          >
            <Text style={{ fontSize: 13, color: '#92400E', fontWeight: '600' }}>
              {t.reconstitution.safetyNote}
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

function LibrarySection() {
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
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 20 }}>📚</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#131313' }}>
            {t.library.title}
          </Text>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.library.search}
          placeholderTextColor="#B5B5B5"
          style={{
            borderWidth: 1,
            borderColor: '#F7F7F7',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 14,
            color: '#131313',
            backgroundColor: '#F7F7F7',
            marginBottom: 16,
            fontWeight: '600',
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
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: selectedCategory === cat ? theme.primary : '#F7F7F7',
                  shadowColor: selectedCategory === cat ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedCategory === cat ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: selectedCategory === cat ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '900',
                    color: selectedCategory === cat ? '#000000' : '#131313',
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
            backgroundColor: '#F7F7F7',
            borderRadius: 24,
            padding: 16,
            marginBottom: 16,
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
      </Card>

      {filteredItems.length === 0 ? (
        <Card>
          <Text style={{ textAlign: 'center', color: '#B5B5B5', paddingVertical: 20, fontSize: 14, fontWeight: '600' }}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#131313' }}>
                        {item.name}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: '#F7F7F7',
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#131313' }}>
                          {item.category}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: evidenceColor.bg,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: evidenceColor.text }}>
                          {item.evidenceLevel}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}
                      numberOfLines={isExpanded ? 0 : 2}
                    >
                      {item.mechanismOfAction}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, color: '#B5B5B5', marginLeft: 12, fontWeight: '700' }}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </Pressable>

              {isExpanded && (
                <View style={{ marginTop: 20, gap: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F7F7F7' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 8 }}>
                      {t.library.mechanism}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>
                      {item.mechanismOfAction}
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 8 }}>
                      {t.library.uses}
                    </Text>
                    {item.wellnessUses.map((use, idx) => (
                      <Text key={idx} style={{ fontSize: 13, color: '#131313', marginBottom: 6, lineHeight: 20, fontWeight: '400' }}>
                        • {use}
                      </Text>
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                        {t.library.forms}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>{item.commonForms}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                        {t.library.timing}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>{item.timing}</Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                      {t.library.avoid}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>{item.whoShouldAvoid}</Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                      {t.library.interactions}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#131313', lineHeight: 20, fontWeight: '400' }}>{item.interactions}</Text>
                  </View>

                  {(item.researchOnly || item.prescriptionOnly) && (
                    <View
                      style={{
                        backgroundColor: '#FEF3C7',
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#92400E', marginBottom: 10 }}>
                        ⚠️ Safety Information
                      </Text>
                      {item.researchOnly && (
                        <Text style={{ fontSize: 12, color: '#92400E', marginBottom: 6, lineHeight: 18, fontWeight: '600' }}>
                          • Research-only compound. Not FDA-approved for human use.
                        </Text>
                      )}
                      {item.prescriptionOnly && (
                        <Text style={{ fontSize: 12, color: '#92400E', marginBottom: 6, lineHeight: 18, fontWeight: '600' }}>
                          • Prescription-only. Requires medical supervision.
                        </Text>
                      )}
                      {item.questionsForClinician && item.questionsForClinician.length > 0 && (
                        <View style={{ marginTop: 10 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E', marginBottom: 8 }}>
                            Questions to Ask a Clinician:
                          </Text>
                          {item.questionsForClinician.map((q, idx) => (
                            <Text key={idx} style={{ fontSize: 12, color: '#92400E', marginBottom: 6, marginLeft: 8, lineHeight: 18, fontWeight: '600' }}>
                              • {q}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#131313', marginBottom: 6 }}>
                      {t.library.regulatory}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#131313', fontWeight: '700' }}>
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
