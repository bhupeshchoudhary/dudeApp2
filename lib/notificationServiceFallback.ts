import { Platform } from 'react-native';
import { databases, appwriteConfig } from './appwrite';
import { ID, Query } from 'react-native-appwrite';
import { NotificationData, FCMToken, PushNotification } from '../types/notificationTypes';

// Fallback notification service that doesn't use expo-notifications
// This can be used if expo-notifications causes build issues

class NotificationServiceFallback {
  private static instance: NotificationServiceFallback;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationServiceFallback {
    if (!NotificationServiceFallback.instance) {
      NotificationServiceFallback.instance = new NotificationServiceFallback();
    }
    return NotificationServiceFallback.instance;
  }

  // Initialize notification service
  async initialize(userId: string) {
    this.userId = userId;
    console.log('Notification service initialized (fallback mode)');
    return true;
  }

  // Send local notification (fallback - just log for now)
  async sendLocalNotification(notification: NotificationData) {
    try {
      console.log('Local notification (fallback):', notification.title, notification.body);
      // In a real implementation, you could use react-native-toast-message here
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    return 'granted'; // Assume granted for fallback
  }

  // Request notification permissions
  async requestPermissions() {
    return 'granted'; // Assume granted for fallback
  }

  // Get FCM token (fallback - return null)
  getFCMToken(): string | null {
    return null;
  }

  // Save notification to Appwrite (for notification history)
  async saveNotificationToHistory(notification: PushNotification) {
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        'notifications',
        ID.unique(),
        {
          userId: this.userId,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          type: notification.type,
          read: notification.read,
          date: notification.date.toISOString(),
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error saving notification to history:', error);
    }
  }

  // Get notification history from Appwrite
  async getNotificationHistory(limit: number = 50): Promise<PushNotification[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'notifications',
        [
          Query.equal('userId', this.userId || ''),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        title: doc.title,
        body: doc.body,
        data: doc.data,
        type: doc.type,
        read: doc.read,
        date: new Date(doc.date),
      }));
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'notifications',
        notificationId,
        {
          read: true,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const notifications = await this.getNotificationHistory(1000);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await this.markNotificationAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'notifications',
        [
          Query.equal('userId', this.userId || ''),
          Query.equal('read', false),
        ]
      );

      return response.documents.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Cancel all notifications (fallback - no-op)
  async cancelAllNotifications() {
    console.log('Cancel all notifications (fallback - no-op)');
  }

  // Schedule notification (fallback - just log)
  async scheduleNotification(notification: NotificationData, trigger: any) {
    console.log('Schedule notification (fallback):', notification.title);
  }
}

export default NotificationServiceFallback; 