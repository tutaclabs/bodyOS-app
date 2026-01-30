import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Calendar,
  Activity,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Zap,
  BookOpen,
  Home,
  ChevronUp,
  ChevronDown,
  Target,
  Globe,
  User
} from 'lucide-react';

import { STORAGE_KEYS } from './core/keys.js';
import { WebLocalStorageAdapter } from './core/storage.js';
import { calculateUnits } from './core/reconstitution.js';
import { askResearchQuestion } from './core/ai-research.js';
import { checkProtocolSafety } from './core/ai-safety.js';
import { generateInsights } from './core/ai-insights.js';
import { parseProtocolFromText } from './core/ai-protocol-parser.js';
import { useTranslation } from './hooks/useTranslation.js';
import { useLanguage } from './contexts/LanguageContext.jsx';
import { MedicalDisclaimerModal, MedicalDisclaimerFooter } from './components/MedicalDisclaimer.jsx';
import Library from './components/Library.jsx';
import WellnessMetrics from './components/WellnessMetrics.jsx';
import GoalMode from './components/GoalMode.jsx';
import Profile from './components/Profile.jsx';

const storage = new WebLocalStorageAdapter();

const ReconstitutionWizard = () => {
  const t = useTranslation();
  const [vialMg, setVialMg] = useState(5);
  const [bacMl, setBacMl] = useState(2);
  const [desiredMcg, setDesiredMcg] = useState(250);
  const [focusedInput, setFocusedInput] = useState(null);

  const units = useMemo(() => {
    return calculateUnits({ vialMg, bacMl, desiredMcg });
  }, [vialMg, bacMl, desiredMcg]);

  const showSafetyWarning = units > 50 || desiredMcg > 2000;

  return (
    <div className="bg-dark-card p-6 rounded-card border border-dark-border" style={{ backgroundColor: '#161B22', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className="flex items-center gap-2 mb-8">
        <Calculator className="text-primary" size={20} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
        <h2 className="text-lg font-bold text-white font-serif">{t.reconstitution.title}</h2>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Step 1: {t.reconstitution.vialMg}
          </label>
          <input
            type="number"
            value={vialMg}
            onChange={(e) => setVialMg(Number(e.target.value) || 0)}
            onFocus={() => setFocusedInput('vialMg')}
            onBlur={() => setFocusedInput(null)}
            className={`w-full p-4 rounded-lg outline-none transition-all text-white ${
              focusedInput === 'vialMg' 
                ? 'border-b-2 border-b-primary' 
                : 'border-b-0'
            }`}
            style={{ 
              backgroundColor: '#161B22',
              borderBottomColor: focusedInput === 'vialMg' ? '#D4AF37' : 'transparent'
            }}
            placeholder="e.g. 5"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Step 2: {t.reconstitution.bacMl}
          </label>
          <input
            type="number"
            value={bacMl}
            onChange={(e) => setBacMl(Number(e.target.value) || 0)}
            onFocus={() => setFocusedInput('bacMl')}
            onBlur={() => setFocusedInput(null)}
            className={`w-full p-4 rounded-lg outline-none transition-all text-white ${
              focusedInput === 'bacMl' 
                ? 'border-b-2 border-b-primary' 
                : 'border-b-0'
            }`}
            style={{ 
              backgroundColor: '#161B22',
              borderBottomColor: focusedInput === 'bacMl' ? '#D4AF37' : 'transparent'
            }}
            placeholder="e.g. 2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Step 3: {t.reconstitution.desiredMcg}
          </label>
          <input
            type="number"
            value={desiredMcg}
            onChange={(e) => setDesiredMcg(Number(e.target.value) || 0)}
            onFocus={() => setFocusedInput('desiredMcg')}
            onBlur={() => setFocusedInput(null)}
            className={`w-full p-4 rounded-lg outline-none transition-all text-white ${
              focusedInput === 'desiredMcg' 
                ? 'border-b-2 border-b-primary' 
                : 'border-b-0'
            }`}
            style={{ 
              backgroundColor: '#161B22',
              borderBottomColor: focusedInput === 'desiredMcg' ? '#D4AF37' : 'transparent'
            }}
            placeholder="e.g. 250"
          />
        </div>

        {showSafetyWarning && (
          <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg flex gap-3">
            <AlertTriangle className="text-amber-400 shrink-0" size={18} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
            <p className="text-xs text-amber-200">
              <strong>{t.reconstitution.safetyNote.split(':')[0]}:</strong> {t.reconstitution.safetyNote.split(':').slice(1).join(':').trim()}
            </p>
          </div>
        )}
      </div>

      <div className="p-8 bg-dark-card border border-dark-border rounded-card flex flex-col items-center justify-center" style={{ backgroundColor: '#161B22', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">
          {t.reconstitution.drawAmount}
        </span>
        <span className="text-7xl font-mono font-black text-primary mb-3" style={{ color: '#D4AF37', letterSpacing: '-4px' }}>
          {units.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{t.reconstitution.units}</span>
      </div>
    </div>
  );
};

const ProtocolDashboard = () => {
  const t = useTranslation();
  const [protocols, setProtocols] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    dose: '',
    cycleOn: 5,
    cycleOff: 2
  });
  const [safetyCheck, setSafetyCheck] = useState(null);
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    setProtocols(storage.load(STORAGE_KEYS.PROTOCOLS, []));
  }, []);

  const handleSafetyCheck = async () => {
    const apiKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!apiKey) {
      setSafetyCheck({
        safe: false,
        warnings: ['OpenAI API key required. Add it in the Knowledge Base section.'],
        recommendations: []
      });
      return;
    }

    if (protocols.length === 0) {
      setSafetyCheck({
        safe: true,
        warnings: [],
        recommendations: ['No protocols to check. Add protocols to analyze for safety.']
      });
      return;
    }

    setCheckingSafety(true);
    try {
      const result = await checkProtocolSafety(protocols, apiKey);
      setSafetyCheck(result);
    } catch (error) {
      setSafetyCheck({
        safe: false,
        warnings: [`Error: ${error.message}`],
        recommendations: []
      });
    } finally {
      setCheckingSafety(false);
    }
  };

  const addProtocol = () => {
    if (!newProtocol.name) return;
    const updated = [
      ...protocols,
      { ...newProtocol, id: Date.now(), active: true }
    ];
    setProtocols(updated);
    storage.save(STORAGE_KEYS.PROTOCOLS, updated);
    setNewProtocol({ name: '', dose: '', cycleOn: 5, cycleOff: 2 });
    setIsAdding(false);
  };

  const handleParseAndAdd = async () => {
    if (!naturalLanguageInput.trim()) {
      setParseError('Please enter a protocol description');
      return;
    }

    const apiKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!apiKey) {
      setParseError('OpenAI API key required. Add it in the Knowledge Base section.');
      return;
    }

    setParsing(true);
    setParseError('');

    try {
      const parsed = await parseProtocolFromText(naturalLanguageInput, apiKey);
      const updated = [
        ...protocols,
        { ...parsed, id: Date.now(), active: true }
      ];
      setProtocols(updated);
      storage.save(STORAGE_KEYS.PROTOCOLS, updated);
      setNaturalLanguageInput('');
      setUseNaturalLanguage(false);
      setIsAdding(false);
    } catch (error) {
      setParseError(error.message || 'Failed to parse protocol. Try being more specific.');
    } finally {
      setParsing(false);
    }
  };

  const deleteProtocol = (id) => {
    const updated = protocols.filter((p) => p.id !== id);
    setProtocols(updated);
    storage.save(STORAGE_KEYS.PROTOCOLS, updated);
  };

  return (
    <div className="bg-dark-card p-6 rounded-card border border-dark-border" style={{ backgroundColor: '#161B22', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary" size={20} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
          <h2 className="text-lg font-bold text-white font-serif">{t.protocols.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {protocols.length > 0 && (
            <button
              onClick={handleSafetyCheck}
              disabled={checkingSafety}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-button text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShieldCheck size={14} strokeWidth={1.5} />
              {checkingSafety ? t.protocols.checking : t.protocols.checkSafety}
            </button>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-[#F26101]/10 text-[#F26101] rounded-button-pill hover:bg-[#F26101]/20 transition-colors"
          >
            <Plus size={20} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
          </button>
        </div>
      </div>

      {safetyCheck && (
        <div className={`mb-6 p-4 rounded-xl border ${
          safetyCheck.safe 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-2 mb-3">
            <ShieldCheck className={safetyCheck.safe ? 'text-emerald-400' : 'text-amber-400'} size={18} strokeWidth={1.5} style={{ color: safetyCheck.safe ? '#3FB881' : '#D4AF37' }} />
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${safetyCheck.safe ? 'text-emerald-800' : 'text-amber-800'}`}>
                {t.safety.analysis}
              </h3>
            </div>
          </div>
          
          {safetyCheck.warnings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-800 mb-2">⚠️ {t.safety.warnings}</p>
              <ul className="space-y-1">
                {safetyCheck.warnings.map((warning, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex gap-2">
                    <span>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {safetyCheck.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">💡 {t.safety.recommendations}</p>
              <ul className="space-y-1">
                {safetyCheck.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {safetyCheck.safe && safetyCheck.warnings.length === 0 && (
            <p className="text-xs text-emerald-700">✓ {t.safety.noConcerns}</p>
          )}
        </div>
      )}

      {isAdding && (
        <div className="mb-6 p-4 border border-[#F26101]/20 bg-[#F26101]/5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setUseNaturalLanguage(false)}
              className={`flex-1 py-1.5 rounded-button text-xs font-semibold transition-colors ${
                !useNaturalLanguage
                  ? 'bg-[#F26101] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.protocols.manualEntry}
            </button>
            <button
              onClick={() => setUseNaturalLanguage(true)}
              className={`flex-1 py-1.5 rounded-button text-xs font-semibold transition-colors ${
                useNaturalLanguage
                  ? 'bg-[#F26101] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⚡ {t.protocols.aiParse}
            </button>
          </div>

          {useNaturalLanguage ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t.protocols.parsePlaceholder}
                className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                value={naturalLanguageInput}
                onChange={(e) => {
                  setNaturalLanguageInput(e.target.value);
                  setParseError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && !parsing && handleParseAndAdd()}
                disabled={parsing}
              />
              {parseError && (
                <p className="text-xs text-red-600">{parseError}</p>
              )}
              <button
                onClick={handleParseAndAdd}
                disabled={parsing || !naturalLanguageInput.trim()}
                className="w-full bg-[#F26101] text-white py-2.5 rounded-button-pill font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#D95400] transition-colors"
              >
                {parsing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>{t.protocols.parsing}</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
                    <span>{t.protocols.parseAndAdd}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Describe your protocol naturally. AI will extract the details.
              </p>
            </div>
          ) : (
            <>
              <input
                placeholder={t.protocols.protocolName}
                className="w-full p-2 rounded-lg border border-slate-200"
                value={newProtocol.name}
                onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400">{t.protocols.daysOn}</span>
                  <input
                    type="number"
                    className="w-full outline-none"
                    value={newProtocol.cycleOn}
                    onChange={(e) =>
                      setNewProtocol({
                        ...newProtocol,
                        cycleOn: Number(e.target.value) || 0
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400">{t.protocols.daysOff}</span>
                  <input
                    type="number"
                    className="w-full outline-none"
                    value={newProtocol.cycleOff}
                    onChange={(e) =>
                      setNewProtocol({
                        ...newProtocol,
                        cycleOff: Number(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
              <button
                onClick={addProtocol}
                className="w-full bg-[#F26101] text-white py-2.5 rounded-button-pill font-semibold hover:bg-[#D95400] transition-colors"
              >
                {t.protocols.saveProtocol}
              </button>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {protocols.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm italic">
            {t.protocols.noProtocols}
          </p>
        )}
        {protocols.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F26101]"></div>
            <div className="flex flex-col ml-3">
              <span className="font-bold text-slate-700">{p.name}</span>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                {p.cycleOn} {t.protocols.cycle.split(' / ')[0]} / {p.cycleOff} {t.protocols.cycle.split(' / ')[1]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              <button
                onClick={() => deleteProtocol(p.id)}
                className="p-2 rounded-lg text-slate-300 hover:text-[#F26101] hover:bg-[#F26101]/10 transition-colors"
                title="Delete protocol"
              >
                <Trash2 size={16} strokeWidth={1.5} style={{ color: '#8B949E' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonalizedInsights = () => {
  const t = useTranslation();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const protocols = storage.load(STORAGE_KEYS.PROTOCOLS, []);
  const floors = storage.load(STORAGE_KEYS.NUTRITION_FLOORS, null);

  const handleGenerateInsights = async () => {
    const apiKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!apiKey) {
      setError('OpenAI API key required. Add it in the Knowledge Base section.');
      return;
    }

    if (protocols.length === 0 && !floors) {
      setError('Add protocols or nutrition data to generate insights.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateInsights(protocols, floors, apiKey);
      setInsights(result.insights);
    } catch (err) {
      setError(err.message || 'Failed to generate insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card p-6 rounded-card border border-dark-border" style={{ backgroundColor: '#161B22', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary" size={20} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
          <h2 className="text-lg font-bold text-white font-serif">{t.insights.title}</h2>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={loading}
          className="px-4 py-2 bg-[#F26101] text-white rounded-button-pill text-xs font-semibold hover:bg-[#D95400] transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>{t.insights.analyzing}</span>
            </>
          ) : (
            <>
                <Zap size={14} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
              <span>{t.insights.generate}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/90 rounded-lg border border-[#F26101]/10 shadow-soft"
            >
              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {insights.length === 0 && !loading && !error && (
        <p className="text-xs text-slate-500 text-center py-4">
          {t.insights.noData}
        </p>
      )}
    </div>
  );
};

const FloorTracker = () => {
  const t = useTranslation();
  const [floors, setFloors] = useState({
    protein: { current: 120, target: 160, unit: 'g' },
    fiber: { current: 15, target: 35, unit: 'g' },
    hydration: { current: 1.5, target: 3, unit: 'L' }
  });

  useEffect(() => {
    const saved = storage.load(STORAGE_KEYS.NUTRITION_FLOORS, null);
    if (saved) setFloors(saved);
  }, []);

  const updateVal = (key, delta) => {
    const updated = {
      ...floors,
      [key]: {
        ...floors[key],
        current: Math.max(0, floors[key].current + delta)
      }
    };
    setFloors(updated);
    storage.save(STORAGE_KEYS.NUTRITION_FLOORS, updated);
  };

  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary" size={20} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
        <h2 className="text-lg font-bold text-white font-serif">{t.floors.title}</h2>
        <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {t.floors.noCalorieTracking}
        </span>
      </div>

      <div className="space-y-6">
        {Object.entries(floors).map(([key, data]) => {
          const progress = Math.min(100, (data.current / data.target) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between items-end mb-2">
                <span className="capitalize font-semibold text-slate-700">{key}</span>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-slate-800">
                    {data.current}
                  </span>
                  <span className="text-xs text-slate-400">
                    {' '}
                    / {data.target}
                    {data.unit} Floor
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#F26101] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateVal(key, -5)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  -
                </button>
                <button
                  onClick={() => updateVal(key, 5)}
                  className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                >
                  {t.floors.addProgress}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AIResearchAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const savedKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (savedKey) {
      setApiKey(savedKey);
      setKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      storage.save(STORAGE_KEYS.OPENAI_API_KEY, apiKey.trim());
      setKeySaved(true);
      setShowKeyInput(false);
    }
  };

  const handleRemoveKey = () => {
    storage.save(STORAGE_KEYS.OPENAI_API_KEY, '');
    setApiKey('');
    setKeySaved(false);
    setAnswer('');
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!apiKey) {
      setError('OpenAI API key is required');
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await askResearchQuestion(question, apiKey);
      setAnswer(response);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-[#F26101]/5 to-[#F26101]/10 rounded-xl border border-[#F26101]/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Zap size={14} strokeWidth={1.5} style={{ color: '#D4AF37' }} /> AI Research Assistant
        </h3>
        {keySaved ? (
          <button
            onClick={handleRemoveKey}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Remove Key
          </button>
        ) : (
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs text-[#F26101] hover:text-[#D95400] font-semibold transition-colors"
          >
            {showKeyInput ? 'Cancel' : 'Add API Key'}
          </button>
        )}
      </div>

      {showKeyInput && !keySaved && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-[#F26101]/20 shadow-soft">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="w-full p-2 border border-slate-200 rounded-lg text-xs mb-2 focus:ring-2 focus:ring-[#F26101] focus:border-[#F26101] outline-none transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveKey}
              className="flex-1 bg-[#F26101] text-white py-1.5 rounded-button text-xs font-semibold hover:bg-[#D95400] transition-colors"
            >
              Save Key
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Your API key is stored locally and never shared. Get one at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#F26101] underline hover:text-[#D95400]">
              platform.openai.com
            </a>
          </p>
        </div>
      )}

      {keySaved && (
        <>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about compounds, protocols, dosing..."
            className="w-full p-2.5 border border-slate-200 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-[#F26101] focus:border-[#F26101] outline-none transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleAsk()}
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full bg-[#F26101] text-white py-2.5 rounded-button-pill text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D95400] transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Thinking...
              </span>
            ) : (
              'Ask AI'
            )}
          </button>
        </>
      )}

      {error && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {answer && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-[#F26101]/10 shadow-soft">
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
};


export default function BodyOSApp() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (!settings.disclaimerAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/goals')) {
      setActiveTab('goals');
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.disclaimerAccepted = true;
    storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    setShowDisclaimer(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setShowScrollUp(scrollTop > 300);
      setShowScrollDown(scrollTop + windowHeight < documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const MobileView = () => {
    if (activeTab === 'calc') {
      return (
        <div className="space-y-8">
          <ReconstitutionWizard />
          <Library />
        </div>
      );
    }

    if (activeTab === 'health') {
      return (
        <div className="space-y-8">
          <FloorTracker />
          <WellnessMetrics />
          <PersonalizedInsights />
          <Library />
        </div>
      );
    }

    if (activeTab === 'goals') {
      return (
        <div className="space-y-8">
          <GoalMode />
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="space-y-8">
          <Profile />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <ProtocolDashboard />
        <FloorTracker />
        <WellnessMetrics />
        <PersonalizedInsights />
        <Library />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg font-sans text-white pb-20 md:pb-8" style={{ backgroundColor: '#0A0C10' }}>
      <MedicalDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccept={handleAcceptDisclaimer}
      />
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Home"
          >
            <Home size={20} strokeWidth={1.5} style={{ color: '#8B949E' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F26101] rounded-lg flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">{t.app.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-button text-xs font-semibold text-slate-700 transition-colors"
            title={t.common.language}
          >
            <Globe size={14} strokeWidth={1.5} style={{ color: '#8B949E' }} />
            {language === 'en' ? 'EN' : 'PT'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-100">
            <ShieldCheck size={12} strokeWidth={1.5} style={{ color: '#3FB881' }} /> Local-Only Storage Active
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="md:hidden">
          <MobileView />
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ReconstitutionWizard />
            <ProtocolDashboard />
          </div>
          <div className="space-y-8">
            <FloorTracker />
            <WellnessMetrics />
            <div className="p-6 bg-slate-900 rounded-card-lg text-white shadow-soft-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-200">
                <Info size={16} strokeWidth={1.5} style={{ color: '#8B949E' }} /> Data Sovereignty
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                bodyOS does not use a cloud database. All protocol data, dosage history,
                and nutrition targets reside exclusively in your browser's IndexedDB.
                Your data cannot be scraped by insurance algorithms or 3rd-party
                trackers.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Library />
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] px-6 py-4 flex items-center justify-around gap-4 shadow-soft-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 transition-colors ${activeTab === 'dashboard' ? 'text-[#F26101]' : 'text-slate-400'}`}
          >
            <Calendar size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`p-2 transition-colors ${activeTab === 'calc' ? 'text-[#F26101]' : 'text-slate-400'}`}
          >
            <Calculator size={24} strokeWidth={activeTab === 'calc' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`p-2 transition-colors ${activeTab === 'health' ? 'text-[#F26101]' : 'text-slate-400'}`}
          >
            <Activity size={24} strokeWidth={activeTab === 'health' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`p-2 transition-colors ${activeTab === 'goals' ? 'text-[#F26101]' : 'text-slate-400'}`}
          >
            <Target size={24} strokeWidth={activeTab === 'goals' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-[#F26101]' : 'text-slate-400'}`}
          >
            <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          </button>
        </div>
      </div>

      {showScrollUp && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-24 md:bottom-8 z-50 p-3 bg-[#F26101] text-white rounded-full shadow-soft-lg hover:bg-[#D95400] transition-all hover:scale-110 active:scale-95"
          title="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="fixed right-6 bottom-32 md:bottom-20 z-50 p-3 bg-[#F26101] text-white rounded-full shadow-soft-lg hover:bg-[#D95400] transition-all hover:scale-110 active:scale-95"
          title="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}

      <MedicalDisclaimerFooter />
    </div>
  );
}

