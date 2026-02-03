import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { WebLocalStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';
import { chatWithBodyOS } from '../core/ai-bodyos-chat.js';
import { isBackendConfigured } from '../core/auth-api.js';
import { chatWithBodyOSBackend } from '../core/ai-backend.js';

const storage = new WebLocalStorageAdapter();

export default function BodyOSIntelligence() {
  const t = useTranslation();
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedHistory = storage.load(STORAGE_KEYS.CHAT_HISTORY, []);
    if (savedHistory.length > 0) {
      setMessages(savedHistory);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const apiKey = storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!isBackendConfigured() && !apiKey) {
      setError(t.ai.research.addKey);
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    setError('');
    setLoading(true);

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    storage.save(STORAGE_KEYS.CHAT_HISTORY, newMessages);

    try {
      let assistantText = '';
      let updatedMessages = null;

      if (isBackendConfigured()) {
        const result = await chatWithBodyOSBackend(userMessage, language, messages);
        assistantText = result.assistantMessage;
        updatedMessages = Array.isArray(result.updatedHistory)
          ? result.updatedHistory
          : [...newMessages, { role: 'assistant', content: assistantText }];
      } else {
        assistantText = await chatWithBodyOS(userMessage, apiKey, language);
        updatedMessages = [...newMessages, { role: 'assistant', content: assistantText }];
      }

      setMessages(updatedMessages);
      storage.save(STORAGE_KEYS.CHAT_HISTORY, updatedMessages);
    } catch (err) {
      setError(err.message || 'Failed to get response.');
      const failedMessages = newMessages.slice(0, -1);
      setMessages(failedMessages);
      storage.save(STORAGE_KEYS.CHAT_HISTORY, failedMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-soft">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="text-[#FF4F41]" size={20} />
        <h2 className="text-lg font-bold text-slate-800">
          {t.ai.bodyos.title}
        </h2>
      </div>

      <div className="h-64 overflow-y-auto mb-4 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            {t.ai.bodyos.placeholder}
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#FF4F41]/10 rounded-full flex items-center justify-center shrink-0">
                <Bot className="text-[#FF4F41]" size={16} />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                <User className="text-slate-600" size={16} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-[#FF4F41]/10 rounded-full flex items-center justify-center shrink-0">
              <Bot className="text-[#FF4F41]" size={16} />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl">
              <p className="text-sm text-slate-500">{t.ai.bodyos.thinking}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder={t.ai.bodyos.placeholder}
          className="flex-1 p-3 border border-slate-200 rounded-button text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="p-3 bg-accent text-white rounded-button hover:bg-gradient-nuraform transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
