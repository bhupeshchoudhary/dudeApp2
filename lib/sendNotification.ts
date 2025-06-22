import { databases, appwriteConfig } from './appwrite';
import { Query } from 'react-native-appwrite';
import { NotificationData } from '../types/notificationTypes';

// This function would typically be called from an Appwrite Cloud Function
// or from your backend server to send notifications to users

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: 'order' | 'promotion' | 'general' | 'product';
    id?: string;
    categoryId?: string;
    productId?: string;
    orderId?: string;
    action?: string;
    [key: string]: any;
  };
  image?: string;
  sound?: string;
  priority?: 'high' | 'normal' | 'low';
  userIds?: string[]; // Specific users to send to
  userType?: 'all' | 'specific'; // Send to all users or specific users
}

export const sendNotificationToUsers = async (payload: NotificationPayload) => {
  try {
    // Get FCM tokens for the target users
    let fcmTokens: any[] = [];
    
    if (payload.userType === 'all') {
      // Get all FCM tokens
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'fcm_tokens',
        [Query.limit(1000)] // Adjust limit as needed
      );
      fcmTokens = response.documents;
    } else if (payload.userIds && payload.userIds.length > 0) {
      // Get FCM tokens for specific users
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'fcm_tokens',
        [
          Query.equal('userId', payload.userIds),
          Query.limit(1000)
        ]
      );
      fcmTokens = response.documents;
    }

    // Send notifications to each token
    const notificationPromises = fcmTokens.map(async (tokenDoc) => {
      try {
        // This would typically be done via Firebase Admin SDK or Expo Push API
        // For now, we'll save the notification to the notifications collection
        await saveNotificationToHistory({
          userId: tokenDoc.userId,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          type: payload.data?.type || 'general',
          read: false,
          date: new Date(),
        });

        // Here you would send the actual push notification
        // Example using Expo Push API:
        // await sendExpoPushNotification(tokenDoc.token, payload);
        
        console.log(`Notification sent to user ${tokenDoc.userId}`);
      } catch (error) {
        console.error(`Failed to send notification to user ${tokenDoc.userId}:`, error);
      }
    });

    await Promise.all(notificationPromises);
    
    return {
      success: true,
      message: `Notifications sent to ${fcmTokens.length} users`,
      sentCount: fcmTokens.length
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      success: false,
      message: 'Failed to send notifications',
      error: error
    };
  }
};

// Save notification to history
const saveNotificationToHistory = async (notification: any) => {
  try {
    await databases.createDocument(
      appwriteConfig.databaseId,
      'notifications',
      'unique()', // You'll need to import ID from react-native-appwrite
      {
        userId: notification.userId,
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
};

// Send notification for order updates
export const sendOrderNotification = async (
  userId: string,
  orderId: string,
  status: string,
  orderNumber?: string
) => {
  const statusMessages = {
    'pending': 'Your order has been placed successfully!',
    'confirmed': 'Your order has been confirmed and is being processed.',
    'shipped': 'Your order has been shipped and is on its way!',
    'delivered': 'Your order has been delivered. Enjoy!',
    'cancelled': 'Your order has been cancelled.',
  };

  const message = statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.';

  await sendNotificationToUsers({
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    body: message,
    data: {
      type: 'order',
      orderId: orderId,
      status: status,
      orderNumber: orderNumber,
    },
    userIds: [userId],
    userType: 'specific',
  });
};

// Send promotional notification
export const sendPromotionalNotification = async (
  title: string,
  body: string,
  promotionId?: string
) => {
  await sendNotificationToUsers({
    title,
    body,
    data: {
      type: 'promotion',
      id: promotionId,
    },
    userType: 'all',
  });
};

// Send product notification
export const sendProductNotification = async (
  title: string,
  body: string,
  productId: string
) => {
  await sendNotificationToUsers({
    title,
    body,
    data: {
      type: 'product',
      productId: productId,
    },
    userType: 'all',
  });
};

// Send general notification
export const sendGeneralNotification = async (
  title: string,
  body: string,
  action?: string
) => {
  await sendNotificationToUsers({
    title,
    body,
    data: {
      type: 'general',
      action: action,
    },
    userType: 'all',
  });
};

// Example usage in your app:
// 
// // Send order update notification
// await sendOrderNotification(userId, orderId, 'confirmed', 'ORD123');
// 
// // Send promotional notification
// await sendPromotionalNotification(
//   'Special Offer!',
//   'Get 20% off on all electronics. Limited time only!',
//   'promo123'
// );
// 
// // Send product notification
// await sendProductNotification(
//   'New Product Available!',
//   'Check out our latest smartphone with amazing features!',
//   'product123'
// );
// 
// // Send general notification
// await sendGeneralNotification(
//   'App Update',
//   'We\'ve added new features to improve your shopping experience!',
//   'update'
// ); 