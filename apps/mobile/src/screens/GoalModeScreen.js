import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { goalPrograms } from '../data/goal-programs';

const storage = new AsyncStorageAdapter();

export function GoalModeScreen() {
  const t = useTranslation();
  const [activeProgram, setActiveProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedHabits, setCompletedHabits] = useState(new Set());

  useEffect(() => {
    (async () => {
      const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
      if (settings.activeGoal) {
        const program = goalPrograms.find((p) => p.id === settings.activeGoal.id);
        if (program) {
          setActiveProgram(program);
          setCurrentDay(settings.activeGoal.currentDay || 1);
          setCompletedHabits(new Set(settings.activeGoal.completedHabits || []));
        }
      }
    })();
  }, []);

  const startProgram = async (program) => {
    setActiveProgram(program);
    setCurrentDay(1);
    setCompletedHabits(new Set());
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.activeGoal = {
      id: program.id,
      startDate: Date.now(),
      currentDay: 1,
      completedHabits: [],
    };
    await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
  };

  const toggleHabit = async (habitIndex) => {
    const habitId = `${currentDay}-${habitIndex}`;
    const newCompleted = new Set(completedHabits);
    if (newCompleted.has(habitId)) {
      newCompleted.delete(habitId);
    } else {
      newCompleted.add(habitId);
    }
    setCompletedHabits(newCompleted);

    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (settings.activeGoal) {
      settings.activeGoal.completedHabits = Array.from(newCompleted);
      await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    }
  };

  const getTodaysReading = () => {
    if (!activeProgram) return null;
    return activeProgram.readingMaterials.find((r) => r.day === currentDay);
  };

  const progress = activeProgram
    ? (completedHabits.size / activeProgram.dailyHabits.length) * 100
    : 0;

  if (activeProgram) {
    const reading = getTodaysReading();
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
                {t.goals.activeProgram}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                setActiveProgram(null);
                const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
                delete settings.activeGoal;
                await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
              }}
            >
              <Text style={{ fontSize: 12, color: theme.muted }}>Exit</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 8 }}>
            {activeProgram.name}
          </Text>
          <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>
            {activeProgram.description}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: theme.muted }}>
              {t.goals.day} {currentDay} {t.goals.of} {activeProgram.duration}
            </Text>
            <View style={{ flex: 1, height: 6, backgroundColor: theme.card, borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
              <View
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: theme.primary,
                }}
              />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
              {Math.round(progress)}%
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={async () => {
                const newDay = Math.max(1, currentDay - 1);
                setCurrentDay(newDay);
                const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
                if (settings.activeGoal) {
                  settings.activeGoal.currentDay = newDay;
                  await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
                }
              }}
              disabled={currentDay === 1}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: theme.card,
                borderRadius: 12,
                alignItems: 'center',
                opacity: currentDay === 1 ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>Previous</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                const newDay = Math.min(activeProgram.duration, currentDay + 1);
                setCurrentDay(newDay);
                const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
                if (settings.activeGoal) {
                  settings.activeGoal.currentDay = newDay;
                  await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
                }
              }}
              disabled={currentDay === activeProgram.duration}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: theme.card,
                borderRadius: 12,
                alignItems: 'center',
                opacity: currentDay === activeProgram.duration ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>Next</Text>
            </Pressable>
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 16 }}>
            {t.goals.dailyHabits}
          </Text>
          <View style={{ gap: 10 }}>
            {activeProgram.dailyHabits.map((habit, idx) => {
              const habitId = `${currentDay}-${idx}`;
              const isCompleted = completedHabits.has(habitId);
              return (
                <Pressable
                  key={idx}
                  onPress={() => toggleHabit(idx)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isCompleted ? '#10B981' : '#E2E8F0',
                    backgroundColor: isCompleted ? theme.emeraldBg : theme.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isCompleted ? '#10B981' : '#CBD5E1',
                        backgroundColor: isCompleted ? '#10B981' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCompleted && <Text style={{ color: theme.emeraldText, fontSize: 12 }}>✓</Text>}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: isCompleted ? '#065F46' : theme.text,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {habit}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {reading && (
          <Card style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}33` }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 18 }}>📖</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                {t.goals.reading}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
              {reading.title}
            </Text>
            <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 20 }}>{reading.content}</Text>
          </Card>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 20 }}>🎯</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{t.goals.title}</Text>
        </View>
        <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 20 }}>
          {t.goals.selectProgram}
        </Text>

        <View style={{ gap: 16 }}>
          {goalPrograms.map((program) => (
            <View
              key={program.id}
              style={{
                padding: 16,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 14,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 8 }}>
                {program.name}
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 12 }}>
                {program.description}
              </Text>
              <Pressable
                onPress={() => startProgram(program)}
                style={{
                  paddingVertical: 12,
                  backgroundColor: theme.primary,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>
                  {t.goals.startProgram}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
