import React, { useState, useEffect } from 'react';
import { Activity, Save } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';

const storage = new WebLocalStorageAdapter();

export default function WellnessMetrics() {
  const t = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [metrics, setMetrics] = useState({
    energy: 5,
    metabolism: '',
    bowel: 1,
    pain: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const allMetrics = storage.load(STORAGE_KEYS.WELLNESS_METRICS, {});
    if (allMetrics[today]) {
      setMetrics(allMetrics[today]);
    }
  }, [today]);

  const handleSave = () => {
    const allMetrics = storage.load(STORAGE_KEYS.WELLNESS_METRICS, {});
    allMetrics[today] = metrics;
    storage.save(STORAGE_KEYS.WELLNESS_METRICS, allMetrics);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-[#F26101]" size={20} />
        <h2 className="text-lg font-bold text-slate-800">{t.wellness.title}</h2>
        <span className="ml-auto text-xs text-slate-500">{t.wellness.today}</span>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700">
              {t.wellness.energy}
            </label>
            <span className="text-sm text-slate-500">{metrics.energy}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={metrics.energy}
            onChange={(e) =>
              setMetrics({ ...metrics, energy: Number(e.target.value) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t.wellness.metabolism}
          </label>
          <textarea
            value={metrics.metabolism}
            onChange={(e) =>
              setMetrics({ ...metrics, metabolism: e.target.value })
            }
            placeholder="Notes about metabolism, digestion, etc."
            className="w-full p-3 border border-slate-200 rounded-button text-sm focus:ring-2 focus:ring-[#F26101] focus:border-[#F26101] outline-none transition-colors resize-none"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t.wellness.bowel}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMetrics({
                  ...metrics,
                  bowel: Math.max(0, metrics.bowel - 1),
                })
              }
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-slate-500 hover:bg-slate-100 transition-colors"
            >
              -
            </button>
            <span className="text-lg font-mono font-bold text-slate-800 min-w-[3rem] text-center">
              {metrics.bowel}
            </span>
            <button
              onClick={() =>
                setMetrics({
                  ...metrics,
                  bowel: metrics.bowel + 1,
                })
              }
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-slate-500 hover:bg-slate-100 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-slate-500">times today</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700">
              {t.wellness.pain}
            </label>
            <span className="text-sm text-slate-500">{metrics.pain}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={metrics.pain}
            onChange={(e) =>
              setMetrics({ ...metrics, pain: Number(e.target.value) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-button-pill font-semibold transition-colors flex items-center justify-center gap-2 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#F26101] text-white hover:bg-[#D95400]'
          }`}
        >
          <Save size={18} />
          {saved ? 'Saved!' : t.wellness.save}
        </button>
      </div>
    </div>
  );
}
