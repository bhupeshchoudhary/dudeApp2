export interface NotificationData {
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
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  date: Date;
  read: boolean;
  type: 'order' | 'promotion' | 'general' | 'product';
}

export interface NotificationSettings {
  enabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  general: boolean;
  productUpdates: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface FCMToken {
  userId: string;
  token: string;
  deviceId: string;
  platform: 'android';
  createdAt: Date;
  updatedAt: Date;
} 