import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';
import { WebLocalStorageAdapter } from '../../../core/storage.js';
import { STORAGE_KEYS } from '../../../core/keys.js';

const storage = new WebLocalStorageAdapter();

export function SideEffectTimeline() {
  const t = useTranslation();
  const [timeline, setTimeline] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTimeline();
    loadProtocols();
  }, [dateRange]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const data = await apiFetch(`/v2/side-effects/timeline?${params.toString()}`);
      setTimeline(data.timeline || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProtocols = () => {
    const savedProtocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
    setProtocols(savedProtocols);
  };

  const maxSeverity = Math.max(...timeline.map((t) => t.severity), 10);
  const minDate = timeline.length > 0 ? new Date(Math.min(...timeline.map((t) => new Date(t.date).getTime()))) : new Date();
  const maxDate = timeline.length > 0 ? new Date(Math.max(...timeline.map((t) => new Date(t.date).getTime()))) : new Date();
  const dateSpan = maxDate.getTime() - minDate.getTime() || 1;

  if (loading) {
    return <div className="text-center py-4 text-slate-500">{t.common.loading}</div>;
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {t.sideEffects.noTimelineData}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">{t.sideEffects.timelineTitle}</h3>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-2 py-1 border border-slate-200 rounded text-sm"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-2 py-1 border border-slate-200 rounded text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="severityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF4F41" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FF4F41" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g>
              {timeline.map((point, idx) => {
                const x = ((new Date(point.date).getTime() - minDate.getTime()) / dateSpan) * 800;
                const y = 200 - (point.severity / maxSeverity) * 180;
                const nextPoint = timeline[idx + 1];
                let path = `M ${x} ${y}`;
                if (nextPoint) {
                  const nextX = ((new Date(nextPoint.date).getTime() - minDate.getTime()) / dateSpan) * 800;
                  const nextY = 200 - (nextPoint.severity / maxSeverity) * 180;
                  path += ` L ${nextX} ${nextY}`;
                }
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#FF4F41" />
                    <title>
                      {point.symptom} - {point.severity}/10 - {point.date}
                    </title>
                  </g>
                );
              })}
              {timeline.length > 1 && (
                <path
                  d={timeline.map((point, idx) => {
                    const x = ((new Date(point.date).getTime() - minDate.getTime()) / dateSpan) * 800;
                    const y = 200 - (point.severity / maxSeverity) * 180;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#FF4F41"
                  strokeWidth="2"
                  fill="none"
                />
              )}
            </g>
            <g>
              {[0, 2, 4, 6, 8, 10].map((severity) => {
                const y = 200 - (severity / maxSeverity) * 180;
                return (
                  <g key={severity}>
                    <line x1="0" y1={y} x2="800" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="5" y={y + 4} fontSize="10" fill="#64748b">
                      {severity}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF4F41]"></div>
            <span>{t.sideEffects.severity}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {timeline.map((point, idx) => {
          const protocol = point.protocol ? protocols.find((p) => p.id === point.protocol.id) : null;
          return (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{point.symptom}</span>
                <span className="text-slate-500">{point.date}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {t.sideEffects.severity}: {point.severity}/10
                {protocol && ` • ${t.sideEffects.protocol}: ${protocol.name || protocol.id}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
