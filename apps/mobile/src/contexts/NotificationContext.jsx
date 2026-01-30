import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AsyncStorageAdapter } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/keys.js';
import {
  createNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  getUnreadCount,
  filterNotifications,
} from '../core/notifications.js';

const NotificationContext = createContext();

const storage = new AsyncStorageAdapter();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await storage.load(STORAGE_KEYS.NOTIFICATIONS, []);
      setNotifications(saved);
    })();
  }, []);

  const saveNotifications = useCallback(async (newNotifications) => {
    setNotifications(newNotifications);
    await storage.save(STORAGE_KEYS.NOTIFICATIONS, newNotifications);
  }, []);

  const addNotification = useCallback(
    async (type, title, message, data) => {
      const notification = createNotification(type, title, message, data);
      const updated = [notification, ...notifications];
      await saveNotifications(updated);
      return notification;
    },
    [notifications, saveNotifications]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      const updated = markAsRead(notifications, notificationId);
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    const updated = markAllAsRead(notifications);
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      const updated = removeNotification(notifications, notificationId);
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const getFilteredNotifications = useCallback(
    (filters) => {
      return filterNotifications(notifications, filters);
    },
    [notifications]
  );

  const unreadCount = getUnreadCount(notifications);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        getFilteredNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
