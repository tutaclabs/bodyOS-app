import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { apiFetch } from '../../../core/api-client.js';
import { InjectionSiteList } from './InjectionSiteList.jsx';

const SITE_COORDS = {
  left_deltoid: { x: 15, y: 25, side: 'front' },
  right_deltoid: { x: 85, y: 25, side: 'front' },
  abdomen_upper_left: { x: 35, y: 45, side: 'front' },
  abdomen_upper_right: { x: 65, y: 45, side: 'front' },
  abdomen_lower_left: { x: 35, y: 60, side: 'front' },
  abdomen_lower_right: { x: 65, y: 60, side: 'front' },
  left_thigh: { x: 25, y: 75, side: 'front' },
  right_thigh: { x: 75, y: 75, side: 'front' },
  left_glute: { x: 25, y: 50, side: 'back' },
  right_glute: { x: 75, y: 50, side: 'back' },
};

function getSiteStatus(site) {
  if (!site.lastUsedDate) return 'green';
  const daysSince = Math.floor(
    (new Date().getTime() - new Date(site.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince >= 7) return 'green';
  if (daysSince >= 3) return 'yellow';
  return 'red';
}

export function InjectionSiteMap({ onSiteClick }) {
  const t = useTranslation();
  const [sites, setSites] = useState([]);
  const [view, setView] = useState('front');
  const [loading, setLoading] = useState(true);

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

  const handleSiteClick = (siteLocation) => {
    onSiteClick?.(siteLocation);
  };

  const siteMap = new Map(sites.map((s) => [s.siteLocation, s]));

  const frontSites = Object.entries(SITE_COORDS).filter(([_, coords]) => coords.side === 'front');
  const backSites = Object.entries(SITE_COORDS).filter(([_, coords]) => coords.side === 'back');

  const renderBody = (siteEntries) => (
    <div className="relative w-full h-96 bg-slate-50 rounded-lg border border-slate-200">
      {siteEntries.map(([siteLocation, coords]) => {
        const site = siteMap.get(siteLocation);
        const status = site ? getSiteStatus(site) : 'green';
        const colorClass =
          status === 'green'
            ? 'bg-emerald-500 hover:bg-emerald-600'
            : status === 'yellow'
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-red-500 hover:bg-red-600';

        return (
          <button
            key={siteLocation}
            onClick={() => handleSiteClick(siteLocation)}
            className={`absolute w-8 h-8 rounded-full ${colorClass} text-slate-900 text-xs font-bold shadow-md transition-all hover:scale-110 cursor-pointer`}
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={siteLocation.replace(/_/g, ' ')}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'front'
              ? 'bg-accent text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {t.injectionTracker.frontView}
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'back'
              ? 'bg-accent text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {t.injectionTracker.backView}
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'list'
              ? 'bg-accent text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {t.injectionTracker.listView}
        </button>
      </div>

      {view === 'list' ? (
        <InjectionSiteList />
      ) : (
        renderBody(view === 'front' ? frontSites : backSites)
      )}

      <div className="flex gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
          <span>{t.injectionTracker.ready}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span>{t.injectionTracker.useSparingly}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>{t.injectionTracker.avoid}</span>
        </div>
      </div>
    </div>
  );
}
