import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNotifications } from '../../../contexts/NotificationContext';
import { AsyncStorageAdapter } from '../../../core/storage';
import { STORAGE_KEYS } from '../../../core/keys';
import { NOTIFICATION_TYPES } from '../../../core/notifications';
import { theme } from '../../../ui/theme';

const storage = new AsyncStorageAdapter();

export function ExpirationNotifications() {
  const t = useTranslation();
  const { addNotification, getFilteredNotifications, markNotificationAsRead, deleteNotification } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExpiring();
    const interval = setInterval(checkExpiring, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkExpiring = async () => {
    try {
      setLoading(true);
      const protocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []) || [];
      if (!Array.isArray(protocols)) return;

      const now = new Date();
      const lowStock = [];
      const expiring28 = [];
      const expired28 = [];
      const expiring = [];
      const expired = [];

      protocols.forEach((protocol) => {
        if (protocol.expirationDate) {
          const expDate = new Date(protocol.expirationDate);
          const daysUntilExpiry = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 0) {
            expired.push({ ...protocol, daysUntilExpiry });
          } else if (daysUntilExpiry <= 7) {
            expiring.push({ ...protocol, daysUntilExpiry });
          }
        }

        if (protocol.vial_opened_date) {
          const openedDate = new Date(protocol.vial_opened_date);
          const daysSinceOpened = Math.floor((now.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceOpened >= 28) {
            expired28.push({ ...protocol, daysSinceOpened });
          } else if (daysSinceOpened >= 21) {
            expiring28.push({ ...protocol, daysSinceOpened, daysUntilExpiry: 28 - daysSinceOpened });
          }
        }

        if (protocol.current_inventory_ml != null) {
          const inventory = Number(protocol.current_inventory_ml);
          if (Number.isFinite(inventory) && inventory <= 1) {
            lowStock.push(protocol);
          }
        }
      });

      for (const protocol of expired) {
        await addNotification(
          NOTIFICATION_TYPES.EXPIRATION_CRITICAL,
          t.expirationAlerts.expiredTitle,
          t.expirationAlerts.expiredMessage.replace('{name}', protocol.name || 'Protocol'),
          { protocolId: protocol.id }
        );
      }

      for (const protocol of expiring) {
        if (protocol.daysUntilExpiry <= 7 && protocol.daysUntilExpiry > 0) {
          await addNotification(
            NOTIFICATION_TYPES.EXPIRATION_WARNING,
            t.expirationAlerts.expiringTitle,
            t.expirationAlerts.expiringMessage
              .replace('{name}', protocol.name || 'Protocol')
              .replace('{days}', protocol.daysUntilExpiry),
            { protocolId: protocol.id }
          );
        }
      }

      for (const protocol of expired28) {
        await addNotification(
          NOTIFICATION_TYPES.VIAL_EXPIRED_28,
          t.expirationAlerts.expiry28DayTitle,
          t.expirationAlerts.expiry28DayMessage.replace('{name}', protocol.name || 'Protocol'),
          { protocolId: protocol.id }
        );
      }

      for (const protocol of expiring28) {
        if (protocol.daysUntilExpiry <= 7 && protocol.daysUntilExpiry >= 0) {
          await addNotification(
            NOTIFICATION_TYPES.VIAL_EXPIRING_28,
            t.expirationAlerts.expiry28DayTitle,
            t.expirationAlerts.expiry28DayMessage.replace('{name}', protocol.name || 'Protocol'),
            { protocolId: protocol.id }
          );
        }
      }

      for (const protocol of lowStock) {
        const inventory = Number(protocol.current_inventory_ml);
        const inventoryDisplay = Number.isFinite(inventory) ? inventory.toFixed(1) : protocol.current_inventory_ml;
        await addNotification(
          NOTIFICATION_TYPES.LOW_STOCK,
          t.expirationAlerts.lowStockTitle,
          t.expirationAlerts.lowStockMessage
            .replace('{name}', protocol.name || 'Protocol')
            .replace('{ml}', inventoryDisplay ?? '1'),
          { protocolId: protocol.id }
        );
      }
    } catch (err) {
      console.error('Failed to check expiring protocols:', err);
    } finally {
      setLoading(false);
    }
  };

  const notifications = getFilteredNotifications({
    type: [
      NOTIFICATION_TYPES.EXPIRATION_WARNING,
      NOTIFICATION_TYPES.EXPIRATION_CRITICAL,
      NOTIFICATION_TYPES.VIAL_EXPIRING_28,
      NOTIFICATION_TYPES.VIAL_EXPIRED_28,
      NOTIFICATION_TYPES.LOW_STOCK
    ],
    unreadOnly: true,
    limit: 5,
  });

  if (notifications.length === 0 && !loading) {
    return null;
  }

  const getNotificationStyle = (type) => {
    if (type === NOTIFICATION_TYPES.EXPIRATION_CRITICAL || type === NOTIFICATION_TYPES.VIAL_EXPIRED_28) {
      return { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' };
    }
    if (type === NOTIFICATION_TYPES.LOW_STOCK) {
      return { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' };
    }
    return { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' };
  };

  const getNotificationTextColor = (type) => {
    if (type === NOTIFICATION_TYPES.EXPIRATION_CRITICAL || type === NOTIFICATION_TYPES.VIAL_EXPIRED_28) {
      return '#991B1B';
    }
    if (type === NOTIFICATION_TYPES.LOW_STOCK) {
      return '#92400E';
    }
    return '#1E40AF';
  };

  return (
    <View style={{ gap: 8 }}>
      {notifications.map((notification) => {
        const style = getNotificationStyle(notification.type);
        const textColor = getNotificationTextColor(notification.type);
        return (
          <View
            key={notification.id}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              ...style,
            }}
          >
            <Text style={{ fontSize: 18, color: textColor, marginTop: 2 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: textColor, marginBottom: 4 }}>
                {notification.title}
              </Text>
              <Text style={{ fontSize: 12, color: textColor }}>
                {notification.message}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                await markNotificationAsRead(notification.id);
                await deleteNotification(notification.id);
              }}
              style={{ padding: 4 }}
            >
              <Text style={{ fontSize: 16, color: textColor, fontWeight: '700' }}>×</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
