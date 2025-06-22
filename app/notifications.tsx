import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { useNotifications } from '../context/NotificationProvider';
import { PushNotification } from '../types/notificationTypes';
import { useRouter, useNavigation } from 'expo-router';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Notifications',
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () =>
        unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text className="text-blue-600 font-medium">Mark all read</Text>
          </TouchableOpacity>
        ),
      headerShown: true,
    });
  }, [navigation, unreadCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: PushNotification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.type === 'order' && notification.data?.orderId) {
      router.push(`/orders/${notification.data.orderId}`);
    } else if (notification.data?.type === 'product' && notification.data?.productId) {
      router.push(`/product/${notification.data.productId}`);
    } else if (notification.data?.type === 'category' && notification.data?.categoryId) {
      router.push(`/category/${notification.data.categoryId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'bag-outline';
      case 'product':
        return 'cube-outline';
      case 'promotion':
        return 'pricetag-outline';
      case 'general':
        return 'notifications-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#3B82F6';
      case 'product':
        return '#10B981';
      case 'promotion':
        return '#F59E0B';
      case 'general':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderNotificationItem = (notification: PushNotification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleNotificationPress(notification)}
      className={`p-4 border-b border-gray-100 ${
        !notification.read ? 'bg-blue-50' : 'bg-white'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: getNotificationColor(notification.type) + '20',
          }}
        >
          <Ionicons
            name={getNotificationIcon(notification.type) as any}
            size={20}
            color={getNotificationColor(notification.type)}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold text-gray-800 flex-1 mr-2">
              {notification.title}
            </Text>
            {!notification.read && (
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </View>

          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {notification.body}
          </Text>

          <Text className="text-gray-400 text-xs">
            {formatDate(notification.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="notifications-off" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
        No notifications yet
      </Text>
      <Text className="text-gray-400 text-center px-8">
        You'll see notifications about orders, promotions, and updates here
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E86A2B']}
            tintColor="#E86A2B"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          renderEmptyState()
        ) : (
          <View>
            {notifications.map(renderNotificationItem)}
            <View className="py-4">
              <Text className="text-center text-gray-400 text-sm">
                {notifications.length} notification
                {notifications.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen; 