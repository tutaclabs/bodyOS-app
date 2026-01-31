import React, { useState, useEffect } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';
import { WebLocalStorageAdapter } from '../../../core/storage.js';
import { STORAGE_KEYS } from '../../../core/keys.js';

const storage = new WebLocalStorageAdapter();

const COMMON_SIDE_EFFECTS = [
  'Nausea',
  'Headache',
  'Fatigue',
  'Dizziness',
  'Injection site redness',
  'Injection site pain',
  'Muscle soreness',
  'Sleep disturbance',
  'Mood changes',
  'Digestive issues',
];

export function SideEffectLogger({ onSave, initialProtocolId }) {
  const t = useTranslation();
  const [protocols, setProtocols] = useState([]);
  const [formData, setFormData] = useState({
    protocolId: initialProtocolId || '',
    date: new Date().toISOString().split('T')[0],
    symptom: '',
    severity: 5,
    duration: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = () => {
    const savedProtocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
    setProtocols(Array.isArray(savedProtocols) ? savedProtocols : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symptom.trim()) {
      alert(t.sideEffects.symptomRequired);
      return;
    }

    try {
      setSaving(true);
      await apiFetch('/v2/side-effects', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setFormData({
        protocolId: '',
        date: new Date().toISOString().split('T')[0],
        symptom: '',
        severity: 5,
        duration: '',
        notes: '',
      });
      onSave?.();
    } catch (err) {
      console.error('Failed to save side effect:', err);
      alert('Failed to save side effect');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.protocol} (Optional)
        </label>
        <select
          value={formData.protocolId}
          onChange={(e) => setFormData({ ...formData, protocolId: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        >
          <option value="">{t.sideEffects.noProtocol}</option>
          {Array.isArray(protocols) && protocols.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.symptom} *
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_SIDE_EFFECTS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => setFormData({ ...formData, symptom })}
              className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
            >
              {symptom}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={formData.symptom}
          onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
          placeholder={t.sideEffects.symptomPlaceholder}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.severity}: {formData.severity}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value, 10) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{t.sideEffects.mild}</span>
          <span>{t.sideEffects.severe}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.duration} (Optional)
        </label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="e.g., 2 hours, 1 day"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t.sideEffects.notes} (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t.sideEffects.notesPlaceholder}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !formData.symptom.trim()}
        className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-gradient-nuraform transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {saving ? t.common.loading : t.sideEffects.save}
      </button>
    </form>
  );
}
