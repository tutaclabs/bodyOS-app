import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { chatWithBodyOS } from '../core/ai-bodyos-chat';
import { isBackendConfigured } from '../core/auth-api';
import { chatWithBodyOSBackend } from '../core/ai-backend';
import { pushChatHistory } from '../core/cloud';

const storage = new AsyncStorageAdapter();

export function BodyOSIntelligenceScreen() {
  const t = useTranslation();
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const savedHistory = await storage.load(STORAGE_KEYS.CHAT_HISTORY, []);
      if (savedHistory.length > 0) {
        setMessages(savedHistory);
      }
    })();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const apiKey = await storage.load(STORAGE_KEYS.OPENAI_API_KEY, '');
    if (!isBackendConfigured() && !apiKey) {
      setError(t.ai.research.addKey);
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    setError('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    await storage.save(STORAGE_KEYS.CHAT_HISTORY, newMessages);
    await pushChatHistory(newMessages).catch(() => {});

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
      await storage.save(STORAGE_KEYS.CHAT_HISTORY, updatedMessages);
      await pushChatHistory(updatedMessages).catch(() => {});
    } catch (err) {
      setError(err.message || 'Failed to get response.');
      const failedMessages = newMessages.slice(0, -1);
      setMessages(failedMessages);
      await storage.save(STORAGE_KEYS.CHAT_HISTORY, failedMessages);
      await pushChatHistory(failedMessages).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>🤖</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
              {t.ai.bodyos.title}
            </Text>
          </View>

          <View
            style={{
              height: 300,
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <ScrollView>
              {messages.length === 0 && (
                <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center', paddingVertical: 40 }}>
                  {t.ai.bodyos.placeholder}
                </Text>
              )}
              {messages.map((msg, idx) => (
                <View
                  key={idx}
                  style={{
                    marginBottom: 12,
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <View
                    style={{
                      maxWidth: '80%',
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: msg.role === 'user' ? theme.primary : theme.card,
                      borderWidth: msg.role === 'assistant' ? 1 : 0,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: msg.role === 'user' ? '#000000' : theme.text,
                        lineHeight: 18,
                      }}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
              {loading && (
                <View style={{ alignItems: 'flex-start', marginBottom: 12 }}>
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: theme.muted }}>{t.ai.bodyos.thinking}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {error && (
            <View
              style={{
                marginBottom: 12,
                padding: 12,
                backgroundColor: '#FEE2E2',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#FECACA',
              }}
            >
              <Text style={{ fontSize: 11, color: '#DC2626' }}>{error}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t.ai.bodyos.placeholder}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: theme.text,
                backgroundColor: '#fff',
              }}
              editable={!loading}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={loading || !message.trim()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: loading || !message.trim() ? '#E2E8F0' : theme.primary,
                borderRadius: 12,
                justifyContent: 'center',
                opacity: loading || !message.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>Send</Text>
              )}
            </Pressable>
          </View>
        </Card>
  );
}
