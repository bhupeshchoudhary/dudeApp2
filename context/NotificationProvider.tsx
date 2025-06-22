import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGlobalContext } from './GlobalProvider';
import { PushNotification, NotificationSettings } from '../types/notificationTypes';

interface NotificationContextType {
  notifications: PushNotification[];
  unreadCount: number;
  notificationSettings: NotificationSettings;
  initializeNotifications: (userId: string) => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  orderUpdates: true,
  promotions: true,
  general: true,
  productUpdates: true,
  sound: true,
  vibration: true,
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useGlobalContext();

  // Initialize notifications when user logs in
  useEffect(() => {
    if (user?.$id && !isInitialized) {
      initializeNotifications(user.$id);
    }
  }, [user, isInitialized]);

  const initializeNotifications = async (userId: string): Promise<boolean> => {
    try {
      console.log('Notification system initialized (simplified mode)');
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  };

  const refreshNotifications = async () => {
    try {
      // Simplified - just set empty arrays for now
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Mark as read:', notificationId);
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Mark all as read');
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      const newSettings = { ...notificationSettings, ...settings };
      setNotificationSettings(newSettings);
      console.log('Notification settings updated:', newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      console.log('Test notification sent (simplified mode)');
      // You can add a toast message here using react-native-toast-message
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    notificationSettings,
    initializeNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
    refreshNotifications,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 