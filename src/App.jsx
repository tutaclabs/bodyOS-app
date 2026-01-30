import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import LandingPage from './LandingPage.jsx';
import BodyOSApp from './BodyOSApp.jsx';
import Onboarding from './components/Onboarding.jsx';
import { WebLocalStorageAdapter } from './core/storage.js';
import { STORAGE_KEYS } from './core/keys.js';

const storage = new WebLocalStorageAdapter();

function ProtectedApp() {
  const location = useLocation();
  const settings = storage.load(STORAGE_KEYS.USER_SETTINGS, {});
  if (!settings.onboarding?.completed) {
    return <Onboarding />;
  }
  return <BodyOSApp />;
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app/*" element={<ProtectedApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}

