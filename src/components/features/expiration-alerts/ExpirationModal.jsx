import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';

export function ExpirationModal({ protocol, onClose, onSave }) {
  const t = useTranslation();
  const [reconstitutionDate, setReconstitutionDate] = useState(
    protocol.reconstitutionDate || ''
  );
  const [expirationDate, setExpirationDate] = useState(protocol.expirationDate || '');
  const [expirationDays, setExpirationDays] = useState(protocol.expirationDays || 30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch(`/v2/protocols/${protocol.id}/expiration`, {
        method: 'PUT',
        body: JSON.stringify({
          reconstitutionDate,
          expirationDate,
          expirationDays,
        }),
      });
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Failed to save expiration:', err);
      alert('Failed to save expiration dates');
    } finally {
      setSaving(false);
    }
  };

  const handleReconstitutionChange = (date) => {
    setReconstitutionDate(date);
    if (date && !expirationDate) {
      const reconDate = new Date(date);
      reconDate.setDate(reconDate.getDate() + expirationDays);
      setExpirationDate(reconDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {t.expirationAlerts.setExpiration}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.expirationAlerts.reconstitutionDate}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={reconstitutionDate}
                onChange={(e) => handleReconstitutionChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.expirationAlerts.expirationDays}
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={expirationDays}
              onChange={(e) => {
                const days = parseInt(e.target.value, 10);
                setExpirationDays(days);
                if (reconstitutionDate) {
                  const reconDate = new Date(reconstitutionDate);
                  reconDate.setDate(reconDate.getDate() + days);
                  setExpirationDate(reconDate.toISOString().split('T')[0]);
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.expirationAlerts.expirationDate}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-gradient-nuraform transition-colors disabled:opacity-50"
            >
              {saving ? t.common.loading : t.common.save}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
