export const NOTIFICATION_TYPES = {
  EXPIRATION_WARNING: 'expiration_warning',
  EXPIRATION_CRITICAL: 'expiration_critical',
  ROTATION_REMINDER: 'rotation_reminder',
  SIDE_EFFECT_ALERT: 'side_effect_alert',
};

export function createNotification(type, title, message, data = {}) {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function markAsRead(notifications, notificationId) {
  return notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
}

export function markAllAsRead(notifications) {
  return notifications.map((n) => ({ ...n, read: true }));
}

export function removeNotification(notifications, notificationId) {
  return notifications.filter((n) => n.id !== notificationId);
}

export function getUnreadCount(notifications) {
  return notifications.filter((n) => !n.read).length;
}

export function filterNotifications(notifications, filters = {}) {
  let filtered = [...notifications];

  if (filters.unreadOnly) {
    filtered = filtered.filter((n) => !n.read);
  }

  if (filters.type) {
    filtered = filtered.filter((n) => n.type === filters.type);
  }

  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
