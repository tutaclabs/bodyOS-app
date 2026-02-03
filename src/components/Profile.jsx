import React, { useState, useEffect } from 'react';
import { User, Trash2, Sparkles } from 'lucide-react';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';
import { useTranslation } from '../hooks/useTranslation.js';
import Recommendations from './Recommendations.jsx';

const storage = new WebLocalStorageAdapter();

export default function Profile({ onLogout }) {
  const t = useTranslation();
  const [userSettings, setUserSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    const user = storage.load(STORAGE_KEYS.CURRENT_USER, null);
    setUserSettings(settings);
    setCurrentUser(user);
  };

  const handleClearOnboarding = () => {
    if (confirm('This will clear your onboarding data. You\'ll need to complete onboarding again. Continue?')) {
      const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
      delete settings.onboarding;
      delete settings.goals;
      delete settings.experienceLevel;
      delete settings.lifestyle;
      storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
      setUserSettings(settings);
      alert('Onboarding data cleared. Refresh the page to see onboarding again.');
    }
  };

  const getExperienceLabel = (level) => {
    if (!level) return 'Not set';
    const labels = {
      beginner: t.onboarding.experience.beginner,
      intermediate: t.onboarding.experience.intermediate,
      advanced: t.onboarding.experience.advanced,
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goalKey) => {
    const labels = {
      energy: t.onboarding.goals.energy,
      sleep: t.onboarding.goals.sleep,
      skin: t.onboarding.goals.skin,
      bodyComposition: t.onboarding.goals.bodyComposition,
      longevity: t.onboarding.goals.longevity,
      focus: t.onboarding.goals.focus,
    };
    return labels[goalKey] || goalKey;
  };

  if (!userSettings) {
    return (
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
        <p className="text-center text-slate-500 py-8">Loading profile...</p>
      </div>
    );
  }

  const onboarding = userSettings.onboarding || {};
  const goals = userSettings.goals || [];
  const experienceLevel = userSettings.experienceLevel || '';
  const lifestyle = userSettings.lifestyle || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-[#FF4F41]" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Profile</h2>
        </div>

        {currentUser && (
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-slate-800">{currentUser.email}</p>
            {onboarding.completedAt && (
              <p className="text-xs text-slate-500 mt-1">
                Member since {new Date(onboarding.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {onboarding.completed ? (
          <>
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800 mb-3">Optimization Goals</h3>
              {goals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#FF4F410D] border border-[#FF4F4133] rounded-lg text-xs font-semibold text-[#FF4F41]"
                    >
                      {getGoalLabel(goal)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No goals selected</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800 mb-3">Experience Level</h3>
              <div className="px-4 py-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-800">
                  {getExperienceLabel(experienceLevel)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800 mb-3">Lifestyle Factors</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {t.onboarding.lifestyle.sleepQuality}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF4F41] transition-all"
                        style={{ width: `${((lifestyle.sleepQuality || 5) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 min-w-[3rem] text-right">
                      {lifestyle.sleepQuality || 5}/10
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {t.onboarding.lifestyle.stress}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF4F41] transition-all"
                        style={{ width: `${((lifestyle.stress || 5) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 min-w-[3rem] text-right">
                      {lifestyle.stress || 5}/10
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {t.onboarding.lifestyle.trainingFreq}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF4F41] transition-all"
                        style={{ width: `${((lifestyle.trainingFreq || 3) / 7) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 min-w-[3rem] text-right">
                      {lifestyle.trainingFreq || 3} {t.onboarding.lifestyle.perWeek}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Recommendations compact={true} />
            </div>

            <button
              onClick={handleClearOnboarding}
              className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold text-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Reset Onboarding Data
            </button>
          </>
        ) : (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-2">Onboarding Not Completed</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Complete onboarding to personalize your experience and see your profile information here.
            </p>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full mt-6 py-3.5 bg-accent text-white rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      <div className="bg-slate-900 p-6 rounded-card-lg text-slate-900 shadow-soft-lg">
        <h3 className="font-semibold mb-2 text-slate-200">Data Privacy</h3>
        <p className="text-xs leading-relaxed text-slate-300">
          All your data is stored locally in your browser. No information is sent to external servers
          except when using AI features (with your API key). You can clear all data by clearing your
          browser's local storage.
        </p>
      </div>
    </div>
  );
}
