import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';

import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { HealthScreen } from './src/screens/HealthScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MedicalDisclaimerModal, MedicalDisclaimerFooter } from './src/components/MedicalDisclaimer';
import { AsyncStorageAdapter } from './src/core/storage';
import { STORAGE_KEYS } from './src/core/keys';
import { useTranslation } from './src/hooks/useTranslation';
import { theme } from './src/ui/theme';
import { isCloudEnabled, pullRemoteState } from './src/core/cloud';
import { getMe, isBackendConfigured, logoutBackend } from './src/core/auth-api';

const Tab = createBottomTabNavigator();
const storage = new AsyncStorageAdapter();

// Wrapper component to pass onLogout prop
function ProfileScreenWrapper({ onLogout }) {
  return <ProfileScreen onLogout={onLogout} />;
}

function Header({ onBackToLanding, onLogout }) {
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 14),
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.bg
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          onPress={onBackToLanding}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#000000', fontWeight: '900' }}>L</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text }}>{t.app.name}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => setLanguage(language === 'en' ? 'pt' : 'en')}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: theme.card,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>
              {language === 'en' ? 'EN' : 'PT'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onLogout}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#FEE2E2',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>Logout</Text>
          </Pressable>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: theme.emeraldBg,
              borderWidth: 1,
              borderColor: '#D1FAE5'
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '900', color: theme.emeraldText }}>
              {isCloudEnabled() ? 'CLOUD SYNC' : 'LOCAL-ONLY STORAGE'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const currentUser = await storage.load(STORAGE_KEYS.CURRENT_USER, null);
      let authed = Boolean(currentUser);

      if (isBackendConfigured()) {
        const me = await getMe();
        authed = Boolean(me);
        if (authed) {
          try {
            await pullRemoteState();
          } catch {
            // ignore pull errors on boot
          }
        }
      }

      if (authed) {
        setIsAuthenticated(true);
        const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
        if (!settings.onboarding?.completed) {
          setShowOnboarding(true);
          setShowLanding(false);
          setShowLogin(false);
        } else if (!settings.disclaimerAccepted) {
          setShowDisclaimer(true);
          setShowLanding(false);
        } else {
          setShowLanding(false);
        }
      }
    })();
  }, []);

  const handleEnterApp = () => {
    setShowLanding(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    if (isBackendConfigured()) {
      try {
        await pullRemoteState();
      } catch {
        // ignore pull errors; app still usable with local cache
      }
    }
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (!settings.onboarding?.completed) {
      setShowOnboarding(true);
      return;
    }
    if (!settings.disclaimerAccepted) {
      setShowDisclaimer(true);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    if (!settings.disclaimerAccepted) {
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = async () => {
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    settings.disclaimerAccepted = true;
    await storage.save(STORAGE_KEYS.USER_SETTINGS, settings);
    setShowDisclaimer(false);
  };

  const handleLogout = useCallback(async () => {
    if (isBackendConfigured()) {
      await logoutBackend();
    } else {
      await storage.save(STORAGE_KEYS.CURRENT_USER, null);
      await storage.save(STORAGE_KEYS.AUTH_TOKEN, null);
    }
    setIsAuthenticated(false);
    setShowLanding(true);
    setShowLogin(false);
    setShowOnboarding(false);
  }, []);

  const ProfileTabComponent = useMemo(() => {
    return () => <ProfileScreen onLogout={handleLogout} />;
  }, [handleLogout]);

  if (showLanding) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
        <LandingScreen onEnterApp={handleEnterApp} />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  if (showLogin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onBack={() => {
            setShowLogin(false);
            setShowLanding(true);
          }}
        />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <MedicalDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccept={handleAcceptDisclaimer}
      />
      <Header 
        onBackToLanding={() => {
          setShowLanding(true);
          setShowLogin(false);
          setShowOnboarding(false);
        }} 
        onLogout={handleLogout}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.muted,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.bg,
              borderRadius: 0,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              height: 70,
              paddingBottom: 8,
              paddingTop: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
              marginTop: 4
            }
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }}
          />
          <Tab.Screen 
            name="Tools" 
            component={ToolsScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛠️</Text> }}
          />
          <Tab.Screen 
            name="Health" 
            component={HealthScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>💊</Text> }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileTabComponent}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <MedicalDisclaimerFooter />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
