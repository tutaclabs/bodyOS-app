import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, BookOpen, Calendar } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';
import { goalPrograms } from '../data/goal-programs.js';

const storage = new WebLocalStorageAdapter();

export default function GoalMode() {
  const t = useTranslation();
  const [activeProgram, setActiveProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedHabits, setCompletedHabits] = useState(new Set());

  useEffect(() => {
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (settings.activeGoal) {
      const program = goalPrograms.find((p) => p.id === settings.activeGoal.id);
      if (program) {
        setActiveProgram(program);
        setCurrentDay(settings.activeGoal.currentDay || 1);
        setCompletedHabits(
          new Set(settings.activeGoal.completedHabits || [])
        );
      }
    }
  }, []);

  const startProgram = (program) => {
    setActiveProgram(program);
    setCurrentDay(1);
    setCompletedHabits(new Set());
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.activeGoal = {
      id: program.id,
      startDate: new Date().toISOString(),
      currentDay: 1,
      completedHabits: [],
    };
    storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
  };

  const toggleHabit = (habitIndex) => {
    const habitId = `${currentDay}-${habitIndex}`;
    const newCompleted = new Set(completedHabits);
    if (newCompleted.has(habitId)) {
      newCompleted.delete(habitId);
    } else {
      newCompleted.add(habitId);
    }
    setCompletedHabits(newCompleted);

    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (settings.activeGoal) {
      settings.activeGoal.completedHabits = Array.from(newCompleted);
      storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
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
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-[#FF4F41]" size={20} />
              <h2 className="text-lg font-bold text-slate-800">
                {t.goals.activeProgram}
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveProgram(null);
                const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
                delete settings.activeGoal;
                storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Exit Program
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {activeProgram.name}
            </h3>
            <p className="text-sm text-slate-600">{activeProgram.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>
                {t.goals.day} {currentDay} {t.goals.of} {activeProgram.duration}
              </span>
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF4F41] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
              disabled={currentDay === 1}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-button text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              Previous Day
            </button>
            <button
              onClick={() =>
                setCurrentDay(
                  Math.min(activeProgram.duration, currentDay + 1)
                )
              }
              disabled={currentDay === activeProgram.duration}
              className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-button text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              Next Day
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-[#FF4F41]" size={18} />
            {t.goals.dailyHabits}
          </h3>
          <div className="space-y-2">
            {activeProgram.dailyHabits.map((habit, idx) => {
              const habitId = `${currentDay}-${idx}`;
              const isCompleted = completedHabits.has(habitId);
              return (
                <button
                  key={idx}
                  onClick={() => toggleHabit(idx)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {isCompleted && (
                        <CheckCircle2 className="text-slate-900" size={14} />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isCompleted
                          ? 'text-emerald-700 line-through'
                          : 'text-slate-700'
                      }`}
                    >
                      {habit}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {reading && (
          <div className="bg-gradient-to-br from-[#FF4F41]/5 to-[#FF4F41]/10 p-6 rounded-card border border-[#FF4F41]/20 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="text-[#FF4F41]" size={18} />
              <h3 className="text-base font-bold text-slate-800">
                {t.goals.reading}
              </h3>
            </div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">
              {reading.title}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {reading.content}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-[#FF4F41]" size={20} />
          <h2 className="text-lg font-bold text-slate-800">
            {t.goals.title}
          </h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          {t.goals.selectProgram}
        </p>

        <div className="space-y-4">
          {goalPrograms.map((program) => (
            <div
              key={program.id}
              className="p-4 border border-slate-200 rounded-xl hover:shadow-soft transition-shadow"
            >
              <h3 className="font-bold text-slate-800 mb-2">
                {program.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {program.description}
              </p>
              <button
                onClick={() => startProgram(program)}
                className="w-full py-2.5 bg-accent text-white rounded-button-pill font-semibold hover:bg-gradient-nuraform transition-colors"
              >
                {t.goals.startProgram}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
