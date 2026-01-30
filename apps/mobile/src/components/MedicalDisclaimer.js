import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import { theme } from '../ui/theme';

export function MedicalDisclaimerModal({ isOpen, onClose, onAccept }) {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 20,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <View
              style={{
                padding: 8,
                backgroundColor: '#FFFBEB',
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 8 }}>
                {t.disclaimer.title}
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 20 }}>
                {t.disclaimer.content}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onAccept}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 15 }}>
              {t.disclaimer.accept}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function MedicalDisclaimerFooter() {
  const t = useTranslation();

  return (
    <View
      style={{
        backgroundColor: '#F1F5F9',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 10, color: theme.muted, textAlign: 'center' }}>
        {t.disclaimer.footer}
      </Text>
    </View>
  );
}
