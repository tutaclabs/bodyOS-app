import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';

export function MedicalDisclaimerModal({ isOpen, onClose, onAccept }) {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-card-lg max-w-md w-full p-6 shadow-soft-lg border border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle className="text-amber-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {t.disclaimer.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.disclaimer.content}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-accent text-white py-2.5 rounded-button-pill font-semibold hover:bg-gradient-nuraform transition-colors"
          >
            {t.disclaimer.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MedicalDisclaimerFooter() {
  const t = useTranslation();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-4 px-6 mt-8">
      <p className="text-xs text-slate-500 text-center">
        {t.disclaimer.footer}
      </p>
    </footer>
  );
}
