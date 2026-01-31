import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';

const storage = new WebLocalStorageAdapter();

export default function Onboarding() {
  const navigate = useNavigate();
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

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.onboarding = {
      completed: true,
      completedAt: Date.now(),
    };
    settings.goals = selectedGoals;
    settings.experienceLevel = experienceLevel;
    settings.lifestyle = lifestyle;
    storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    navigate('/app');
  };

  const canProceed = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return experienceLevel !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white rounded-card-lg max-w-md w-full p-8 shadow-soft-lg border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FF4F41] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="text-slate-900" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {t.onboarding.title}
          </h1>
          <p className="text-sm text-slate-600">{t.onboarding.subtitle}</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full ${
                  s <= step ? 'bg-[#FF4F41]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {t.onboarding.step1}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.key}
                    onClick={() => toggleGoal(goal.key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedGoals.includes(goal.key)
                        ? 'border-[#FF4F41] bg-[#FF4F41]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {goal.label}
                      </span>
                      {selectedGoals.includes(goal.key) && (
                        <Check className="text-[#FF4F41]" size={18} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {t.onboarding.step2}
              </h2>
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setExperienceLevel(level.key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      experienceLevel === level.key
                        ? 'border-[#FF4F41] bg-[#FF4F41]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">
                        {level.label}
                      </span>
                      {experienceLevel === level.key && (
                        <Check className="text-[#FF4F41]" size={18} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {t.onboarding.step3}
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {t.onboarding.lifestyle.sleepQuality}
                    </span>
                    <span className="text-sm text-slate-500">
                      {lifestyle.sleepQuality}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lifestyle.sleepQuality}
                    onChange={(e) =>
                      setLifestyle({
                        ...lifestyle,
                        sleepQuality: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{t.onboarding.lifestyle.low}</span>
                    <span>{t.onboarding.lifestyle.high}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {t.onboarding.lifestyle.stress}
                    </span>
                    <span className="text-sm text-slate-500">
                      {lifestyle.stress}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lifestyle.stress}
                    onChange={(e) =>
                      setLifestyle({
                        ...lifestyle,
                        stress: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{t.onboarding.lifestyle.low}</span>
                    <span>{t.onboarding.lifestyle.high}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {t.onboarding.lifestyle.trainingFreq}
                    </span>
                    <span className="text-sm text-slate-500">
                      {lifestyle.trainingFreq} {t.onboarding.lifestyle.perWeek}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={lifestyle.trainingFreq}
                    onChange={(e) =>
                      setLifestyle({
                        ...lifestyle,
                        trainingFreq: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-button-pill font-semibold hover:bg-slate-200 transition-colors"
            >
              {t.onboarding.back}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-3 bg-accent text-white rounded-button-pill font-semibold hover:bg-gradient-nuraform transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? t.onboarding.finish : t.onboarding.next}
          </button>
        </div>
      </div>
    </div>
  );
}
