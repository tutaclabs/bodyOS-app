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
      setExpiring(data.expiring || []);
      setExpired(data.expired || []);

      data.expired.forEach((protocol) => {
        addNotification(
          NOTIFICATION_TYPES.EXPIRATION_CRITICAL,
          t.expirationAlerts.expiredTitle,
          t.expirationAlerts.expiredMessage.replace('{name}', protocol.name || 'Protocol'),
          { protocolId: protocol.id }
        );
      });

      data.expiring.forEach((protocol) => {
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
    } catch (err) {
      console.error('Failed to check expiring protocols:', err);
    } finally {
      setLoading(false);
    }
  };

  const notifications = getFilteredNotifications({
    type: [NOTIFICATION_TYPES.EXPIRATION_WARNING, NOTIFICATION_TYPES.EXPIRATION_CRITICAL],
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
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertTriangle
            size={18}
            className={
              notification.type === NOTIFICATION_TYPES.EXPIRATION_CRITICAL
                ? 'text-red-600 mt-0.5'
                : 'text-amber-600 mt-0.5'
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
