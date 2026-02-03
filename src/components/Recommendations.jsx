import React, { useState } from 'react';
import { Sparkles, Plus, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';
import { getPersonalizedRecommendations } from '../core/ai-recommendations.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const storage = new WebLocalStorageAdapter();

export default function Recommendations({ onAddToProtocols, compact = false }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRec, setExpandedRec] = useState(new Set());

  const handleGetRecommendations = async () => {
    const apiKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!apiKey) {
      setError(t.recommendations.apiKeyRequired);
      return;
    }

    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (!settings.onboarding?.completed) {
      setError(t.recommendations.completeOnboarding);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getPersonalizedRecommendations(apiKey, language);
      setRecommendations(result);
    } catch (err) {
      setError(err.message || t.recommendations.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedRec);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRec(newExpanded);
  };

  const handleAddToProtocols = (rec) => {
    if (onAddToProtocols) {
      onAddToProtocols({
        name: rec.compoundName,
        cycleOn: rec.cycleOn || 5,
        cycleOff: rec.cycleOff || 2,
        id: Date.now(),
        active: true,
      });
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Peptide':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Vitamin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Mineral':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Fatty Acid':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-[#FF4F41]/5 to-[#FF4F41]/10 p-4 rounded-xl border border-[#FF4F41]/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#FF4F41]" size={18} />
            <h3 className="text-sm font-bold text-slate-800">{t.recommendations.title}</h3>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-3">{t.recommendations.compactDescription}</p>
        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="w-full bg-[#FF4F41] text-white py-2 rounded-button-pill text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gradient-to-r hover:from-[#FF4F41] hover:to-[#D43A2E] transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>{t.recommendations.generating}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>{t.recommendations.getRecommendations}</span>
            </>
          )}
        </button>
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#FF4F41]" size={20} />
          <h2 className="text-lg font-bold text-slate-800 font-serif">{t.recommendations.title}</h2>
        </div>
        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="px-4 py-2 bg-[#FF4F41] text-white rounded-button-pill text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-[#FF4F41] hover:to-[#D43A2E] transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>{t.recommendations.generating}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>{t.recommendations.getRecommendations}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {recommendations && (
        <div className="space-y-4">
          {recommendations.warnings && recommendations.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800 mb-1">{t.recommendations.warnings}</p>
                  <ul className="space-y-1">
                    {recommendations.warnings.map((warning, idx) => (
                      <li key={idx} className="text-xs text-amber-700 flex gap-2">
                        <span>•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.recommendations.map((rec, idx) => {
                const isExpanded = expandedRec.has(idx);
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-soft transition-shadow"
                  >
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-800">{rec.compoundName}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(rec.category)}`}>
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{rec.rationale}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {onAddToProtocols && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToProtocols(rec);
                            }}
                            className="p-1.5 bg-[#FF4F41] text-white rounded-lg hover:bg-[#D43A2E] transition-colors"
                            title={t.recommendations.addToProtocols}
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 mb-1">{t.recommendations.rationale}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{rec.rationale}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 mb-1">{t.recommendations.dosageRange}</h4>
                            <p className="text-xs text-slate-600">{rec.dosageRange}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 mb-1">{t.recommendations.timing}</h4>
                            <p className="text-xs text-slate-600">{rec.timing}</p>
                          </div>
                        </div>

                        {rec.cycleOn && rec.cycleOff && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 mb-1">{t.recommendations.cycle}</h4>
                            <p className="text-xs text-slate-600">
                              {rec.cycleOn} {t.protocols.daysOn} / {rec.cycleOff} {t.protocols.daysOff}
                            </p>
                          </div>
                        )}

                        {rec.safetyNotes && rec.safetyNotes.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Info size={12} />
                              {t.recommendations.safetyNotes}
                            </h4>
                            <ul className="space-y-1">
                              {rec.safetyNotes.map((note, noteIdx) => (
                                <li key={noteIdx} className="text-xs text-slate-600 flex gap-2">
                                  <span>•</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">{t.recommendations.noRecommendations}</p>
          )}

          {recommendations.considerations && recommendations.considerations.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 shrink-0" size={16} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-800 mb-1">{t.recommendations.considerations}</p>
                  <ul className="space-y-1">
                    {recommendations.considerations.map((consideration, idx) => (
                      <li key={idx} className="text-xs text-blue-700 flex gap-2">
                        <span>•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!recommendations && !loading && !error && (
        <p className="text-xs text-slate-500 text-center py-4">{t.recommendations.description}</p>
      )}
    </div>
  );
}
