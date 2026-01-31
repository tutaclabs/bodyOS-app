import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { libraryItems } from '../data/library-items.js';
import BodyOSIntelligence from './BodyOSIntelligence.jsx';

export default function Library() {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = ['All', ...new Set(libraryItems.map((item) => item.category))];

  const filteredItems = libraryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mechanismOfAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wellnessUses.some((use) =>
        use.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getEvidenceColor = (level) => {
    switch (level) {
      case 'Strong':
        return 'text-emerald-600 bg-emerald-50';
      case 'Moderate':
        return 'text-amber-600 bg-amber-50';
      case 'Low':
        return 'text-slate-600 bg-slate-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft col-span-full">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="text-[#FF4F41]" size={20} />
        <h2 className="text-lg font-bold text-slate-800">{t.library.title}</h2>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.library.search}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-button text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-button-pill text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-[#FF4F41]" /> "White Market"
            Checklist
          </h3>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex gap-2">
              <span>•</span> Verifiable physical business address (not just a PO
              Box).
            </li>
            <li className="flex gap-2">
              <span>•</span> Recent 3rd-party HPLC testing with batch-specific
              COAs.
            </li>
            <li className="flex gap-2">
              <span>•</span> Domain registration age and transparent ownership.
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {filteredItems.length === 0 ? (
          <p className="text-center text-slate-500 py-8 text-sm">
            No items found matching your search.
          </p>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-soft transition-shadow"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getEvidenceColor(
                          item.evidenceLevel
                        )}`}
                      >
                        {t.library[item.evidenceLevel.toLowerCase()] ||
                          item.evidenceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.mechanismOfAction}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-slate-400 shrink-0 ml-4" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400 shrink-0 ml-4" size={20} />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2">
                        {t.library.mechanism}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.mechanismOfAction}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2">
                        {t.library.uses}
                      </h4>
                      <ul className="space-y-1">
                        {item.wellnessUses.map((use, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex gap-2">
                            <span>•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">
                          {t.library.forms}
                        </h4>
                        <p className="text-xs text-slate-600">{item.commonForms}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">
                          {t.library.timing}
                        </h4>
                        <p className="text-xs text-slate-600">{item.timing}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">
                        {t.library.avoid}
                      </h4>
                      <p className="text-xs text-slate-600">{item.whoShouldAvoid}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">
                        {t.library.interactions}
                      </h4>
                      <p className="text-xs text-slate-600">{item.interactions}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">
                        {t.library.regulatory}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold">
                        {item.regulatoryStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BodyOSIntelligence />
    </div>
  );
}
