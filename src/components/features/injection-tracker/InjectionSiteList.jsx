import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';

const SITE_LABELS = {
  left_deltoid: 'Left Deltoid',
  right_deltoid: 'Right Deltoid',
  abdomen_upper_left: 'Abdomen Upper Left',
  abdomen_upper_right: 'Abdomen Upper Right',
  abdomen_lower_left: 'Abdomen Lower Left',
  abdomen_lower_right: 'Abdomen Lower Right',
  left_thigh: 'Left Thigh',
  right_thigh: 'Right Thigh',
  left_glute: 'Left Glute',
  right_glute: 'Right Glute',
};

function getSiteStatus(site) {
  if (!site.lastUsedDate) return { color: 'green', label: 'Ready' };
  const daysSince = Math.floor(
    (new Date().getTime() - new Date(site.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince >= 7) return { color: 'green', label: 'Ready' };
  if (daysSince >= 3) return { color: 'yellow', label: 'Use Sparingly' };
  return { color: 'red', label: 'Avoid' };
}

export function InjectionSiteList() {
  const t = useTranslation();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/v2/injection-sites');
      setSites(data.sites || []);
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (site) => {
    setEditingId(site.id);
    setEditNotes(site.notes || '');
  };

  const handleSaveNotes = async (siteId) => {
    try {
      await apiFetch(`/v2/injection-sites/${siteId}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: editNotes }),
      });
      setEditingId(null);
      loadSites();
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">{t.common.loading}</div>;
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {t.injectionTracker.noSites}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sites.map((site) => {
        const status = getSiteStatus(site);
        const isEditing = editingId === site.id;
        return (
          <div
            key={site.id}
            className="p-4 bg-white border border-slate-200 rounded-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                <span className="font-semibold text-slate-800">
                  {SITE_LABELS[site.siteLocation] || site.siteLocation}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  status.color === 'green'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status.color === 'yellow'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {site.lastUsedDate
                    ? new Date(site.lastUsedDate).toLocaleDateString()
                    : t.injectionTracker.neverUsed}
                </span>
              </div>
              <span>{t.injectionTracker.usedCount}: {site.usageCount}</span>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t.injectionTracker.notesPlaceholder}
                  className="w-full p-2 border border-slate-200 rounded text-sm"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveNotes(site.id)}
                    className="px-3 py-1.5 bg-[#F26101] text-white rounded text-sm font-medium"
                  >
                    {t.common.save}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {site.notes && (
                  <p className="text-sm text-slate-600">{site.notes}</p>
                )}
                <button
                  onClick={() => handleEdit(site)}
                  className="p-1.5 text-slate-500 hover:text-slate-700"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
