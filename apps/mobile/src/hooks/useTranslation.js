import { useLanguage } from '../contexts/LanguageContext.jsx';
import { en } from '../locales/en.js';
import { pt } from '../locales/pt.js';

const translations = { en, pt };

export function useTranslation() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return t;
}
