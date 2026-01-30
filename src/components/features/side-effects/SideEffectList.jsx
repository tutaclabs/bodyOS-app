import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, X, Filter } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';

export function SideEffectList() {
  const t = useTranslation();
  const [sideEffects, setSideEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    protocolId: '',
    minSeverity: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSideEffects();
  }, [filters]);

  const loadSideEffects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.protocolId) params.append('protocolId', filters.protocolId);
      if (filters.minSeverity) params.append('minSeverity', filters.minSeverity);

      const data = await apiFetch(`/v2/side-effects?${params.toString()}`);
      setSideEffects(data.sideEffects || []);
    } catch (err) {
      console.error('Failed to load side effects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.sideEffects.confirmDelete)) return;

    try {
      await apiFetch(`/v2/side-effects/${id}`, { method: 'DELETE' });
      loadSideEffects();
    } catch (err) {
      console.error('Failed to delete side effect:', err);
      alert('Failed to delete side effect');
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-100 text-red-800';
    if (severity >= 5) return 'bg-amber-100 text-amber-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">{t.common.loading}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">{t.sideEffects.listTitle}</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          <Filter size={16} />
          {t.sideEffects.filters}
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.sideEffects.startDate}
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.sideEffects.endDate}
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.sideEffects.minSeverity}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={filters.minSeverity}
              onChange={(e) => setFilters({ ...filters, minSeverity: e.target.value })}
              placeholder="1-10"
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
            />
          </div>
        </div>
      )}

      {sideEffects.length === 0 ? (
        <div className="text-center py-8 text-slate-500">{t.sideEffects.noSideEffects}</div>
      ) : (
        <div className="space-y-3">
          {sideEffects.map((se) => (
            <div
              key={se.id}
              className="p-4 bg-white border border-slate-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-slate-500" />
                  <span className="font-semibold text-slate-800">{se.symptom}</span>
                </div>
                <button
                  onClick={() => handleDelete(se.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(se.date).toLocaleDateString()}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(se.severity)}`}>
                  {t.sideEffects.severity}: {se.severity}/10
                </span>
                {se.duration && <span>{t.sideEffects.duration}: {se.duration}</span>}
              </div>
              {se.notes && (
                <p className="text-sm text-slate-600 mt-2">{se.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
