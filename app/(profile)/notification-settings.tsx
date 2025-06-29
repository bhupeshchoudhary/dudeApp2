import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useNotifications } from '../../context/NotificationProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationSettingsScreen = () => {
  const { notificationSettings, updateSettings, sendTestNotification } = useNotifications();
  const [sendingTest, setSendingTest] = useState(false);

  const handleToggle = async (key: keyof typeof notificationSettings, value: boolean) => {
    await updateSettings({ [key]: value });
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await sendTestNotification();
    } finally {
      setSendingTest(false);
    }
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: string;
  }) => (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon as any} size={20} color="#E86A2B" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800 mb-1">{title}</Text>
          <Text className="text-gray-500 text-sm">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#E86A2B' }}
        thumbColor={value ? '#ffffff' : '#ffffff'}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}


      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View className="mt-4">
          <View className="px-4 py-2 bg-gray-100">
            <Text className="text-gray-600 font-medium">General</Text>
          </View>
          
          <SettingItem
            title="Enable Notifications"
            description="Receive all types of notifications"
            value={notificationSettings.enabled}
            onToggle={(value) => handleToggle('enabled', value)}
            icon="notifications"
          />
          
          <SettingItem
            title="Sound"
            description="Play sound for notifications"
            value={notificationSettings.sound}
            onToggle={(value) => handleToggle('sound', value)}
            icon="volume-high"
          />
          
          <SettingItem
            title="Vibration"
            description="Vibrate for notifications"
            value={notificationSettings.vibration}
            onToggle={(value) => handleToggle('vibration', value)}
            icon="phone-portrait"
          />
        </View>

        {/* Notification Types */}
        <View className="mt-4">
          <View className="px-4 py-2 bg-gray-100">
            <Text className="text-gray-600 font-medium">Notification Types</Text>
          </View>
          
          <SettingItem
            title="Order Updates"
            description="Get notified about order status changes"
            value={notificationSettings.orderUpdates}
            onToggle={(value) => handleToggle('orderUpdates', value)}
            icon="bag"
          />
          
          <SettingItem
            title="Promotions"
            description="Receive offers and promotional notifications"
            value={notificationSettings.promotions}
            onToggle={(value) => handleToggle('promotions', value)}
            icon="pricetag"
          />
          
          <SettingItem
            title="Product Updates"
            description="Get notified about new products and updates"
            value={notificationSettings.productUpdates}
            onToggle={(value) => handleToggle('productUpdates', value)}
            icon="cube"
          />
          
          <SettingItem
            title="General Updates"
            description="Receive general app updates and announcements"
            value={notificationSettings.general}
            onToggle={(value) => handleToggle('general', value)}
            icon="information-circle"
          />
        </View>

      
        {/* Info Section */}
        <View className="mt-6 px-4 pb-8">
          <View className="bg-blue-50 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="ml-2 flex-1">
                <Text className="text-blue-800 font-medium mb-1">About Notifications</Text>
                <Text className="text-blue-700 text-sm">
                  Notifications help you stay updated with your orders, promotions, and app updates. 
                  You can customize which types of notifications you want to receive.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen; 