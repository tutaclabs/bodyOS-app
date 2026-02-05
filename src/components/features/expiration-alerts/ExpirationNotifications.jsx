import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { useNotifications } from '../../../contexts/NotificationContext.jsx';
import { apiFetch } from '../../../core/api-client.js';
import { NOTIFICATION_TYPES } from '../../../core/notifications.js';

export function ExpirationNotifications() {
  const t = useTranslation();
  const { addNotification, getFilteredNotifications, markNotificationAsRead, deleteNotification } = useNotifications();
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExpiring();
    const interval = setInterval(checkExpiring, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkExpiring = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/v2/protocols/expiring');
      const expiringList = Array.isArray(data.expiring) ? data.expiring : [];
      const expiredList = Array.isArray(data.expired) ? data.expired : [];
      const lowStock = Array.isArray(data.lowStock) ? data.lowStock : [];
      const expiring28 = Array.isArray(data.expiring28) ? data.expiring28 : [];
      const expired28 = Array.isArray(data.expired28) ? data.expired28 : [];

      setExpiring(expiringList);
      setExpired(expiredList);

      expiredList.forEach((protocol) => {
        addNotification(
          NOTIFICATION_TYPES.EXPIRATION_CRITICAL,
          t.expirationAlerts.expiredTitle,
          t.expirationAlerts.expiredMessage.replace('{name}', protocol.name || 'Protocol'),
          { protocolId: protocol.id }
        );
      });

      expiringList.forEach((protocol) => {
        if (protocol.daysUntilExpiry <= 7 && protocol.daysUntilExpiry > 0) {
          addNotification(
            NOTIFICATION_TYPES.EXPIRATION_WARNING,
            t.expirationAlerts.expiringTitle,
            t.expirationAlerts.expiringMessage
              .replace('{name}', protocol.name || 'Protocol')
              .replace('{days}', protocol.daysUntilExpiry),
            { protocolId: protocol.id }
          );
        }
      });

      expired28.forEach((protocol) => {
        addNotification(
          NOTIFICATION_TYPES.VIAL_EXPIRED_28,
          t.expirationAlerts.vialExpiredTitle,
          t.expirationAlerts.vialExpiredMessage.replace('{name}', protocol.name || 'Protocol'),
          { protocolId: protocol.id }
        );
      });

      expiring28.forEach((protocol) => {
        if (protocol.daysUntilExpiry <= 7 && protocol.daysUntilExpiry >= 0) {
          addNotification(
            NOTIFICATION_TYPES.VIAL_EXPIRING_28,
            t.expirationAlerts.vialExpiringTitle,
            t.expirationAlerts.vialExpiringMessage
              .replace('{name}', protocol.name || 'Protocol')
              .replace('{days}', protocol.daysUntilExpiry),
            { protocolId: protocol.id }
          );
        }
      });

      lowStock.forEach((protocol) => {
        const inventory = Number(protocol.current_inventory_ml);
        const inventoryDisplay = Number.isFinite(inventory) ? inventory.toFixed(1) : protocol.current_inventory_ml;
        addNotification(
          NOTIFICATION_TYPES.LOW_STOCK,
          t.expirationAlerts.lowStockTitle,
          t.expirationAlerts.lowStockMessage
            .replace('{name}', protocol.name || 'Protocol')
            .replace('{ml}', inventoryDisplay ?? '1'),
          { protocolId: protocol.id }
        );
      });
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

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border flex items-start gap-3 ${
            notification.type === NOTIFICATION_TYPES.EXPIRATION_CRITICAL
              || notification.type === NOTIFICATION_TYPES.VIAL_EXPIRED_28
              ? 'bg-red-50 border-red-200'
              : notification.type === NOTIFICATION_TYPES.LOW_STOCK
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
          }`}
        >
          <AlertTriangle
            size={18}
            className={
              notification.type === NOTIFICATION_TYPES.EXPIRATION_CRITICAL
                || notification.type === NOTIFICATION_TYPES.VIAL_EXPIRED_28
                ? 'text-red-600 mt-0.5'
                : notification.type === NOTIFICATION_TYPES.LOW_STOCK
                  ? 'text-amber-600 mt-0.5'
                  : 'text-blue-600 mt-0.5'
            }
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
            <p className="text-xs text-slate-600">{notification.message}</p>
          </div>
          <button
            onClick={() => {
              markNotificationAsRead(notification.id);
              deleteNotification(notification.id);
            }}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
