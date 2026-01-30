import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WebLocalStorageAdapter } from '../core/storage.js';
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

const storage = new WebLocalStorageAdapter();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = storage.load(STORAGE_KEYS.NOTIFICATIONS, []);
    setNotifications(saved);
  }, []);

  const saveNotifications = useCallback((newNotifications) => {
    setNotifications(newNotifications);
    storage.save(STORAGE_KEYS.NOTIFICATIONS, newNotifications);
  }, []);

  const addNotification = useCallback(
    (type, title, message, data) => {
      const notification = createNotification(type, title, message, data);
      const updated = [notification, ...notifications];
      saveNotifications(updated);
      return notification;
    },
    [notifications, saveNotifications]
  );

  const markNotificationAsRead = useCallback(
    (notificationId) => {
      const updated = markAsRead(notifications, notificationId);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    const updated = markAllAsRead(notifications);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(
    (notificationId) => {
      const updated = removeNotification(notifications, notificationId);
      saveNotifications(updated);
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
