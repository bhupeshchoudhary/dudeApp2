import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { databases, appwriteConfig } from './appwrite';
import { ID, Query } from 'react-native-appwrite';
import { NotificationData, FCMToken, PushNotification } from '../types/notificationTypes';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(userId: string) {
    this.userId = userId;
    
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get FCM token (Android only)
      if (Device.isDevice && Platform.OS === 'android') {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: '4d06dd8d-5d6e-4333-bcc9-d5d7a21e0305', // Your EAS project ID
        });
        this.fcmToken = token.data;
        console.log('FCM Token:', this.fcmToken);
        
        // Save token to Appwrite
        await this.saveFCMToken();
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Save FCM token to Appwrite
  private async saveFCMToken() {
    if (!this.fcmToken || !this.userId) return;

    try {
      // Check if token already exists
      const existingTokens = await databases.listDocuments(
        appwriteConfig.databaseId,
        'fcm_tokens', // You'll need to create this collection
        [
          Query.equal('userId', this.userId),
          Query.equal('deviceId', Device.osInternalBuildId || 'unknown')
        ]
      );

      const tokenData = {
        userId: this.userId,
        token: this.fcmToken,
        deviceId: Device.osInternalBuildId || 'unknown',
        platform: 'android',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingTokens.documents.length > 0) {
        // Update existing token
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'fcm_tokens',
          existingTokens.documents[0].$id,
          {
            token: this.fcmToken,
            updatedAt: new Date().toISOString(),
          }
        );
      } else {
        // Create new token
        await databases.createDocument(
          appwriteConfig.databaseId,
          'fcm_tokens',
          ID.unique(),
          tokenData
        );
      }

      console.log('FCM token saved to Appwrite');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners() {
    // Handle notification received while app is running
    Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification received:', notification);
      // You can handle the notification here (e.g., update UI, play sound)
    });

    // Handle notification response (when user taps notification)
    Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification response
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'order' && data?.orderId) {
      // Navigate to order details
      // You'll need to implement navigation logic here
      console.log('Navigate to order:', data.orderId);
    } else if (data?.type === 'product' && data?.productId) {
      // Navigate to product details
      console.log('Navigate to product:', data.productId);
    } else if (data?.type === 'category' && data?.categoryId) {
      // Navigate to category
      console.log('Navigate to category:', data.categoryId);
    }
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? true : false,
          priority: notification.priority || 'normal',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(notification: NotificationData, trigger: Notifications.NotificationTriggerInput) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? true : false,
          priority: notification.priority || 'normal',
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permissions status:', error);
      return 'denied';
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return 'denied';
    }
  }

  // Get FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Save notification to Appwrite (for notification history)
  async saveNotificationToHistory(notification: PushNotification) {
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        'notifications', // You'll need to create this collection
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
}

export default NotificationService; 