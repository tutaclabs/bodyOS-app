import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';

const SITE_LOCATIONS = [
  { value: 'left_deltoid', label: 'Left Deltoid' },
  { value: 'right_deltoid', label: 'Right Deltoid' },
  { value: 'abdomen_upper_left', label: 'Abdomen Upper Left' },
  { value: 'abdomen_upper_right', label: 'Abdomen Upper Right' },
  { value: 'abdomen_lower_left', label: 'Abdomen Lower Left' },
  { value: 'abdomen_lower_right', label: 'Abdomen Lower Right' },
  { value: 'left_thigh', label: 'Left Thigh' },
  { value: 'right_thigh', label: 'Right Thigh' },
  { value: 'left_glute', label: 'Left Glute' },
  { value: 'right_glute', label: 'Right Glute' },
];

export function InjectionSiteSelector({ onSelect, selectedSite }) {
  const t = useTranslation();
  const [suggested, setSuggested] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestion();
  }, []);

  const loadSuggestion = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/v2/injection-sites/suggest');
      setSuggested(data);
      if (data.recommended && !selectedSite) {
        onSelect?.(data.recommended);
      }
    } catch (err) {
      console.error('Failed to load suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (site) => {
    onSelect?.(site);
  };

  return (
    <div className="space-y-3">
      {suggested?.needsRotation && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {t.injectionTracker.rotationWarning}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {SITE_LOCATIONS.map((site) => {
          const isSelected = selectedSite === site.value;
          const isRecommended = suggested?.recommended === site.value;
          return (
            <button
              key={site.value}
              onClick={() => handleSelect(site.value)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-[#F26101] text-white border-[#F26101]'
                  : isRecommended
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#F26101]'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{site.label}</span>
                {isRecommended && !isSelected && (
                  <span className="ml-auto text-xs">Recommended</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
