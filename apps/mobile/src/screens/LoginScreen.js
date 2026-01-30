import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { isBackendConfigured, loginWithBackend, registerWithBackend } from '../core/auth-api';
import { theme } from '../ui/theme';
import { apiRequest } from '../core/api';

const storage = new AsyncStorageAdapter();

export function LoginScreen({ onLoginSuccess, onBack }) {
  const t = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isBackendConfigured()) {
        if (isSignUp) {
          await registerWithBackend(email, password);
          Alert.alert('Success', 'Account created!');
        } else {
          await loginWithBackend(email, password);
        }
        onLoginSuccess();
        return;
      }

      if (isSignUp) {
        const response = await apiRequest('/auth/signup', {
          method: 'POST',
          body: {
            email: email.toLowerCase(),
            password: password,
          },
        });
        
        const userData = {
          email: response.user?.email || email.toLowerCase(),
          id: response.user?.id || response.user?._id,
          token: response.token,
          ...response.user,
        };
        
        await storage.save(STORAGE_KEYS.CURRENT_USER, userData);
        if (response.token) {
          await storage.save(STORAGE_KEYS.AUTH_TOKEN, response.token);
        }
        Alert.alert('Success', 'Account created!');
        onLoginSuccess();
      } else {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: {
            email: email.toLowerCase(),
            password: password,
          },
        });
        
        const userData = {
          email: response.user?.email || email.toLowerCase(),
          id: response.user?.id || response.user?._id,
          token: response.token,
          ...response.user,
        };
        
        await storage.save(STORAGE_KEYS.CURRENT_USER, userData);
        if (response.token) {
          await storage.save(STORAGE_KEYS.AUTH_TOKEN, response.token);
        }
        onLoginSuccess();
      }
    } catch (error) {
      const msg =
        typeof error?.message === 'string' ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 24, paddingTop: 60 }}
    >
      {onBack && (
        <Pressable
          onPress={onBack}
          style={{
            marginBottom: 20,
            padding: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>← Back</Text>
        </Pressable>
      )}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View
          style={{
            width: 64,
            height: 64,
            backgroundColor: theme.primary,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#000000', fontSize: 32, fontWeight: '900' }}>L</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, marginBottom: 8 }}>
          {t.app.name}
        </Text>
        <Text style={{ fontSize: 16, color: theme.muted }}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </Text>
      </View>

      <View style={{ gap: 20 }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            Email
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#8B949E"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
                borderBottomWidth: focusedInput === 'email' ? 2 : 0,
                borderBottomColor: focusedInput === 'email' ? theme.primary : 'transparent',
              }}
            />
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            Password
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#8B949E"
              secureTextEntry
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
                borderBottomWidth: focusedInput === 'password' ? 2 : 0,
                borderBottomColor: focusedInput === 'password' ? theme.primary : 'transparent',
              }}
            />
          </View>
        </View>

        {isSignUp && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
              Confirm Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#8B949E"
                secureTextEntry
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: theme.text,
                  borderBottomWidth: focusedInput === 'confirmPassword' ? 2 : 0,
                  borderBottomColor: focusedInput === 'confirmPassword' ? theme.primary : 'transparent',
                }}
              />
            </View>
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            paddingVertical: 16,
            backgroundColor: loading ? theme.card : theme.primary,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: loading ? theme.muted : '#000000', fontWeight: '800', fontSize: 16 }}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setIsSignUp(!isSignUp);
            setPassword('');
            setConfirmPassword('');
          }}
          style={{ alignItems: 'center', marginTop: 8 }}
        >
          <Text style={{ fontSize: 14, color: theme.primary, fontWeight: '700' }}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 32,
          padding: 16,
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', lineHeight: 16 }}>
          Connected to backend API. Your data is synced with the server.
        </Text>
      </View>
    </ScrollView>
  );
}
