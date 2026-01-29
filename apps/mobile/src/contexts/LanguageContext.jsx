import React, { createContext, useContext, useState, useEffect } from 'react';
import { AsyncStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';

const LanguageContext = createContext();

const storage = new AsyncStorageAdapter();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    (async () => {
      const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
      if (settings.language) {
        setLanguageState(settings.language);
      }
    })();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.language = lang;
    await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
